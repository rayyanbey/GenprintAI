'use server';

import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

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
        // Create or update product in database
        const [product, created] = await Product.upsert({
          id: `printful_${printfulProduct.id}`,
          printful_id: printfulProduct.id,
          name: printfulProduct.title,
          description: printfulProduct.description,
          category_id: printfulProduct.main_category_id || null,
          price: 0, // Base price, actual price comes from variants
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
          created,
        });
        
        console.log(`${created ? 'Created' : 'Updated'} product: ${printfulProduct.title}`);
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
        price: parseFloat(p.price || 0),
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
      minPrice = 0,
      maxPrice = 10000,
      availability = true,
      page = 1,
      limit = 12,
    } = filters;

    const where: any = {
      is_discontinued: false,
      price: {
        [require('sequelize').Op.between]: [minPrice, maxPrice],
      },
    };

    if (category) {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        where.category_id = categoryId;
      }
    }

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
        price: parseFloat(p.price || 0),
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
