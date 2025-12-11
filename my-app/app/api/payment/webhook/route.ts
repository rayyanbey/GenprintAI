import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getModels } from '@/lib/db-dynamic';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const models = await getModels();
    const { Order, User } = models;

    // Update order status
    const orderId = paymentIntent.metadata.order_id;
    if (orderId) {
      const order = await Order.findByPk(orderId);
      
      if (order) {
        await order.update({
          status: 'paid',
          payment_intent_id: paymentIntent.id,
        });

        console.log(`Order ${orderId} marked as paid`);
        
        // Send confirmation email
        try {
          const user = await User.findByPk(order.user_id);
          if (user && user.email) {
            const { sendOrderConfirmationEmail } = await import('@/lib/email');
            await sendOrderConfirmationEmail(user.email, {
              orderId: order.id,
              orderDate: order.order_date,
              totalAmount: parseFloat(order.total_amount),
              items: [{
                name: order.product_name,
                quantity: order.quantity,
                price: parseFloat(order.product_price),
              }],
            });
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
        
        // TODO: Create Printful order
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const models = await getModels();
    const { Order } = models;

    const orderId = paymentIntent.metadata.order_id;
    if (orderId) {
      await Order.update(
        {
          status: 'payment_failed',
        },
        {
          where: { id: orderId },
        }
      );

      console.log(`Order ${orderId} payment failed`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
