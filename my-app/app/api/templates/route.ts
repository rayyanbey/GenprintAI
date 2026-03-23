import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getTemplates,
  createCommunityTemplate,
} from '@/src/services/template.service';

/**
 * GET /api/templates - List templates (Printful + approved community)
 * Query params: page, limit, sort (newest|popular|trending)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await getTemplates(page, limit);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates - Create community template
 * Requires authentication
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
    const { name, category, description, color_variants, design_data, metadata } =
      body;

    if (!name || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, category',
        },
        { status: 400 }
      );
    }

    const result = await createCommunityTemplate(session.user.id, {
      name,
      category,
      description,
      color_variants,
      design_data,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
