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
    const { product_id, design_id, quantity, shipping_address } = body;

    // Validate required fields
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { Product, Order } = models;

    // Fetch product details
    const product = await Product.findByPk(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate total amount
    const productPrice = parseFloat(product.price || 0);
    const orderQuantity = quantity || 1;
    const totalAmount = productPrice * orderQuantity;

    // Create order
    const orderId = nanoid();
    const order = await Order.create({
      id: orderId,
      user_id: session.user.id,
      product_id: product_id,
      design_id: design_id || null,
      order_date: new Date(),
      status: 'confirmed',
      total_amount: totalAmount,
      product_name: product.name,
      product_price: productPrice,
      product_image: product.image_url,
      shipping_address: shipping_address || null,
      quantity: orderQuantity,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully',
        order: {
          id: order.id,
          order_date: order.order_date,
          status: order.status,
          total_amount: order.total_amount,
          product_name: order.product_name,
          quantity: order.quantity,
        },
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
