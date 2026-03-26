import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getModels } from '@/lib/db-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_intent_client_secret } = body;

    if (!payment_intent_client_secret) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_intent_client_secret' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 1,
    });

    let paymentIntent = null;
    for (const pi of paymentIntents.data) {
      if (pi.client_secret === payment_intent_client_secret) {
        paymentIntent = pi;
        break;
      }
    }

    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Get order from metadata
    const orderId = paymentIntent.metadata?.order_id;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID not found in payment intent' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { Order, OrderItem, User } = models;

    const order = await Order.findByPk(orderId, {
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

    // Update order status if payment succeeded
    if (paymentIntent.status === 'succeeded' && order.status === 'pending_payment') {
      order.status = 'paid';
      await order.save();
    }

    const formattedOrder = {
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      total_amount: order.total_amount,
      status: order.status,
      shipping_address: order.shipping_address,
      items: (order.OrderItems || []).map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        variant_sku: item.variant_sku,
      })),
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
