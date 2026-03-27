import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkMockupStatus } from '@/src/services/mockup.service';

/**
 * GET /api/mockups/status/[task_key] - Poll for mockup generation status
 * Returns status: "pending", "completed", or "failed"
 * When completed, includes mockups array with URLs
 *
 * Best practice: Poll every 2-5 seconds until completed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_key: string }> }
) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const isDevMode = process.env.NODE_ENV === 'development';
    const isTestMode = url.searchParams.get('test') === 'true';

    // Allow test requests in development mode
    if (!(session?.user) && !(isDevMode && isTestMode)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { task_key: taskKey } = await params;

    if (!taskKey) {
      return NextResponse.json(
        { success: false, error: 'Missing task_key parameter' },
        { status: 400 }
      );
    }

    console.log(`Checking mockup status for task: ${taskKey}`);

    const result = await checkMockupStatus(taskKey);

    // Terminal workflow statuses should be returned as 200 so clients can stop polling.
    if (result.status === 'pending' || result.status === 'completed' || result.status === 'failed') {
      return NextResponse.json(result, { status: 200 });
    }

    // Non-workflow errors (missing task, upstream/runtime issues) stay as server errors.
    return NextResponse.json(
      { success: false, error: result.error || 'Failed to check mockup status' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error checking mockup status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check mockup status' },
      { status: 500 }
    );
  }
}
