import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

// GET - Fetch all user's designs with optional filtering
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
    const limit = parseInt(searchParams.get('limit') || '12');
    const filter = searchParams.get('filter') || 'all'; // all, shared, private
    const offset = (page - 1) * limit;

    // Get database models
    const models = await getModels();
    const { Design, CommunityPost, Template } = models;

    // Build query based on filter
    let includeOptions: any = [
      {
        model: Template,
        attributes: ['id', 'name'],
        required: false,
      },
    ];

    let whereClause: any = { user_id: session.user.id };

    if (filter === 'shared') {
      // Only designs that are shared to community
      includeOptions.push({
        model: CommunityPost,
        attributes: ['id', 'title', 'content', 'created_at'],
        required: true, // Inner join - only designs with community posts
      });
    } else if (filter === 'private') {
      // Only designs that are NOT shared to community
      includeOptions.push({
        model: CommunityPost,
        attributes: ['id'],
        required: false,
      });
      // We'll filter out designs with community posts in the query
      includeOptions[includeOptions.length - 1].where = { id: null };
      includeOptions[includeOptions.length - 1].required = false;
    } else {
      // All designs - include community post info if exists
      includeOptions.push({
        model: CommunityPost,
        attributes: ['id', 'title', 'content', 'created_at'],
        required: false,
      });
    }

    // Fetch user's designs
    const { count, rows: designs } = await Design.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // Format response
    const formattedDesigns = designs.map((design: any) => {
      const designData = design.get({ plain: true });
      const isShared = !!designData.CommunityPosts && designData.CommunityPosts.length > 0;
      
      return {
        id: designData.id,
        title: designData.title,
        description: designData.description,
        template_id: designData.template_id,
        created_at: designData.created_at,
        template: designData.Template ? {
          id: designData.Template.id,
          name: designData.Template.name,
        } : null,
        is_shared: isShared,
        community_post: isShared && designData.CommunityPosts[0] ? {
          id: designData.CommunityPosts[0].id,
          title: designData.CommunityPosts[0].title,
          content: designData.CommunityPosts[0].content,
          created_at: designData.CommunityPosts[0].created_at,
        } : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        designs: formattedDesigns,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
        filter,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch user designs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your designs', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a design
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
    const { design_id } = body;

    if (!design_id) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { Design } = models;

    // Find and delete the design
    const deleted = await Design.destroy({
      where: {
        id: design_id,
        user_id: session.user.id, // Ensure user owns the design
      },
    });

    if (deleted === 0) {
      return NextResponse.json(
        { error: 'Design not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Design deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete design error:', error);
    return NextResponse.json(
      { error: 'Failed to delete design', details: error.message },
      { status: 500 }
    );
  }
}
