import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import bcrypt from 'bcryptjs';

const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  age: z.number().min(13, 'You must be at least 13 years old').max(120, 'Invalid age').optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const models = await getModels();
    const user = await models.User.findOne({
      where: { id: session.user.id },
      attributes: [
        'id',
        'email',
        'username',
        'full_name',
        'age',
        'gender',
        'avatar_url',
        'provider',
        'onboarding_completed',
        'created_at',
        'last_login',
      ],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user.get({ plain: true }) as any;

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // If username is being updated, check if it's already taken
    if (updateData.username) {
      const models = await getModels();
      const existingUser = await models.User.findOne({
        where: {
          username: updateData.username,
          id: { [require('sequelize').Op.ne]: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const models = await getModels();
    await models.User.update(updateData, {
      where: { id: session.user.id },
    });

    // Fetch updated user
    const updatedUser = await models.User.findOne({
      where: { id: session.user.id },
      attributes: [
        'id',
        'email',
        'username',
        'full_name',
        'age',
        'gender',
        'avatar_url',
        'provider',
        'onboarding_completed',
      ],
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = updatedUser.get({ plain: true }) as any;

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: userData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Change password (for email/password users only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = passwordChangeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { current_password, new_password } = validationResult.data;

    // Get user
    const models = await getModels();
    const user = await models.User.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user.get({ plain: true }) as any;

    // Check if user uses email/password authentication
    if (userData.provider !== 'email' || !userData.password_hash) {
      return NextResponse.json(
        { error: 'Password change is only available for email/password accounts' },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, userData.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await models.User.update(
      { password_hash: hashedPassword },
      { where: { id: session.user.id } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password', details: error.message },
      { status: 500 }
    );
  }
}
