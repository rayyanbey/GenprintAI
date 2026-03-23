import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMockupVariants, generateVideoMockup } from '@/src/services/mockup.service';

/**
 * POST /api/mockups/[productId]/all - Generate all mockup angles
 * Body: { design_id }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const productId = params.productId;
    const body = await request.json();
    const { design_id, include_video } = body;

    if (!design_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: design_id' },
        { status: 400 }
      );
    }

    console.log(
      `Generating all mockup angles for product ${productId}, design ${design_id}`
    );

    const result = await getMockupVariants(productId, design_id);

    // Optionally generate video mockup
    if (include_video) {
      const videoResult = await generateVideoMockup(productId, design_id);
      if (videoResult.success) {
        result.mockups.push({
          ...videoResult.mockup,
          layer: '360',
        });
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error generating all mockups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate mockups' },
      { status: 500 }
    );
  }
}
