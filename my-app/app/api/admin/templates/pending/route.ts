import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/templates/pending
 * Get all pending community templates awaiting approval
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Template, User } = models;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: {
        is_community: true,
        approval_status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'email', 'avatar_url'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const formattedTemplates = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      usage_count: t.usage_count,
      is_community: t.is_community,
      approval_status: t.approval_status,
      created_at: t.created_at,
      creator: t.dataValues.creator
        ? {
            id: t.dataValues.creator.id,
            full_name: t.dataValues.creator.full_name,
            username: t.dataValues.creator.username,
            email: t.dataValues.creator.email,
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
    console.error('Error fetching pending templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending templates' },
      { status: 500 }
    );
  }
}
