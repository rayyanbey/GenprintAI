import { NextRequest, NextResponse } from "next/server";
import { models } from "@/src/db/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await models.User.findOne({
      where: { email },
      attributes: [
        'id',
        'username',
        'email',
        'email_verified',
        'provider',
        'created_at',
        'onboarding_completed'
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", exists: false },
        { status: 404 }
      );
    }

    const userData = user.get({ plain: true }) as any;

    return NextResponse.json({
      exists: true,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        emailVerified: userData.email_verified,
        provider: userData.provider,
        createdAt: userData.created_at,
        onboardingCompleted: userData.onboarding_completed,
        hasPassword: !!userData.password_hash,
      }
    });
  } catch (error) {
    console.error("User check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
