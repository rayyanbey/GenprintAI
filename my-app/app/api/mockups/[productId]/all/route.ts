import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createMultiAngleMockupTasks } from '@/src/services/mockup.service';

/**
 * POST /api/mockups/[productId]/all - Create mockup tasks for multiple angles
 * This creates async tasks for front, back, side, sleeve, and neck angles
 *
 * Body: {
 *   design_id: string,
 *   design_image_url: string,
 *   variant_ids?: string[],
 *   placements?: string[] // default: ['front', 'back', 'side', 'sleeve', 'neck']
 * }
 *
 * Returns: {
 *   taskKeys: string[], // Array of task keys to poll
 *   totalTasks: number,
 *   failedCount: number
 * }
 *
 * Client must poll /api/mockups/status/:task_key for each task key
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
    const {
      design_id,
      design_image_url,
      variant_ids = [],
      placements,
    } = body;

    if (!design_id || !design_image_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: design_id, design_image_url',
        },
        { status: 400 }
      );
    }

    console.log(
      `Creating multi-angle mockup tasks for product ${productId}, design ${design_id}`
    );

    const result = await createMultiAngleMockupTasks(
      productId,
      design_id,
      design_image_url,
      variant_ids,
      placements
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
        taskKeys: result.taskKeys,
        totalTasks: result.totalTasks,
        failedCount: result.failedCount,
        message: `Created ${result.totalTasks} mockup tasks. Poll /api/mockups/status/:task_key to check status.`,
      },
      { status: 202 }
    ); // 202 Accepted for async operations
  } catch (error: any) {
    console.error('Error creating multi-angle mockup tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create mockup tasks',
      },
      { status: 500 }
    );
  }
}
