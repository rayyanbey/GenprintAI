import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  generateMockup,
  getMockupVariants,
  generateVideoMockup,
  getMockupById,
} from '@/src/services/mockup.service';

/**
 * POST /api/mockups - Generate a mockup
 * Requires authentication
 * Body: { product_id, design_id, layer, displaySize }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id, design_id, layer = 'front', displaySize = 'medium' } =
      body;

    if (!product_id || !design_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: product_id, design_id',
        },
        { status: 400 }
      );
    }

    console.log(
      `Generating mockup for product ${product_id}, design ${design_id}`
    );

    const result = await generateMockup(
      product_id,
      design_id,
      layer,
      displaySize
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error generating mockup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate mockup' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mockups/[id] - Get mockup details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mockupId = params.id;

    const result = await getMockupById(mockupId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching mockup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mockup' },
      { status: 500 }
    );
  }
}
