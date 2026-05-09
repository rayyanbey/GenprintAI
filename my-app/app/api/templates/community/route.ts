import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';
import { Op } from 'sequelize';

/**
 * GET /api/templates/community
 * Fetch all approved community-shared templates with pagination
 * Query params: page, limit, category, sort (newest|popular)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest'; // newest or popular

    const offset = (page - 1) * limit;

    const models = await getModels();
    const { Template, User } = models;

    // Build where clause for approved community templates
    const whereClause: any = {
      is_community: true,
      approval_status: 'approved',
    };

    if (category && category.trim()) {
      whereClause.category = category;
    }

    // Determine order
    let orderClause: any = [['created_at', 'DESC']];
    if (sort === 'popular') {
      orderClause = [['usage_count', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows: templates } = await Template.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'avatar_url'],
          required: false,
        },
      ],
      order: orderClause,
      limit,
      offset,
    });

    const formattedTemplates = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      color_variants: t.color_variants || [],
      usage_count: t.usage_count,
      is_community: t.is_community,
      created_at: t.created_at,
      creator: t.dataValues.creator
        ? {
            id: t.dataValues.creator.id,
            full_name: t.dataValues.creator.full_name,
            username: t.dataValues.creator.username,
            avatar_url: t.dataValues.creator.avatar_url,
          }
        : null,
      metadata: t.metadata,
    }));

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching community templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community templates' },
      { status: 500 }
    );
  }
}
