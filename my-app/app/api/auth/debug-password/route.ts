import { NextRequest, NextResponse } from "next/server";
import { models } from "@/src/db/db";
import bcrypt from "bcryptjs";

// REMOVE THIS FILE AFTER DEBUGGING - IT'S A SECURITY RISK
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await models.User.findOne({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found",
        debug: {
          userExists: false,
        }
      }, { status: 404 });
    }

    const userData = user.get({ plain: true }) as any;

    // Debug info
    const hasPasswordHash = !!userData.password_hash;
    const isEmailVerified = userData.email_verified;
    const provider = userData.provider;
    
    let passwordMatch = false;
    if (hasPasswordHash) {
      passwordMatch = await bcrypt.compare(password, userData.password_hash);
    }

    return NextResponse.json({
      debug: {
        userExists: true,
        email: userData.email,
        username: userData.username,
        provider: provider,
        hasPasswordHash: hasPasswordHash,
        isEmailVerified: isEmailVerified,
        passwordMatch: passwordMatch,
        passwordHashPrefix: hasPasswordHash ? userData.password_hash.substring(0, 10) + '...' : 'N/A',
        onboardingCompleted: userData.onboarding_completed,
      }
    });
  } catch (error: any) {
    console.error("Debug password error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
