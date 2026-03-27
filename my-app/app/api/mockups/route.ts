import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createMockupTask,
  getMockupById,
} from '@/src/services/mockup.service';

/**
 * POST /api/mockups - Create a mockup generation task
 * This is an async operation. Client must poll /api/mockups/status/:task_key
 * Body: { product_id, design_id, design_image_url, variant_ids?, placement, format? }
 * Returns: { taskKey, mockupId, status }
 */
export async function POST(request: NextRequest) {
  const requestId = `mockup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const session = await auth();
    const url = new URL(request.url);
    const isDevMode = process.env.NODE_ENV === 'development';
    const isTestMode = url.searchParams.get('test') === 'true';

    // Allow test requests in development mode
    if (!(session?.user) && !(isDevMode && isTestMode)) {
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
      width,
      position,
      product_options,
      option_groups,
      options,
      file_options,
      product_template_id,
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
      '[API /api/mockups][start]',
      {
        requestId,
        product_id,
        design_id,
        placement,
        format,
        variant_count: Array.isArray(variant_ids) ? variant_ids.length : 0,
      }
    );

    const result = await createMockupTask(
      product_id,
      design_id,
      design_image_url,
      variant_ids,
      placement,
      {
        format: format as 'jpg' | 'png',
        width,
        position,
        productOptions: product_options,
        optionGroups: option_groups,
        options,
        fileOptions: file_options,
        productTemplateId: product_template_id,
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
        requestId,
        taskKey: result.taskKey,
        mockupId: result.mockupId,
        status: result.status,
        message:
          'Mockup generation task created. Poll /api/mockups/status/:task_key to check status.',
      },
      { status: 202 }
    ); // 202 Accepted for async operation
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API /api/mockups][error]', {
      requestId,
      message: err?.message,
      stack: err?.stack,
      error,
    });
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: err?.message || 'Failed to create mockup task',
      },
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
  } catch (error: unknown) {
    console.error('Error fetching mockup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mockup' },
      { status: 500 }
    );
  }
}
