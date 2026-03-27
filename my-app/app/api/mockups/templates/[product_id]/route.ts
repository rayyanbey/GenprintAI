import { NextRequest, NextResponse } from 'next/server';
import { getMockupTemplatesForProduct } from '@/src/services/mockup.service';

/**
 * GET /api/mockups/templates/[product_id]
 * Proxy endpoint for Printful mockup templates:
 * GET /mockup-generator/templates/{product_id}
 *
 * Query params:
 * - orientation: horizontal | vertical
 * - technique: string
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing product_id parameter' },
        { status: 400 }
      );
    }

    const orientation = request.nextUrl.searchParams.get('orientation');
    const technique = request.nextUrl.searchParams.get('technique');

    console.log('Getting mockup templates for product:', {
      productId,
      orientation,
      technique,
    });

    const result = await getMockupTemplatesForProduct(productId, {
      orientation:
        orientation === 'horizontal' || orientation === 'vertical'
          ? orientation
          : undefined,
      technique: technique || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting mockup templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get mockup templates' },
      { status: 500 }
    );
  }
}
