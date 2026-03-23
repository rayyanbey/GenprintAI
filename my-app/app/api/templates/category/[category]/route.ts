import { NextRequest, NextResponse } from 'next/server';
import { getTemplatesByCategory } from '@/src/services/template.service';

/**
 * GET /api/templates/category/[category] - Get templates by category
 * Query params: page, limit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await getTemplatesByCategory(category, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching templates by category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
