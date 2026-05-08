import { NextResponse } from 'next/server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

// POST - Share a design to community
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to share designs.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { design_id, title, content } = body;

    // Validate required fields
    if (!design_id) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { Design, CommunityPost } = models;

    // Verify design exists and belongs to user
    const design = await Design.findOne({
      where: {
        id: design_id,
        user_id: session.user.id,
      },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found or you do not have permission to share it' },
        { status: 404 }
      );
    }

    // Check if design is already shared
    const existingPost = await CommunityPost.findOne({
      where: {
        design_id: design_id,
        user_id: session.user.id,
      },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'This design has already been shared to the community' },
        { status: 409 }
      );
    }

    // Create community post
    const communityPost = await CommunityPost.create({
      user_id: session.user.id,
      design_id: design_id,
      title: title.trim(),
      content: content?.trim() || '',
      created_at: new Date(),
    });

    await design.update({ is_community: true });

    return NextResponse.json(
      {
        success: true,
        message: 'Design shared to community successfully',
        post: {
          id: communityPost.id,
          design_id: communityPost.design_id,
          title: communityPost.title,
          content: communityPost.content,
          created_at: communityPost.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Share to community error:', error);
    return NextResponse.json(
      { error: 'Failed to share design to community', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch all community posts
export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get database models
    const models = await getModels();
    const { CommunityPost, Design, User, PostLike, CommunityComment, CommunityRating } = models;

    // Fetch community posts with related data
    const { count, rows: posts } = await CommunityPost.findAndCountAll({
      include: [
        {
          model: Design,
          attributes: ['id', 'title', 'description', 'artwork_file_url', 'template_id', 'created_at'],
          required: true,
        },
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'avatar_url'],
          required: true,
        },
      ],
      order: [['created_at', 'DESC']], // Most recent first
      limit,
      offset,
    });

    // Format response
    const session = await auth();
    const currentUserId = session?.user?.id || null;

    const formattedPosts = await Promise.all(posts.map(async (post: any) => {
      const [likes, comments, ratings, likedByMe] = await Promise.all([
        PostLike.count({ where: { post_id: post.id } }),
        CommunityComment.count({ where: { post_id: post.id } }),
        CommunityRating.findAll({ where: { post_id: post.id }, attributes: ['rating'] }),
        currentUserId
          ? PostLike.findOne({ where: { post_id: post.id, user_id: currentUserId } })
          : Promise.resolve(null),
      ]);
      const ratingValues = ratings.map((rating: any) => Number(rating.rating || 0));
      const averageRating = ratingValues.length
        ? ratingValues.reduce((sum: number, rating: number) => sum + rating, 0) / ratingValues.length
        : 0;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        likes,
        likedByMe: Boolean(likedByMe),
        comments,
        averageRating,
        ratingsCount: ratingValues.length,
        design: {
          id: post.Design?.id,
          title: post.Design?.title,
          description: post.Design?.description,
          artwork_file_url: post.Design?.artwork_file_url,
          template_id: post.Design?.template_id,
          created_at: post.Design?.created_at,
        },
        user: {
          id: post.User?.id,
          username: post.User?.username,
          full_name: post.User?.full_name,
          avatar_url: post.User?.avatar_url,
        },
      };
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
    console.error('Fetch community posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community posts', details: error.message },
      { status: 500 }
    );
  }
}
