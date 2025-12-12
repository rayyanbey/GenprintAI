import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.id}-${nanoid()}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file to local storage
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Generate public URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user's avatar_url in database
    const models = await getModels();
    await models.User.update(
      { avatar_url: avatarUrl },
      { where: { id: session.user.id } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Avatar uploaded successfully',
        avatar_url: avatarUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Update user's avatar_url to null in database
    const models = await getModels();
    await models.User.update(
      { avatar_url: null },
      { where: { id: session.user.id } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Avatar removed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar', details: error.message },
      { status: 500 }
    );
  }
}
