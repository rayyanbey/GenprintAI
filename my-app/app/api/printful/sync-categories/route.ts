import { NextRequest, NextResponse } from 'next/server';
import { syncCategories } from '@/src/services/category.service';

/**
 * POST /api/printful/sync-categories - Sync all categories from the Printful data provided
 * This endpoint expects the full categories response from Printful
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Categories data is required and must be an array',
          hint: 'POST body should contain: { "categories": [...] }'
        },
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
      { 
        success: false, 
        error: error.message || 'Failed to sync categories',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/printful/sync-categories - Get sync status/info
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Use POST to sync categories',
    endpoint: 'POST /api/printful/sync-categories',
    body: {
      categories: [
        {
          id: 1,
          parent_id: 0,
          title: 'Men\'s clothing',
          image_url: 'https://...',
          catalog_position: 1,
          size: 'small'
        }
      ]
    }
  });
}
