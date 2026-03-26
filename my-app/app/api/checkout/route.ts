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
    const { items, shipping_address, total_amount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    // Get database models
    const models = await getModels();
    const { Order, Product, ProductVariant } = models;

    // Validate each item has variant selected and fetch variant price
    const validatedItems = [];
    
    for (const item of items) {
      // Variant is required since product price is now null
      if (!item.variant || !item.variant.sku) {
        return NextResponse.json(
          { error: `Item "${item.name}" is missing required variant selection. Please select size and color.` },
          { status: 400 }
        );
      }

      // Verify product exists
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" not found` },
          { status: 404 }
        );
      }

      // Try to find the variant in database
      const variant = await ProductVariant.findOne({
        where: {
          product_id: item.product_id,
          sku: item.variant.sku,
        },
      });

      let variantPrice = item.price; // Use cart item price as fallback

      // If variant found in DB, use its price
      if (variant) {
        variantPrice = parseFloat(variant.price || item.price);
        
        // Check availability
        if (variant.availability === false) {
          return NextResponse.json(
            {
              error: `"${item.name}" (${item.variant.size || ''} ${item.variant.color || ''}) is currently out of stock. Please choose a different variant.`,
            },
            { status: 400 }
          );
        }
      } else {
        // Variant not found in DB - could be a default variant
        // Use the price from cart item
        console.log(`⚠️ Variant ${item.variant.sku} not found in DB for product ${item.product_id}, using cart price: ${variantPrice}`);
      }

      validatedItems.push({
        ...item,
        variant_price: variantPrice,
      });
    }

    // Create orders for each item
    const orders = [];
    
    for (const item of validatedItems) {
      const orderId = nanoid();
      const order = await Order.create({
        id: orderId,
        user_id: session.user.id,
        product_id: item.product_id,
        design_id: item.design_id || null,
        order_date: new Date(),
        status: 'pending_payment',
        total_amount: item.variant_price * item.quantity,
        product_name: item.name,
        product_price: item.variant_price,
        product_image: item.image_url,
        shipping_address: shipping_address ? JSON.stringify(shipping_address) : null,
        quantity: item.quantity,
      });
      
      orders.push({
        id: order.id,
        product_name: order.product_name,
        quantity: order.quantity,
        total_amount: order.total_amount,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Orders created successfully',
        orders,
        total_amount: validatedItems.reduce((sum, item) => sum + (item.variant_price * item.quantity), 0),
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
