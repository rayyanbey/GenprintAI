import { NextRequest, NextResponse } from 'next/server';
import {
  getTemplateById,
  trackTemplateUsage,
} from '@/src/services/template.service';
import { auth } from '@/lib/auth';

/**
 * GET /api/templates/[id] - Get single template details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    const result = await getTemplateById(templateId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/[id]/use - Track template usage
 * Requires authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const templateId = params.id;
    const body = await request.json();
    const { design_id } = body;

    const result = await trackTemplateUsage(templateId, session.user.id, design_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error tracking template usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
