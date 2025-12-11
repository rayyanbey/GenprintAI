import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
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
    const { items, shipping_address, total_amount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { Order } = models;

    // Create orders for each item (or you can create a single order with multiple items)
    const orders = [];
    
    for (const item of items) {
      const orderId = nanoid();
      const order = await Order.create({
        id: orderId,
        user_id: session.user.id,
        product_id: item.product_id,
        design_id: item.design_id || null,
        order_date: new Date(),
        status: 'pending_payment',
        total_amount: item.price * item.quantity,
        product_name: item.name,
        product_price: item.price,
        product_image: item.image_url,
        shipping_address: shipping_address ? JSON.stringify(shipping_address) : null,
        quantity: item.quantity,
      });
      
      orders.push({
        id: order.id,
        product_name: order.product_name,
        quantity: order.quantity,
        total_amount: order.total_amount,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Orders created successfully',
        orders,
        total_amount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error.message },
      { status: 500 }
    );
  }
}
