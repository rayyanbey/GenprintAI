import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// Dynamic import helper to avoid edge runtime issues
async function getModels() {
  const { models } = await import("@/src/db/db");
  return models;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const models = await getModels();
        const user = await models.User.findOne({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log(`[AUTH] User not found for email: ${credentials.email}`);
          throw new Error("Invalid email or password");
        }

        const userData = user.get({ plain: true }) as any;
        console.log(`[AUTH] User found: ${userData.email}, verified: ${userData.email_verified}, has password: ${!!userData.password_hash}`);

        // Check if user has a password (not OAuth user)
        if (!userData.password_hash) {
          throw new Error("Please sign in with Google");
        }

        // Check if email is verified
        if (!userData.email_verified) {
          throw new Error("Please verify your email before logging in");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          userData.password_hash
        );

        console.log(`[AUTH] Password validation result: ${isPasswordValid}`);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await models.User.update(
          { last_login: new Date() },
          { where: { id: userData.id } }
        );

        return {
          id: userData.id,
          email: userData.email,
          name: userData.full_name || userData.username,
          image: userData.avatar_url,
          onboardingCompleted: userData.onboarding_completed,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const models = await getModels();
          // Check if user already exists
          let existingUser = await models.User.findOne({
            where: { email: user.email },
          });

          if (existingUser) {
            const existingData = existingUser.get({ plain: true }) as any;
            
            // Update Google ID if not set
            if (!existingData.google_id && account.providerAccountId) {
              await models.User.update(
                {
                  google_id: account.providerAccountId,
                  provider: "google",
                  email_verified: true,
                  avatar_url: user.image || existingData.avatar_url,
                  full_name: user.name || existingData.full_name,
                  last_login: new Date(),
                },
                { where: { id: existingData.id } }
              );
            } else {
              // Just update last login
              await models.User.update(
                { last_login: new Date() },
                { where: { id: existingData.id } }
              );
            }

            user.id = existingData.id;
            (user as any).onboardingCompleted = existingData.onboarding_completed;
          } else {
            // Create new user
            const newUser = await models.User.create({
              id: nanoid(),
              username: user.name || user.email?.split("@")[0] || "user",
              email: user.email,
              google_id: account.providerAccountId,
              provider: "google",
              email_verified: true,
              avatar_url: user.image,
              full_name: user.name,
              onboarding_completed: false,
              last_login: new Date(),
            });

            const newUserData = newUser.get({ plain: true }) as any;
            user.id = newUserData.id;
            (user as any).onboardingCompleted = false;
          }

          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id || '';
        token.onboardingCompleted = (user as any).onboardingCompleted;
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session) {
        token.onboardingCompleted = session.onboardingCompleted;
        token.name = session.name;
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, check if onboarding is completed
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect after sign in
      return `${baseUrl}/home`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
