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
        
        // Auto-trigger Printful order creation
        try {
          await createPrintfulOrderFromPayment(order);
        } catch (printfulError) {
          console.error('Error creating Printful order:', printfulError);
          // Don't fail the webhook if Printful order creation fails
        }
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

async function createPrintfulOrderFromPayment(order: any) {
  try {
    const models = await getModels();
    const { Design } = models;
    const { printful } = await import('@/src/utils/printful');

    // Retrieve design to get artwork URL
    let artworkUrl = '';
    if (order.design_id) {
      const design = await Design.findByPk(order.design_id);
      if (design?.artwork_file_url) {
        artworkUrl = design.artwork_file_url;
      }
    }

    // Parse shipping address
    let shippingAddress;
    try {
      shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;
    } catch (e) {
      console.error('Invalid shipping address format:', e);
      shippingAddress = {};
    }

    // Create Printful order payload
    const printfulOrderData: any = {
      recipient: {
        name: shippingAddress.name || 'Customer',
        email: order.email || 'noreply@genprint.ai',
        address1: shippingAddress.address1 || '',
        city: shippingAddress.city || '',
        state_code: shippingAddress.state || '',
        country_code: shippingAddress.country || 'US',
        zip: shippingAddress.zip || '',
      },
      items: [
        {
          variant_id: parseInt(order.product_id),
          quantity: parseInt(order.quantity || 1),
          ...(artworkUrl && { files: [{ type: 'front', url: artworkUrl }] }),
        },
      ],
    };

    // Call Printful API to create order
    const printfulResponse = await printful('/orders', {
      method: 'POST',
      body: JSON.stringify(printfulOrderData),
    });

    const printfulOrder = printfulResponse.result || printfulResponse.data;

    if (printfulOrder?.id) {
      // Update order with Printful order ID
      await order.update({
        printful_order_id: printfulOrder.id,
        status: 'processing',
      });
      console.log(`Printful order created: ${printfulOrder.id} for order ${order.id}`);
    }
  } catch (error) {
    console.error('Error creating Printful order from payment:', error);
    // Re-throw to be caught by caller's error handler
    throw error;
  }
}
