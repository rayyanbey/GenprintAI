import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { models } from "@/src/db/db";
import { auth } from "@/lib/auth";

const onboardingSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.number().min(13, "You must be at least 13 years old").max(120, "Invalid age"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = onboardingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { full_name, age, gender, avatar_url } = validationResult.data;

    // Update user profile
    await models.User.update(
      {
        full_name,
        age,
        gender,
        avatar_url: avatar_url || undefined,
        onboarding_completed: true,
      },
      { where: { id: session.user.id } }
    );

    // Fetch updated user
    const updatedUser = await models.User.findOne({
      where: { id: session.user.id },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = updatedUser.get({ plain: true }) as any;

    return NextResponse.json(
      {
        message: "Onboarding completed successfully!",
        user: {
          id: userData.id,
          full_name: userData.full_name,
          age: userData.age,
          gender: userData.gender,
          avatar_url: userData.avatar_url,
          onboarding_completed: userData.onboarding_completed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "An error occurred during onboarding. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await models.User.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = user.get({ plain: true }) as any;

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        age: userData.age,
        gender: userData.gender,
        avatar_url: userData.avatar_url,
        provider: userData.provider,
        onboarding_completed: userData.onboarding_completed,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
