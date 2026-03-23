import { NextRequest, NextResponse } from 'next/server';
import { getProductVariants } from '@/src/services/product.service';

/**
 * GET /api/products/[id]/variants - Get all variants for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const result = await getProductVariants(productId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching product variants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}
