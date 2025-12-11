import { NextResponse } from 'next/server';
import { syncPrintfulProducts } from '@/src/services/product.service';

// POST /api/printful/sync-products - Sync products from Printful to database
export async function POST(request: Request) {
  try {
    let limit = 20; // Default limit
    
    // Try to parse body, but don't fail if it's empty
    try {
      const body = await request.json();
      if (body.limit) {
        limit = body.limit;
      }
    } catch (e) {
      // Body is empty or invalid, use default limit
      console.log('No body provided, using default limit of 20');
    }
    
    console.log(`Syncing ${limit} products from Printful...`);
    const result = await syncPrintfulProducts(limit);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.synced} products`,
        products: result.products,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Sync products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/printful/sync-products - Get sync status and trigger sync
export async function GET() {
  try {
    console.log('GET request to sync products - syncing 20 products...');
    const result = await syncPrintfulProducts(20);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.synced} products`,
        products: result.products,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
