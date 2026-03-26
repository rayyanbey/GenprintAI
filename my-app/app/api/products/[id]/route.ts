import { NextRequest, NextResponse } from 'next/server';
import { getProductWithVariants, getProductVariants } from '@/src/services/product.service';

/**
 * GET /api/products/[id] - Get single product with variants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = await params;

    const result = await getProductWithVariants(productId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
