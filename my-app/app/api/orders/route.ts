import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get database models
    const models = await getModels();
    const { Order, Product, Design } = models;

    // Fetch user's orders with related data
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: session.user.id },
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
      order: [['order_date', 'DESC']], // Most recent first
      limit,
      offset,
    });

    // Format response
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      order_date: order.order_date,
      status: order.status,
      total_amount: parseFloat(order.total_amount),
      quantity: order.quantity,
      shipping_address: order.shipping_address,
      product: {
        id: order.product_id,
        name: order.product_name,
        price: parseFloat(order.product_price),
        image: order.product_image,
        // Include current product data if available
        current_data: order.Product || null,
      },
      design: order.Design || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders,
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
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}
