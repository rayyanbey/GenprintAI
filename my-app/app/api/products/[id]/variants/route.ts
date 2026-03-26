import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';

/**
 * GET /api/products/:id/variants
 * Fetch all variants for a product with pricing and availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { Product, ProductVariant } = models;

    // Verify product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get all variants for product
    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      order: [['size', 'ASC'], ['color', 'ASC']],
      attributes: [
        'id',
        'printful_variant_id',
        'name',
        'size',
        'color',
        'price',
        'availability',
        'sku',
        'weight',
        'metadata'
      ]
    });

    // Format variants
    const formattedVariants = variants.map((v: any) => {
      const variantData = v.get({ plain: true });
      return {
        id: variantData.id,
        printful_id: variantData.printful_variant_id,
        name: variantData.name,
        size: variantData.size,
        color: variantData.color,
        price: parseFloat(variantData.price || 0),
        availability: variantData.availability !== false,
        sku: variantData.sku,
        weight: variantData.weight,
        metadata: variantData.metadata
      };
    });

    // Get price range
    const prices = formattedVariants
      .filter(v => v.availability)
      .map(v => v.price);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        category_id: product.category_id,
        variant_count: variants.length
      },
      variants: formattedVariants,
      pricing: {
        min_price: minPrice,
        max_price: maxPrice,
        available_count: formattedVariants.filter(v => v.availability).length,
        total_count: formattedVariants.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching product variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product variants', details: error.message },
      { status: 500 }
    );
  }
}
