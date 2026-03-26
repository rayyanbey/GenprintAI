'use server';

import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

/**
 * Map products to ROOT categories that actually exist in the database
 * Database categories: 1=Men's, 2=Women's, 3=Kids', 93=Hats, 4=Accessories, 5=Home&Living, 116=Collections, 159=Brands
 */
function getProductCategoryId(product: any): number {
  const name = (product.title || '').toLowerCase();
  const type = (product.type_name || '').toLowerCase();
  const model = (product.model || '').toLowerCase();
  
  // Check for specific categories that exist in database
  
  // Hats (category 93)
  if (name.includes('hat') || name.includes('cap') || name.includes('beanie') || name.includes('visor')) {
    return 93; // Hats
  }
  
  // Accessories (category 4)
  if (name.includes('bag') || name.includes('tote') || name.includes('backpack') || 
      name.includes('handbag') || name.includes('fanny pack') || name.includes('waist bag') ||
      name.includes('duffle') || name.includes('drawstring') || name.includes('patch') ||
      name.includes('mask') || name.includes('pin') || name.includes('hair') ||
      name.includes('phone case') || name.includes('earphone') || name.includes('airpod') ||
      name.includes('laptop case') || name.includes('mouse pad') || name.includes('scarf') ||
      name.includes('glove') || name.includes('belt') || name.includes('watch')) {
    return 4; // Accessories
  }
  
  // Home & Living (category 5)
  if (name.includes('poster') || name.includes('print') || name.includes('canvas') ||
      name.includes('framed') || name.includes('mug') || name.includes('cup') ||
      name.includes('tumbler') || name.includes('thermos') || name.includes('water bottle') ||
      name.includes('coaster') || name.includes('towel') || name.includes('blanket') ||
      name.includes('pillow') || name.includes('apron') || name.includes('sticker') ||
      name.includes('notebook') || name.includes('postcard') || name.includes('flag') ||
      name.includes('tapestry') || name.includes('cushion')) {
    return 5; // Home & living
  }
  
  // Men's clothing (category 1) - default for shirts, apparel, etc
  if (name.includes('men') || type.includes("men's") || model.includes("men's") ||
      name.includes('shirt') || name.includes('t-shirt') || name.includes('hoodie') ||
      name.includes('sweatshirt') || name.includes('tank') || name.includes('pants') ||
      name.includes('shorts') || name.includes('jacket') || name.includes('vest') ||
      name.includes('sweatpants') || name.includes('joggers') || name.includes('leggings')) {
    return 1; // Men's clothing
  }
  
  // Women's clothing (category 2)
  if (name.includes('women') || type.includes("women's") || model.includes("women's") ||
      name.includes('dress') || name.includes('crop top') || name.includes('sports bra') ||
      name.includes('skirt') || name.includes('swimwear') || name.includes('swim')) {
    return 2; // Women's clothing
  }
  
  // Kids' & youth clothing (category 3)
  if (name.includes('kids') || name.includes('youth') || name.includes('children') ||
      type.includes("kids") || model.includes("kids")) {
    return 3; // Kids' & youth clothing
  }
  
  // Default to Men's clothing if nothing matches
  return 1; // Men's clothing (default)
}

/**
 * Calculate minimum product price from its variants
 * Returns null if no variants with prices exist
 */
export async function getProductMinPrice(productId: string): Promise<number | null> {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      attributes: ['price'],
      raw: true,
    });

    if (variants.length === 0) {
      return null;
    }

    const prices = variants
      .map((v: any) => parseFloat(v.price || 0))
      .filter((p: number) => p > 0);

    return prices.length > 0 ? Math.min(...prices) : null;
  } catch (error: any) {
    console.error(`Error calculating min price for product ${productId}:`, error);
    return null;
  }
}

/**
 * Get price range (min and max) for a product from its variants
 */
export async function getProductPriceRange(productId: string): Promise<{ min: number | null; max: number | null }> {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      attributes: ['price'],
      raw: true,
    });

    if (variants.length === 0) {
      return { min: null, max: null };
    }

    const prices = variants
      .map((v: any) => parseFloat(v.price || 0))
      .filter((p: number) => p > 0);

    if (prices.length === 0) {
      return { min: null, max: null };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  } catch (error: any) {
    console.error(`Error calculating price range for product ${productId}:`, error);
    return { min: null, max: null };
  }
}

export async function syncPrintfulProducts(limit: number = 20) {
  try {
    console.log(`Syncing ${limit} products from Printful...`);
    
    // Fetch products from Printful
    const response = await printful('/products');
    const printfulProducts = response.result || response.data || [];
    
    // Limit to specified number
    const productsToSync = printfulProducts.slice(0, limit);
    
    const models = await getModels();
    const { Product } = models;
    
    const syncedProducts = [];
    
    for (const printfulProduct of productsToSync) {
      try {
        // Use smart category mapping instead of relying on main_category_id
        const categoryId = getProductCategoryId(printfulProduct);
        
        // Create or update product in database
        // NOTE: price is set to null; actual price comes from variants
        const [product, created] = await Product.upsert({
          id: `printful_${printfulProduct.id}`,
          printful_id: printfulProduct.id,
          name: printfulProduct.title,
          description: printfulProduct.description,
          category_id: categoryId, // Use smart mapping instead of main_category_id
          price: null, // Actual price comes from variants only
          image_url: printfulProduct.image,
          brand: printfulProduct.brand,
          model: printfulProduct.model,
          type_name: printfulProduct.type_name,
          variant_count: printfulProduct.variant_count,
          is_discontinued: printfulProduct.is_discontinued || false,
          origin_country: printfulProduct.origin_country,
          techniques: printfulProduct.techniques,
          files: printfulProduct.files,
        });
        
        syncedProducts.push({
          id: product.id,
          name: product.name,
          category_id: categoryId,
          created,
        });
        
        console.log(`${created ? 'Created' : 'Updated'} product: ${printfulProduct.title} (category: ${categoryId})`);
      } catch (error) {
        console.error(`Error syncing product ${printfulProduct.id}:`, error);
      }
    }
    
    return {
      success: true,
      synced: syncedProducts.length,
      products: syncedProducts,
    };
  } catch (error: any) {
    console.error('Error syncing Printful products:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getProducts(page: number = 1, limit: number = 12) {
  try {
    const models = await getModels();
    const { Product } = models;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        is_discontinued: false,
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    
    return {
      success: true,
      products: products.map((p: any) => ({
        id: p.id,
        printful_id: p.printful_id,
        name: p.name,
        category_id: p.category_id,
        price: null,
        image_url: p.image_url,
        brand: p.brand,
        model: p.model,
        type_name: p.type_name,
        variant_count: p.variant_count,
        origin_country: p.origin_country,
        techniques: p.techniques,
        files: p.files,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: error.message,
      products: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

export async function getProductById(id: string) {
  try {
    const models = await getModels();
    const { Product } = models;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }
    
    return {
      success: true,
      product: {
        id: product.id,
        printful_id: product.printful_id,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        price: null,
        image_url: product.image_url,
        brand: product.brand,
        model: product.model,
        type_name: product.type_name,
        variant_count: product.variant_count,
        origin_country: product.origin_country,
        techniques: product.techniques,
        files: product.files,
      },
    };
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get product with variants
 * Includes all variant information from the ProductVariant table
 */
export async function getProductWithVariants(productId: string) {
  try {
    const models = await getModels();
    const { Product, ProductVariant } = models;

    const product = await Product.findByPk(productId);

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      order: [['size', 'ASC']],
    });

    return {
      success: true,
      product: {
        id: product.id,
        printful_id: product.printful_id,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        price: parseFloat(product.price || 0),
        image_url: product.image_url,
        brand: product.brand,
        model: product.model,
        type_name: product.type_name,
        variant_count: product.variant_count,
        origin_country: product.origin_country,
        techniques: product.techniques,
        files: product.files,
      },
      variants: variants.map((v: any) => ({
        id: v.id,
        printful_variant_id: v.printful_variant_id,
        name: v.name,
        size: v.size,
        color: v.color,
        price: parseFloat(v.price || 0),
        availability: v.availability,
        sku: v.sku,
        weight: v.weight,
        metadata: v.metadata,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching product with variants:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get product variants from database
 */
export async function getProductVariants(productId: string) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      order: [['size', 'ASC'], ['color', 'ASC']],
    });

    return {
      success: true,
      variants: variants.map((v: any) => ({
        id: v.id,
        printful_variant_id: v.printful_variant_id,
        name: v.name,
        size: v.size,
        color: v.color,
        price: parseFloat(v.price || 0),
        availability: v.availability,
        sku: v.sku,
        weight: v.weight,
      })),
    };
  } catch (error: any) {
    console.error('Error fetching product variants:', error);
    return {
      success: false,
      error: error.message,
      variants: [],
    };
  }
}

/**
 * Search/filter products with basic filters
 * Filters: category, minPrice, maxPrice, availability, page, limit
 */
export async function searchProducts(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const models = await getModels();
    const { Product } = models;

    const {
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = filters;

    const where: any = {
      is_discontinued: false,
    };

    if (category) {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        where.category_id = categoryId;
      }
    }

    // Note: Price filtering is done on variants, not on base product.
    // For MVP, we fetch products and let frontend handle price filtering
    // TODO: Implement price filtering at the variant level with proper joins

    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      products: products.map((p: any) => ({
        id: p.id,
        printful_id: p.printful_id,
        name: p.name,
        category_id: p.category_id,
        price: null,
        image_url: p.image_url,
        brand: p.brand,
        model: p.model,
        type_name: p.type_name,
        variant_count: p.variant_count,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error searching products:', error);
    return {
      success: false,
      error: error.message,
      products: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
    };
  }
}

/**
 * Store product variants from Printful API response
 */
export async function storeProductVariants(
  productId: string,
  printfulVariants: any[]
) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const storedVariants = [];

    for (const variant of printfulVariants) {
      const [variantRecord, created] = await ProductVariant.upsert({
        id: `${productId}_variant_${variant.id}`,
        product_id: productId,
        printful_variant_id: variant.id,
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
      });

      storedVariants.push({
        id: variantRecord.id,
        name: variantRecord.name,
        created,
      });
    }

    return {
      success: true,
      stored: storedVariants.length,
      variants: storedVariants,
    };
  } catch (error: any) {
    console.error('Error storing product variants:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
