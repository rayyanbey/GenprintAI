'use server';

import { getModels } from '@/lib/db-dynamic';
import { Sequelize } from 'sequelize';

/**
 * Check if a variant is available/in stock
 */
export async function checkVariantAvailability(variantId: string) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variant = await ProductVariant.findByPk(variantId, {
      attributes: ['id', 'availability', 'stock_level', 'low_stock_threshold'],
    });

    if (!variant) {
      return {
        success: false,
        error: 'Variant not found',
      };
    }

    return {
      success: true,
      variant_id: variantId,
      available: variant.availability === true,
      stock_level: variant.stock_level,
      is_low_stock: variant.stock_level && variant.low_stock_threshold && 
                    variant.stock_level < variant.low_stock_threshold,
    };
  } catch (error: any) {
    console.error('Error checking variant availability:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check availability for multiple variants
 */
export async function checkVariantsAvailability(variantIds: string[]) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variants = await ProductVariant.findAll({
      where: {
        id: variantIds,
      },
      attributes: ['id', 'availability', 'stock_level', 'low_stock_threshold'],
    });

    return {
      success: true,
      variants: variants.map((v: any) => ({
        variant_id: v.id,
        available: v.availability === true,
        stock_level: v.stock_level,
        is_low_stock: v.stock_level && v.low_stock_threshold &&
                      v.stock_level < v.low_stock_threshold,
      })),
    };
  } catch (error: any) {
    console.error('Error checking variants availability:', error);
    return {
      success: false,
      error: error.message,
      variants: [],
    };
  }
}

/**
 * Get availability status for a product's variants
 */
export async function getProductVariantsAvailability(productId: string) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variants = await ProductVariant.findAll({
      where: { product_id: productId },
      attributes: [
        'id',
        'name',
        'size',
        'color',
        'sku',
        'availability',
        'stock_level',
        'low_stock_threshold',
      ],
    });

    return {
      success: true,
      product_id: productId,
      variants: variants.map((v: any) => ({
        id: v.id,
        name: v.name,
        size: v.size,
        color: v.color,
        sku: v.sku,
        available: v.availability === true,
        stock_level: v.stock_level,
        is_low_stock: v.stock_level && v.low_stock_threshold &&
                      v.stock_level < v.low_stock_threshold,
      })),
    };
  } catch (error: any) {
    console.error('Error getting product variants availability:', error);
    return {
      success: false,
      error: error.message,
      product_id: productId,
      variants: [],
    };
  }
}

/**
 * Update variant availability status
 * Used when Printful sends updates or admin manually changes
 */
export async function updateVariantAvailability(
  variantId: string,
  available: boolean,
  stockLevel?: number
) {
  try {
    const models = await getModels();
    const { ProductVariant } = models;

    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
      return {
        success: false,
        error: 'Variant not found',
      };
    }

    const updateData: any = { availability: available };
    if (stockLevel !== undefined) {
      updateData.stock_level = stockLevel;
    }

    await variant.update(updateData);

    return {
      success: true,
      variant: variant.get({ plain: true }),
    };
  } catch (error: any) {
    console.error('Error updating variant availability:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all low-stock variants (threshold approach)
 */
export async function getLowStockVariants() {
  try {
    const models = await getModels();
    const { ProductVariant, Product, sequelize } = models;
    const { Op } = Sequelize;

    const variants = await ProductVariant.findAll({
      where: {
        [Op.or]: [
          { availability: false },
          Sequelize.where(
            Sequelize.col('stock_level'),
            Op.lt,
            Sequelize.col('low_stock_threshold')
          ),
        ],
      },
      include: [
        {
          model: Product,
          attributes: ['id', 'name'],
        },
      ],
      order: [['stock_level', 'ASC']],
    });

    return {
      success: true,
      low_stock_variants: variants.map((v: any) => {
        const data = v.get({ plain: true });
        return {
          id: data.id,
          product_id: data.product_id,
          product_name: data.Product?.name,
          variant_name: data.name,
          size: data.size,
          color: data.color,
          available: data.availability,
          stock_level: data.stock_level,
          threshold: data.low_stock_threshold,
        };
      }),
    };
  } catch (error: any) {
    console.error('Error getting low-stock variants:', error);
    return {
      success: false,
      error: error.message,
      low_stock_variants: [],
    };
  }
}
