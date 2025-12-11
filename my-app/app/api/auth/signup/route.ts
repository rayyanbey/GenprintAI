import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { models } from "@/src/db/db";
import nodemailer from "nodemailer";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, username } = validationResult.data;

    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verification_token = nanoid(32);
    const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const newUser = await models.User.create({
      id: nanoid(),
      username,
      email,
      password_hash,
      provider: "email",
      email_verified: false,
      verification_token,
      verification_token_expires,
      onboarding_completed: false,
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verification_token}`;

    console.log("📧 Attempting to send email...");
    console.log("From:", process.env.EMAIL_FROM);
    console.log("To:", email);
    console.log("SMTP configured:", !!process.env.SMTP_USER);

    try {
      const emailResponse = await transporter.sendMail({
        from: `Genprint AI <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Verify your email - Genprint AI",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #EA7052 0%, #1A1A2E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 15px 30px; background: #EA7052; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Genprint AI!</h1>
                </div>
                <div class="content">
                  <p>Hi ${username},</p>
                  <p>Thank you for signing up for Genprint AI! We're excited to have you join our community of creative designers.</p>
                  <p>To complete your registration and start creating amazing designs, please verify your email address by clicking the button below:</p>
                  <center>
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </center>
                  <p>This link will expire in 24 hours.</p>
                  <p>If you didn't create an account with Genprint AI, you can safely ignore this email.</p>
                  <p>Best regards,<br>The Genprint AI Team</p>
                </div>
                <div class="footer">
                  <p>© 2025 Genprint AI. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      
      console.log("✅ Email sent successfully!", emailResponse.messageId);
    } catch (emailError: any) {
      console.error("❌ Error sending verification email:", emailError);
      console.error("Error details:", emailError?.message);
      // Don't fail the signup if email fails, just log it
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully! Please check your email to verify your account.",
        userId: (newUser as any).id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup. Please try again." },
      { status: 500 }
    );
  }
}
