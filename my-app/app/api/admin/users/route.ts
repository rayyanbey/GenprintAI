import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSequelize } from '@/lib/db-dynamic';
import { Op } from 'sequelize';

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { User, Design, Order } = models;
    const sequelize = await getSequelize();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'verification_token'] }
    });

    // We can fetch design/order counts for these users
    // For large tables it would be a left join group by, but a simple lookup is fine for paginated 20 rows
    const userIds = users.map((u: any) => u.id);
    
    // Using aggregation instead of 40 separate queries
    const designsCount = await Design.findAll({
      where: { user_id: userIds },
      attributes: ['user_id', [sequelize.fn('COUNT', 'id'), 'count']],
      group: ['user_id'],
      raw: true
    });

    const ordersCount = await Order.findAll({
      where: { user_id: userIds },
      attributes: ['user_id', [sequelize.fn('COUNT', 'id'), 'count']],
      group: ['user_id'],
      raw: true
    });

    const formatCount = (arr: any[], id: string) => {
      const match = arr.find(a => a.user_id === id);
      return match ? parseInt(match.count, 10) : 0;
    };

    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.full_name || u.username,
      email: u.email,
      avatar: u.avatar_url,
      role: u.role,
      status: u.status,
      joined: new Date(u.created_at).toLocaleDateString(),
      designs: formatCount(designsCount, u.id),
      orders: formatCount(ordersCount, u.id)
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (error: any) {
    console.error('Admin Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const body = await request.json();
    const { id, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Prevent removing your own admin status accidentally
    if (id === authResult.session.user.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 403 });
    }

    await models.User.update(updates, { where: { id } });

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Admin User Update Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
