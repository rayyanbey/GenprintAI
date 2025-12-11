import { NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';

// POST /api/printful/webhook - Handle Printful webhooks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Printful webhook received:', body);

    const { type, data } = body;

    switch (type) {
      case 'package_shipped':
        await handlePackageShipped(data);
        break;
      
      case 'package_returned':
        await handlePackageReturned(data);
        break;
      
      case 'order_failed':
        await handleOrderFailed(data);
        break;
      
      case 'order_canceled':
        await handleOrderCanceled(data);
        break;
      
      case 'product_synced':
        await handleProductSynced(data);
        break;
      
      default:
        console.log(`Unhandled Printful webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Printful webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handlePackageShipped(data: any) {
  try {
    const models = await getModels();
    const { Order } = models;

    const printfulOrderId = data.order?.id;
    if (!printfulOrderId) return;

    const order = await Order.findOne({
      where: { printful_order_id: printfulOrderId.toString() },
    });

    if (order) {
      const shipment = data.shipment || {};
      
      await order.update({
        status: 'shipped',
        tracking_number: shipment.tracking_number,
        carrier: shipment.carrier,
        estimated_delivery: shipment.estimated_delivery 
          ? new Date(shipment.estimated_delivery) 
          : null,
      });

      console.log(`Order ${order.id} marked as shipped`);
      
      // TODO: Send shipping notification email
    }
  } catch (error) {
    console.error('Error handling package shipped:', error);
  }
}

async function handlePackageReturned(data: any) {
  try {
    const models = await getModels();
    const { Order } = models;

    const printfulOrderId = data.order?.id;
    if (!printfulOrderId) return;

    const order = await Order.findOne({
      where: { printful_order_id: printfulOrderId.toString() },
    });

    if (order) {
      await order.update({
        status: 'returned',
      });

      console.log(`Order ${order.id} marked as returned`);
    }
  } catch (error) {
    console.error('Error handling package returned:', error);
  }
}

async function handleOrderFailed(data: any) {
  try {
    const models = await getModels();
    const { Order } = models;

    const printfulOrderId = data.order?.id;
    if (!printfulOrderId) return;

    const order = await Order.findOne({
      where: { printful_order_id: printfulOrderId.toString() },
    });

    if (order) {
      await order.update({
        status: 'failed',
      });

      console.log(`Order ${order.id} marked as failed`);
    }
  } catch (error) {
    console.error('Error handling order failed:', error);
  }
}

async function handleOrderCanceled(data: any) {
  try {
    const models = await getModels();
    const { Order } = models;

    const printfulOrderId = data.order?.id;
    if (!printfulOrderId) return;

    const order = await Order.findOne({
      where: { printful_order_id: printfulOrderId.toString() },
    });

    if (order) {
      await order.update({
        status: 'cancelled',
      });

      console.log(`Order ${order.id} marked as cancelled`);
    }
  } catch (error) {
    console.error('Error handling order canceled:', error);
  }
}

async function handleProductSynced(data: any) {
  try {
    const models = await getModels();
    const { Product } = models;

    const productId = data.sync_product?.id;
    if (!productId) return;

    // Update or create product in database
    const productData = {
      id: productId.toString(),
      name: data.sync_product.name,
      description: data.sync_product.description,
      // Add other fields as needed
    };

    await Product.upsert(productData);
    console.log(`Product ${productId} synced`);
  } catch (error) {
    console.error('Error handling product synced:', error);
  }
}
