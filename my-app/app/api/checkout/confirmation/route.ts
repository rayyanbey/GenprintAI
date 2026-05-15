import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getModels } from '@/lib/db-dynamic';
import { Op } from 'sequelize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_intent_client_secret, payment_intent_id } = body;

    if (!payment_intent_client_secret && !payment_intent_id) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_intent identifier' },
        { status: 400 }
      );
    }

    const resolvedPaymentIntentId = payment_intent_id || String(payment_intent_client_secret).split('_secret_')[0];
    const paymentIntent = await stripe.paymentIntents.retrieve(resolvedPaymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    const orderIdsFromMetadata = String(paymentIntent.metadata?.order_ids || '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    const orderIdFallback = String(paymentIntent.metadata?.order_id || '').trim();
    const orderIds = orderIdsFromMetadata.length > 0
      ? orderIdsFromMetadata
      : orderIdFallback
      ? [orderIdFallback]
      : [];

    const models = await getModels();
    const { Order, User } = models;

    let existingOrders: any[] = [];

    if (orderIds.length > 0) {
      const orders = await Promise.all(
        orderIds.map((orderId) =>
          Order.findByPk(orderId, {
            include: [{ model: User, attributes: ['id', 'username', 'email', 'full_name'] }],
          })
        )
      );
      existingOrders = orders.filter(Boolean);
    }

    // Fallback for older payment intents where metadata is missing.
    if (existingOrders.length === 0) {
      existingOrders = await Order.findAll({
        where: {
          [Op.or]: [{ payment_intent_id: paymentIntent.id }],
        },
        include: [{ model: User, attributes: ['id', 'username', 'email', 'full_name'] }],
      });
    }

    // Do not fail hard if order linkage is not present yet. Return payment status to UI.
    if (existingOrders.length === 0) {
      return NextResponse.json({
        success: true,
        payment_status: paymentIntent.status,
        payment_intent_id: paymentIntent.id,
        orders: [],
        warning: 'No linked orders found yet for this payment intent.',
      });
    }

    if (paymentIntent.status === 'succeeded') {
      for (const order of existingOrders) {
        const needsUpdate = order.status !== 'paid' || order.payment_intent_id !== paymentIntent.id;
        if (needsUpdate) {
          await order.update({
            status: 'paid',
            payment_intent_id: paymentIntent.id,
          });

          try {
              const userEmail = order.User?.email || paymentIntent.metadata?.user_email || '';
              if (userEmail) {
              const { sendOrderConfirmationEmail } = await import('@/lib/email');
              await sendOrderConfirmationEmail(userEmail, {
                orderId: order.id,
                orderDate: order.order_date,
                totalAmount: Number.parseFloat(String(order.total_amount || 0)),
                paymentIntentId: paymentIntent.id,
                items: [
                  {
                    name: order.product_name,
                    quantity: Number(order.quantity || 1),
                    price: Number.parseFloat(String(order.product_price || 0)),
                  },
                ],
              });
            }
          } catch (emailError) {
            console.error('Error sending confirmation email from confirmation route:', emailError);
          }
        }
      }
    }

    const formattedOrders = existingOrders.map((order: any) => ({
      id: order.id,
      created_at: order.createdAt,
      total_amount: order.total_amount,
      status: order.status,
      shipping_address: order.shipping_address,
      product_name: order.product_name,
      quantity: order.quantity,
    }));

    return NextResponse.json({
      success: true,
      payment_status: paymentIntent.status,
      payment_intent_id: paymentIntent.id,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
