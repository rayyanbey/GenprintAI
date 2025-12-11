import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const models = await getModels();
    const { Order, Product, Design } = models;

    const order = await Order.findOne({
      where: { 
        id: params.id,
        user_id: session.user.id 
      },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'category', 'price', 'image_url'],
          required: false,
        },
        {
          model: Design,
          attributes: ['id', 'title', 'description'],
          required: false,
        },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedOrder = {
      id: order.id,
      order_date: order.order_date,
      status: order.status,
      total_amount: parseFloat(order.total_amount),
      quantity: order.quantity,
      shipping_address: order.shipping_address,
      tracking_number: order.tracking_number,
      carrier: order.carrier,
      estimated_delivery: order.estimated_delivery,
      printful_order_id: order.printful_order_id,
      payment_intent_id: order.payment_intent_id,
      product_name: order.product_name,
      product_price: parseFloat(order.product_price),
      product_image: order.product_image,
      product: order.Product || null,
      design: order.Design || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}
