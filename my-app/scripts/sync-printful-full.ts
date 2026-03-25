import axios from 'axios';
import * as dotenv from 'dotenv';
import { getModels } from '@/lib/db-dynamic';

dotenv.config();

const PRINTFUL_API_BASE = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

interface PrintfulProduct {
  id: number;
  title: string;
  description?: string;
  main_category_id: number;
  image: string;
  brand?: string;
  model?: string;
  type_name?: string;
  variant_count: number;
  is_discontinued?: boolean;
  origin_country?: string;
  techniques?: any;
  files?: any;
}

interface PrintfulVariant {
  id: number;
  name: string;
  size?: { value: string; code: string };
  color?: { value: string; code: string };
  retail_price: number;
  out_of_stock?: boolean;
  sku?: string;
  weight?: number;
}

async function getPrintfulProducts(limit: number = 100, offset: number = 0) {
  try {
    const response = await axios.get(`${PRINTFUL_API_BASE}/products`, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
      params: {
        limit,
        offset,
      },
      timeout: 30000,
    });

    return response.data.result || [];
  } catch (error: any) {
    console.error('Error fetching products from Printful:', error.message);
    throw error;
  }
}

async function getPrintfulProductVariants(productId: number) {
  try {
    const response = await axios.get(
      `${PRINTFUL_API_BASE}/products/${productId}/variants`,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    return response.data.result || [];
  } catch (error: any) {
    console.error(
      `Error fetching variants for product ${productId}:`,
      error.message
    );
    return [];
  }
}

async function syncProductsWithVariants(totalLimit: number = 500) {
  try {
    console.log(`\n🔄 Starting product sync (up to ${totalLimit} products)...\n`);

    const models = await getModels();
    const { Product, ProductVariant } = models;

    let allProducts: PrintfulProduct[] = [];
    let offset = 0;
    const pageSize = 100;

    // Fetch all products from Printful in batches
    while (allProducts.length < totalLimit) {
      console.log(
        `📥 Fetching products batch ${offset / pageSize + 1} (offset: ${offset})...`
      );
      const batch = await getPrintfulProducts(pageSize, offset);

      if (batch.length === 0) {
        console.log('✓ Reached end of Printful catalog');
        break;
      }

      allProducts = [...allProducts, ...batch];
      offset += pageSize;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Limit to requested total
    allProducts = allProducts.slice(0, totalLimit);
    console.log(
      `\n✓ Fetched ${allProducts.length} products from Printful\n`
    );

    let syncedCount = 0;
    let variantCount = 0;

    // Sync each product
    for (const printfulProduct of allProducts) {
      try {
        // Sync product
        const [product, isNew] = await Product.findOrCreate({
          where: { printful_id: printfulProduct.id },
          defaults: {
            id: `printful_${printfulProduct.id}`,
            name: printfulProduct.title,
            description: printfulProduct.description || '',
            category_id: printfulProduct.main_category_id, // <- KEY: Store category_id as integer
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

        if (isNew) {
          syncedCount++;
          console.log(`✓ Created product: ${printfulProduct.title}`);
        }

        // Fetch and sync variants for this product
        const variants = await getPrintfulProductVariants(printfulProduct.id);

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
              price: variant.retail_price || 0, // <- Variant price
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

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(
          `❌ Error syncing product ${printfulProduct.id}:`,
          error.message
        );
      }
    }

    console.log(`\n✅ Sync Complete!\n`);
    console.log(`  📦 Products synced: ${syncedCount}`);
    console.log(`  🎨 Variants synced: ${variantCount}`);
    console.log(`  ✓ All products now have category_id set\n`);

    return {
      success: true,
      products_synced: syncedCount,
      variants_synced: variantCount,
    };
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
}

// Run the sync
(async () => {
  try {
    const result = await syncProductsWithVariants(500);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
