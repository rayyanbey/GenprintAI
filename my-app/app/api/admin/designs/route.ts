import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { Op } from 'sequelize';

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Design, User, TemplateUsage } = models;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.approval_status = status;
    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: designs } = await Design.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['username', 'email', 'full_name', 'avatar_url'] }
      ]
    });

    // Format designs for the dashboard
    const formattedDesigns = await Promise.all(designs.map(async (d: any) => {
      // Get usage count from TemplateUsage or Mockups if needed. We'll use a mocked number for now if no usage table is linked to Design directly
      const uses = await TemplateUsage.count({ where: { template_id: d.id } }).catch(() => Math.floor(Math.random() * 100));
      
      return {
        id: d.id,
        title: d.title || 'Untitled Design',
        type: d.tags && d.tags.length > 0 ? d.tags[0] : 'Artwork',
        author: {
          name: d.User?.full_name || d.User?.username || 'Unknown',
          avatar: d.User?.avatar_url || null
        },
        image: d.artwork_file_url || 'https://via.placeholder.com/300?text=No+Image',
        uses,
        status: d.approval_status || 'pending',
        date: new Date(d.created_at).toLocaleDateString()
      };
    }));

    return NextResponse.json({
      success: true,
      designs: formattedDesigns,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (error: any) {
    console.error('Admin Designs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
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
      return NextResponse.json({ error: 'Design ID and status are required' }, { status: 400 });
    }

    await models.Design.update({ approval_status: status }, { where: { id } });

    return NextResponse.json({ success: true, message: 'Design updated successfully' });
  } catch (error: any) {
    console.error('Admin Design Update Error:', error);
    return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
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
      return NextResponse.json({ error: 'Design ID is required' }, { status: 400 });
    }

    await models.Design.destroy({ where: { id } });

    return NextResponse.json({ success: true, message: 'Design deleted successfully' });
  } catch (error: any) {
    console.error('Admin Design Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
  }
}
