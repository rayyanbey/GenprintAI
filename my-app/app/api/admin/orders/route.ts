import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { Op } from 'sequelize';

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Order, User, Product } = models;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['order_date', 'DESC']],
      include: [
        { model: User, attributes: ['username', 'email', 'full_name'] },
        { model: Product, attributes: ['category'] }
      ]
    });

    const formattedOrders = orders.map((o: any) => {
      const u = o.User;
      return {
        id: o.id,
        user: {
          name: u?.full_name || u?.username || 'Unknown',
          email: u?.email || 'N/A'
        },
        product: o.product_name,
        category: o.Product?.category || 'Apparel',
        amount: parseFloat(o.total_amount || 0),
        status: o.status,
        paymentStatus: o.payment_intent_id ? 'paid' : 'unpaid',
        date: new Date(o.order_date).toLocaleDateString(),
        shippingAddress: o.shipping_address
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (error: any) {
    console.error('Admin Orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const body = await request.json();
    const { id, status, tracking_number, carrier } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const updates: any = { status };
    if (tracking_number) updates.tracking_number = tracking_number;
    if (carrier) updates.carrier = carrier;

    await models.Order.update(updates, { where: { id } });

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Admin Order Update Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
