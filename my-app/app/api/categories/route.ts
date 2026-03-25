import { NextRequest, NextResponse } from 'next/server';
import {
  syncCategories,
  getCategoryHierarchy,
  getAllCategories,
  getCategoryWithParents,
  getCategoryChildren,
} from '@/src/services/category.service';

/**
 * GET /api/categories - Get all categories
 * Query params: hierarchy (true/false), parentId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hierarchy = searchParams.get('hierarchy') === 'true';
    const parentId = searchParams.get('parentId');

    let categories;

    if (parentId) {
      // Get children of specific parent
      categories = await getCategoryChildren(parseInt(parentId));
    } else if (hierarchy) {
      // Get hierarchical structure
      categories = await getCategoryHierarchy();
    } else {
      // Get flat list
      categories = await getAllCategories();
    }

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories/sync - Sync categories from Printful
 * Body: { categories: [...] } - Array of category objects from Printful
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'Invalid categories data' },
        { status: 400 }
      );
    }

    const result = await syncCategories(categories);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error syncing categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync categories' },
      { status: 500 }
    );
  }
}
