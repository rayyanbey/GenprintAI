import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { Sequelize } from 'sequelize';

/**
 * GET /api/admin/inventory/low-stock
 * Get list of low-stock product variants
 * Returns variants where availability=false OR stock_level < threshold
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const models = await getModels();
    const { ProductVariant, Product } = models;

    const Op = Sequelize.Op;

    // Query: variants that are out of stock OR below threshold
    const lowStockVariants = await ProductVariant.findAll({
      where: {
        [Op.or]: [
          { availability: false },
          {
            stock_level: {
              [Op.and]: [
                { [Op.not]: null },
                { [Op.lt]: Sequelize.sequelize.where(
                  Sequelize.sequelize.col('ProductVariant.low_stock_threshold'),
                  Op.gte,
                  Sequelize.sequelize.col('ProductVariant.stock_level')
                )},
              ],
            },
          },
        ],
      },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'image_url'],
        },
      ],
      order: [['stock_level', 'ASC']],
    });

    // Format response
    const formatted = lowStockVariants.map((v: any) => {
      const data = v.get({ plain: true });
      return {
        id: data.id,
        product_id: data.product_id,
        product_name: data.Product?.name,
        product_image: data.Product?.image_url,
        variant: {
          name: data.name,
          size: data.size,
          color: data.color,
          sku: data.sku,
        },
        availability: data.availability,
        stock_level: data.stock_level,
        threshold: data.low_stock_threshold,
        status: data.availability === false ? 'Out of Stock' : 'Low Stock',
      };
    });

    return NextResponse.json(
      {
        success: true,
        low_stock_variants: formatted,
        count: formatted.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching low-stock variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low-stock variants', details: error.message },
      { status: 500 }
    );
  }
}
