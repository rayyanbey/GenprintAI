import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPendingCommunityTemplates,
  approveTemplate,
  rejectTemplate,
} from '@/src/services/template.service';

/**
 * GET /api/admin/templates - Get pending community templates
 * Admin only - requires authentication
 * Query params: page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Forbidden - admin access required' },
    //     { status: 403 }
    //   );
    // }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getPendingCommunityTemplates(page, limit);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching pending templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending templates' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/templates/[id]/approve - Approve a community template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const templateId = params.templateId;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (action === 'approve') {
      const result = await approveTemplate(templateId);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json(result);
    } else if (action === 'reject') {
      const result = await rejectTemplate(templateId);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error approving template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
