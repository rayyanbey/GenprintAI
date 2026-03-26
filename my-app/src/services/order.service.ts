'use server';

import { getModels } from '@/lib/db-dynamic';
import { printful } from '@/src/utils/printful';

/**
 * Fetch an order with all related data
 */
export async function getOrderById(orderId: string, userId?: string) {
  try {
    const models = await getModels();
    const { Order } = models;

    const where: any = { id: orderId };
    if (userId) {
      where.user_id = userId; // Restrict to user's orders if userId provided
    }

    const order = await Order.findOne({ where });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    return {
      success: true,
      order: order.get({ plain: true }),
    };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user's orders with pagination
 */
export async function getUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const models = await getModels();
    const { Order } = models;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: userId },
      order: [['order_date', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      orders: orders.map((o: any) => o.get({ plain: true })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: error.message,
      orders: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  adminNotes?: string
) {
  try {
    const models = await getModels();
    const { Order } = models;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    const updateData: any = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    await order.update(updateData);

    return {
      success: true,
      order: order.get({ plain: true }),
    };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create Printful order from local order
 * Called after payment is confirmed
 */
export async function createPrintfulOrder(orderId: string) {
  try {
    const models = await getModels();
    const { Order } = models;

    // Fetch order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Order must be paid to create Printful order
    if (order.status !== 'paid') {
      return {
        success: false,
        error: `Order status is "${order.status}", must be "paid" to create Printful order`,
      };
    }

    // Don't create if already created
    if (order.printful_order_id) {
      return {
        success: false,
        error: 'Printful order already created for this order',
      };
    }

    // Parse shipping address
    let shippingAddress;
    try {
      shippingAddress = JSON.parse(order.shipping_address || '{}');
    } catch (e) {
      return {
        success: false,
        error: 'Invalid shipping address format',
      };
    }

    // Build Printful order payload
    const printfulOrderPayload = {
      recipient: {
        name: shippingAddress.name || 'Customer',
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        state_code: shippingAddress.state,
        state_name: shippingAddress.state,
        country_code: shippingAddress.country || 'US',
        zip: shippingAddress.zip,
        email: shippingAddress.email,
        phone: shippingAddress.phone || '',
      },
      items: [
        {
          product_id: parseInt(order.product_id.replace('printful_', '')),
          quantity: order.quantity,
        },
      ],
      shipping: 'STANDARD',
      production_delay: 0,
    };

    // Create order in Printful API
    const printfulResponse = await printful('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(printfulOrderPayload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!printfulResponse.result && !printfulResponse.id) {
      return {
        success: false,
        error: 'Failed to create Printful order',
        details: printfulResponse,
      };
    }

    // Update local order with Printful order ID
    const printfulOrderId = printfulResponse.result?.id || printfulResponse.id;
    await order.update({
      printful_order_id: printfulOrderId,
      status: 'processing',
      admin_notes: `Printful order created: #${printfulOrderId}`,
    });

    return {
      success: true,
      order: order.get({ plain: true }),
      printful_order_id: printfulOrderId,
    };
  } catch (error: any) {
    console.error('Error creating Printful order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    user_id?: string;
  }
) {
  try {
    const models = await getModels();
    const { Order } = models;

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.user_id) {
      where.user_id = filters.user_id;
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      order: [['order_date', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      orders: orders.map((o: any) => o.get({ plain: true })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
    return {
      success: false,
      error: error.message,
      orders: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}
