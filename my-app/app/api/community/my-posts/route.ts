import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

// GET - Fetch user's shared designs
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get database models
    const models = await getModels();
    const { CommunityPost, Design } = models;

    // Fetch user's community posts
    const { count, rows: posts } = await CommunityPost.findAndCountAll({
      where: { user_id: session.user.id },
      include: [
        {
          model: Design,
          attributes: ['id', 'title', 'description', 'template_id', 'created_at'],
          required: true,
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    // Format response
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      created_at: post.created_at,
      design: {
        id: post.Design?.id,
        title: post.Design?.title,
        description: post.Design?.description,
        template_id: post.Design?.template_id,
        created_at: post.Design?.created_at,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        posts: formattedPosts,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch user community posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your shared designs', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a shared design from community
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { CommunityPost } = models;

    // Find and delete the post
    const deleted = await CommunityPost.destroy({
      where: {
        id: post_id,
        user_id: session.user.id, // Ensure user owns the post
      },
    });

    if (deleted === 0) {
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Design removed from community successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete community post error:', error);
    return NextResponse.json(
      { error: 'Failed to remove design from community', details: error.message },
      { status: 500 }
    );
  }
}
