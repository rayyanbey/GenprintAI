import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

// POST /api/printful/sync-status - Sync order status from Printful
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
    const { Order } = models;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!order.printful_order_id) {
      return NextResponse.json(
        { error: 'No Printful order ID found' },
        { status: 400 }
      );
    }

    // Get Printful order status
    const printfulOrder = await printful(`/orders/${order.printful_order_id}`);
    const printfulData = printfulOrder.result || printfulOrder.data;

    // Update order status
    const updates: any = {
      status: printfulData.status,
    };

    // Check for shipment information
    if (printfulData.shipments && printfulData.shipments.length > 0) {
      const shipment = printfulData.shipments[0];
      updates.tracking_number = shipment.tracking_number;
      updates.carrier = shipment.carrier;
      updates.status = 'shipped';
      
      if (shipment.estimated_delivery) {
        updates.estimated_delivery = new Date(shipment.estimated_delivery);
      }
    }

    await order.update(updates);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: updates.status,
        tracking_number: updates.tracking_number,
        carrier: updates.carrier,
        estimated_delivery: updates.estimated_delivery,
      },
      printful_data: printfulData,
    });
  } catch (error: any) {
    console.error('Printful sync error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync order status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
