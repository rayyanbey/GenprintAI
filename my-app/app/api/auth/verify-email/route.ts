import { NextRequest, NextResponse } from "next/server";
import { models } from "@/src/db/db";
import { signIn } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=Invalid verification link", request.url)
      );
    }

    // Find user with this token
    const user = await models.User.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=Invalid or expired verification link", request.url)
      );
    }

    const userData = user.get({ plain: true }) as any;

    // Check if token is expired
    if (
      userData.verification_token_expires &&
      new Date(userData.verification_token_expires) < new Date()
    ) {
      return NextResponse.redirect(
        new URL("/login?error=Verification link has expired", request.url)
      );
    }

    // Check if already verified
    if (userData.email_verified) {
      return NextResponse.redirect(
        new URL("/login?message=Email already verified. Please log in.", request.url)
      );
    }

    // Update user - verify email and clear token
    await models.User.update(
      {
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      },
      { where: { id: userData.id } }
    );

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL(
        "/login?message=Email verified successfully! Please log in to continue to onboarding.",
        request.url
      )
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=An error occurred during verification", request.url)
    );
  }
}
