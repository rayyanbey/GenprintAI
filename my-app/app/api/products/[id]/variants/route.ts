import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';
import { getProductVariants as getPrintfulVariants } from '@/src/services/printful.service';
import { storeProductVariants } from '@/src/services/product.service';
import { printful } from '@/src/utils/printful';

function extractPlacementsFromFiles(files: any): Record<string, string> {
  if (!Array.isArray(files)) {
    return {};
  }

  const labels: Record<string, string> = {
    default: 'Front',
    back: 'Back',
    sleeve_left: 'Left Sleeve',
    sleeve_right: 'Right Sleeve',
    front: 'Front',
  };

  const placements: Record<string, string> = {};

  for (const file of files) {
    const type = String(file?.type || file?.id || '').trim().toLowerCase();
    if (!type || type === 'mockup' || type === 'preview') {
      continue;
    }

    placements[type] = labels[type] || String(file?.title || type);
  }

  return placements;
}

/**
 * GET /api/products/:id/variants
 * Fetch all variants for a product with pricing and availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Derive placements from locally synced product files first.
    let placementMap = extractPlacementsFromFiles(product.files);

    // If no placements in DB, fetch current files from Printful product endpoint.
    if (Object.keys(placementMap).length === 0 && product.printful_id) {
      try {
        const printfulProductResponse = await printful(`/products/${Number(product.printful_id)}`);
        placementMap = extractPlacementsFromFiles(printfulProductResponse?.result?.product?.files);
      } catch (placementError) {
        console.error('Placement fallback from Printful failed:', placementError);
      }
    }

    // Get all variants for product from local DB first
    let variants = await ProductVariant.findAll({
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

    // Fallback: if DB variants are missing, fetch from Printful and persist.
    if (variants.length === 0 && product.printful_id) {
      try {
        const printfulVariantsResult = await getPrintfulVariants(Number(product.printful_id));

        if (printfulVariantsResult.success && Array.isArray(printfulVariantsResult.data) && printfulVariantsResult.data.length > 0) {
          await storeProductVariants(String(product.id), printfulVariantsResult.data);

          variants = await ProductVariant.findAll({
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
        }
      } catch (fallbackError) {
        console.error('Variant fallback from Printful failed:', fallbackError);
      }
    }

    // Format variants
    const formattedVariants = variants.map((v: any) => {
      const variantData = v.get({ plain: true });
      return {
        id: variantData.id,
        printful_id: Number(variantData.printful_variant_id),
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
        variant_count: variants.length,
        placements: placementMap,
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
