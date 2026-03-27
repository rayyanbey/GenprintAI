import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getModels } from '@/lib/db-dynamic';
import { Op } from 'sequelize';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const paymentIntentId = String(body?.payment_intent_id || '').trim();
    const orderIdsRaw = Array.isArray(body?.order_ids) ? body.order_ids : [];
    const orderIds = orderIdsRaw
      .map((id: unknown) => String(id).trim())
      .filter((id: string) => id.length > 0);

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'payment_intent_id is required' }, { status: 400 });
    }

    if (orderIds.length === 0) {
      return NextResponse.json({ error: 'order_ids must contain at least one order ID' }, { status: 400 });
    }

    const models = await getModels();
    const { Order } = models;

    const orders = await Order.findAll({
      where: {
        id: { [Op.in]: orderIds },
        user_id: session.user.id,
      },
    });

    if (orders.length !== orderIds.length) {
      return NextResponse.json(
        { error: 'Some orders were not found for the current user' },
        { status: 404 }
      );
    }

    await Promise.all(
      orders.map((order: any) =>
        order.update({
          payment_intent_id: paymentIntentId,
        })
      )
    );

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        user_id: session.user.id,
        user_email: session.user.email || '',
        order_id: orderIds[0],
        order_ids: orderIds.join(','),
      },
    });

    return NextResponse.json({
      success: true,
      payment_intent_id: paymentIntentId,
      order_ids: orderIds,
    });
  } catch (error: any) {
    console.error('Attach orders to payment intent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to attach orders to payment intent' },
      { status: 500 }
    );
  }
}
