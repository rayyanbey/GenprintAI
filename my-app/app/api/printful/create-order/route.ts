import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

// POST /api/printful/create-order - Create order in Printful
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await request.json();
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { Order, Design } = models;

    // Get order details
    const order = await Order.findByPk(order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Retrieve design and artwork URL if design_id exists
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
      return NextResponse.json(
        { error: 'Invalid shipping address format' },
        { status: 400 }
      );
    }

    // Create Printful order with design artwork if available
    const printfulOrderData: any = {
      recipient: {
        name: shippingAddress.name || session.user.name || 'Customer',
        email: session.user.email,
        address1: shippingAddress.address1 || '',
        city: shippingAddress.city || '',
        state_code: shippingAddress.state || '',
        country_code: shippingAddress.country || 'US',
        zip: shippingAddress.zip || '',
      },
      items: [
        {
          variant_id: parseInt(order.product_id),
          quantity: order.quantity,
          ...(artworkUrl && { files: [{ type: 'front', url: artworkUrl }] }),
        },
      ],
    };

    const printfulResponse = await printful('/orders', {
      method: 'POST',
      body: JSON.stringify(printfulOrderData),
    });

    const printfulOrder = printfulResponse.result || printfulResponse.data;

    // Update order with Printful order ID
    await order.update({
      printful_order_id: printfulOrder.id,
      status: 'processing',
    });

    return NextResponse.json({
      success: true,
      printful_order: printfulOrder,
      order_id: order.id,
    });
  } catch (error: any) {
    console.error('Printful order creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create Printful order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
