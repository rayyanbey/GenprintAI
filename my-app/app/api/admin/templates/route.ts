import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { Op } from 'sequelize';

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Template, User } = models;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const isCommunity = searchParams.get('is_community');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (status) whereClause.approval_status = status;
    if (isCommunity === 'true') whereClause.is_community = true;
    if (isCommunity === 'false') whereClause.is_community = false;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      // We can't include User directly unless association is defined, but we'll try
    });

    // Formatting templates
    const formattedTemplates = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      uses: t.usage_count,
      isCommunity: t.is_community,
      status: t.approval_status,
      date: new Date(t.created_at).toLocaleDateString()
    }));

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (error: any) {
    console.error('Admin Templates API error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Template ID and status are required' }, { status: 400 });
    }

    await models.Template.update({ approval_status: status }, { where: { id } });

    return NextResponse.json({ success: true, message: 'Template updated successfully' });
  } catch (error: any) {
    console.error('Admin Template Update Error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await models.Template.destroy({ where: { id } });

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Admin Template Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
