import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';

function seededFallbackPrice(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  // Stable pseudo-random range: $19.99 - $89.99
  const min = 19.99;
  const max = 89.99;
  const ratio = (hash % 10000) / 10000;
  return Number((min + ratio * (max - min)).toFixed(2));
}

function resolveCartPrice({
  variantPrice,
  productPrice,
  seed,
}: {
  variantPrice?: unknown;
  productPrice?: unknown;
  seed: string;
}): number {
  const variant = Number(variantPrice);
  if (Number.isFinite(variant) && variant > 0) {
    return variant;
  }

  const product = Number(productPrice);
  if (Number.isFinite(product) && product > 0) {
    return product;
  }

  return seededFallbackPrice(seed);
}

/**
 * GET /api/cart - Get user's cart items from database
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const models = await getModels();
    const { CartItem, Product, ProductVariant, Design } = models;

    // Fetch all cart items for user
    const cartItems = await CartItem.findAll({
      where: { user_id: session.user.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'image_url', 'category_id', 'price']
        },
        {
          model: ProductVariant,
          attributes: ['id', 'name', 'price', 'size', 'color', 'sku']
        },
        {
          model: Design,
          attributes: ['id', 'title', 'artwork_file_url', 'template_id']
        }
      ]
    });

    // Format response with pricing
    const formattedItems = cartItems.map((item: any) => {
      const itemData = item.get({ plain: true });
      
      const price = resolveCartPrice({
        variantPrice: itemData.ProductVariant?.price,
        productPrice: itemData.Product?.price,
        seed: `${itemData.id}:${itemData.product_id}:${itemData.design_id || 'no-design'}`,
      });

      return {
        id: itemData.id,
        product_id: itemData.product_id,
        product: itemData.Product,
        design_id: itemData.design_id,
        design: itemData.Design,
        quantity: itemData.quantity,
        variant: itemData.variant,
        price,
        item_total: price * itemData.quantity,
        created_at: itemData.createdAt
      };
    });

    const totalPrice = formattedItems.reduce((sum, item) => sum + item.item_total, 0);
    const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      items: formattedItems,
      summary: {
        total_items: totalItems,
        total_price: totalPrice,
        item_count: formattedItems.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Add item to cart
 * Body: { product_id, variant?, design_id?, quantity? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id, variant, design_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { CartItem, Product, ProductVariant } = models;

    // Verify product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If variant specified, verify it exists
    if (variant?.sku) {
      const variantRecord = await ProductVariant.findOne({
        where: { product_id, sku: variant.sku }
      });
      if (!variantRecord) {
        return NextResponse.json(
          { error: 'Variant not found for this product' },
          { status: 404 }
        );
      }
    }

    // Create unique cart item ID (product + variant + design combination)
    const cartItemId = uuidv4();
    
    // Check if same item already in cart (same product, variant, design)
    const existingItem = await CartItem.findOne({
      where: {
        user_id: session.user.id,
        product_id,
        design_id: design_id || null,
        variant: variant ? JSON.stringify(variant) : null
      }
    });

    if (existingItem) {
      // Update quantity instead
      await existingItem.update({
        quantity: existingItem.quantity + quantity
      });

      return NextResponse.json(
        { success: true, message: 'Updated cart item quantity', item: existingItem },
        { status: 200 }
      );
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      id: cartItemId,
      user_id: session.user.id,
      product_id,
      design_id: design_id || null,
      quantity,
      variant: variant || null
    });

    return NextResponse.json(
      { success: true, message: 'Item added to cart', item: cartItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart - Update cart item quantity
 * Body: { cart_item_id, quantity }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cart_item_id, quantity } = body;

    if (!cart_item_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { CartItem } = models;

    // Find cart item
    const cartItem = await CartItem.findByPk(cart_item_id);
    if (!cartItem || cartItem.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Update quantity
    if (quantity <= 0) {
      // Delete if quantity is 0 or negative
      await cartItem.destroy();
      return NextResponse.json(
        { success: true, message: 'Item removed from cart' },
        { status: 200 }
      );
    }

    await cartItem.update({ quantity });

    return NextResponse.json(
      { success: true, message: 'Cart item updated', item: cartItem },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Remove item from cart
 * Body: { cart_item_id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cart_item_id } = body;

    if (!cart_item_id) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { CartItem } = models;

    // Find and delete cart item
    const deleted = await CartItem.destroy({
      where: {
        id: cart_item_id,
        user_id: session.user.id
      }
    });

    if (deleted === 0) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Item removed from cart' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart', details: error.message },
      { status: 500 }
    );
  }
}
