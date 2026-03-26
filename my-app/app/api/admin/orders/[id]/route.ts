import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Order, User, OrderItem, ProductVariant } = models;

    const order = await Order.findByPk(params.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'full_name'] },
        {
          model: OrderItem,
          attributes: ['id', 'product_id', 'product_name', 'quantity', 'price', 'variant_sku'],
        },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      user_name: order.User?.full_name || order.User?.username || 'Unknown',
      user_email: order.User?.email || 'N/A',
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      updated_at: order.updated_at,
      printful_order_id: order.printful_order_id,
      admin_notes: order.admin_notes,
      shipping_address: order.shipping_address,
      items: order.OrderItems || [],
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { Order } = models;

    const body = await request.json();
    const { admin_notes } = body;

    // TODO: Add role checking to ensure admin has permission
    const order = await Order.findByPk(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (admin_notes !== undefined) {
      order.admin_notes = admin_notes;
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
