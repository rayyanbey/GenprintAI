import { NextRequest, NextResponse } from 'next/server';
import { getPrintFilesForProduct } from '@/src/services/mockup.service';

/**
 * GET /api/mockups/printfiles/[product_id] - Get print files and available placements
 * This is STEP 1 before creating mockups
 *
 * Returns: {
 *   productId,
 *   availablePlacements: { front: "Front print", back: "Back print", ... },
 *   printfiles: [{ printfile_id, width, height, dpi }, ...],
 *   variantPrintfiles: [{ variant_id, placements: {...} }, ...],
 * }
 *
 * Use this to:
 * 1. Know which placements are available for the product
 * 2. Get print area dimensions for positioning calculations
 * 3. Know which variants support which placements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { product_id: string } }
) {
  try {
    const productId = params.product_id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing product_id parameter' },
        { status: 400 }
      );
    }

    console.log(`Getting print files for product: ${productId}`);

    const result = await getPrintFilesForProduct(productId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting print files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get print files' },
      { status: 500 }
    );
  }
}
