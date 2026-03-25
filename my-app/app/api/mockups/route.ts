import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createMockupTask,
  checkMockupStatus,
  getMockupById,
} from '@/src/services/mockup.service';

/**
 * POST /api/mockups - Create a mockup generation task
 * This is an async operation. Client must poll /api/mockups/status/:task_key
 * Body: { product_id, design_id, design_image_url, variant_ids?, placement, format? }
 * Returns: { taskKey, mockupId, status }
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
    const {
      product_id,
      design_id,
      design_image_url,
      variant_ids = [],
      placement = 'front',
      format = 'jpg',
      position,
    } = body;

    if (!product_id || !design_id || !design_image_url) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: product_id, design_id, design_image_url',
        },
        { status: 400 }
      );
    }

    console.log(
      `Creating mockup task for product ${product_id}, design ${design_id}, placement: ${placement}`
    );

    const result = await createMockupTask(
      product_id,
      design_id,
      design_image_url,
      variant_ids,
      placement,
      {
        format: format as 'jpg' | 'png',
        position,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        taskKey: result.taskKey,
        mockupId: result.mockupId,
        status: result.status,
        message:
          'Mockup generation task created. Poll /api/mockups/status/:task_key to check status.',
      },
      { status: 202 }
    ); // 202 Accepted for async operation
  } catch (error: any) {
    console.error('Error creating mockup task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create mockup task' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mockups/:mockup_id - Get mockup details
 */
export async function GET(request: NextRequest) {
  try {
    const mockupId = request.nextUrl.searchParams.get('mockup_id');

    if (!mockupId) {
      return NextResponse.json(
        { success: false, error: 'Missing query param: mockup_id' },
        { status: 400 }
      );
    }

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
