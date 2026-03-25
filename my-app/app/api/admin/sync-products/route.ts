import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getModels } from '@/lib/db-dynamic';

const PRINTFUL_API_BASE = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL || process.env.PRINTFUL_API_KEY;

/**
 * POST /api/admin/sync-products
 * Syncs products from Printful to database
 * Query: ?limit=500 (default 500)
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    const SYNC_KEY = process.env.SYNC_API_KEY || 'dev-sync-key';

    if (apiKey !== SYNC_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid API key' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '500');

    console.log(`\n🔄 Starting full product sync (limit: ${limit})...\n`);

    const models = await getModels();
    const { Product, ProductVariant } = models;

    let allProducts: any[] = [];
    let offset = 0;
    const pageSize = 100;

    // Fetch all products from Printful
    while (allProducts.length < limit) {
      try {
        const response = await axios.get(`${PRINTFUL_API_BASE}/products`, {
          headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
          params: { limit: pageSize, offset },
          timeout: 30000,
        });

        const batch = response.data.result || [];
        if (batch.length === 0) break;

        allProducts = [...allProducts, ...batch];
        offset += pageSize;

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error('Error fetching from Printful:', error.message);
        break;
      }
    }

    allProducts = allProducts.slice(0, limit);
    console.log(`✓ Fetched ${allProducts.length} products from Printful\n`);

    let syncedCount = 0;
    let variantCount = 0;
    const errors: string[] = [];

    // Sync products
    for (const printfulProduct of allProducts) {
      try {
        // Sync product
        const [product, isNew] = await Product.findOrCreate({
          where: { printful_id: printfulProduct.id },
          defaults: {
            id: `printful_${printfulProduct.id}`,
            name: printfulProduct.title,
            description: printfulProduct.description || '',
            category_id: printfulProduct.main_category_id, // <- KEY
            price: 0,
            image_url: printfulProduct.image,
            brand: printfulProduct.brand,
            model: printfulProduct.model,
            type_name: printfulProduct.type_name,
            variant_count: printfulProduct.variant_count,
            is_discontinued: printfulProduct.is_discontinued || false,
            origin_country: printfulProduct.origin_country,
            techniques: printfulProduct.techniques,
            files: printfulProduct.files,
          },
        });

        if (isNew) syncedCount++;

        // Fetch variants
        try {
          const variantResponse = await axios.get(
            `${PRINTFUL_API_BASE}/products/${printfulProduct.id}/variants`,
            {
              headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
              timeout: 30000,
            }
          );

          const variants = variantResponse.data.result || [];

          for (const variant of variants) {
            await ProductVariant.findOrCreate({
              where: {
                product_id: product.id,
                printful_variant_id: variant.id,
              },
              defaults: {
                name: variant.name,
                size: variant.size?.value || null,
                color: variant.color?.value || null,
                price: variant.retail_price || 0,
                availability: !variant.out_of_stock,
                sku: variant.sku,
                weight: variant.weight,
                metadata: {
                  color_code: variant.color?.code,
                  size_code: variant.size?.code,
                },
              },
            });
            variantCount++;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (variantError: any) {
          errors.push(
            `Variants error for ${printfulProduct.id}: ${variantError.message}`
          );
        }
      } catch (error: any) {
        errors.push(
          `Product error ${printfulProduct.id}: ${error.message}`
        );
      }
    }

    console.log(`✅ Sync Complete!\n`);
    console.log(`  📦 Products: ${syncedCount} new`);
    console.log(`  🎨 Variants: ${variantCount}`);

    return NextResponse.json(
      {
        success: true,
        message: `Synced ${allProducts.length} products with ${variantCount} variants`,
        stats: {
          products_synced: syncedCount,
          total_products: allProducts.length,
          variants_synced: variantCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
