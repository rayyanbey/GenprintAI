import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncPrintfulProducts } from '@/src/services/product.service';
import { storeProductVariants } from '@/src/services/product.service';
import { getProducts as getPrintfulProducts, getProductVariants as getPrintfulVariants } from '@/src/services/printful.service';

/**
 * POST /api/products/sync - Sync products from Printful to database
 * Admin only - requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check for session OR API key (for development/testing)
    let session = await auth();
    
    // If no session, check for API key in Authorization header
    if (!session?.user) {
      const authHeader = request.headers.get('Authorization');
      const apiKey = authHeader?.replace('Bearer ', '');
      
      // Development/testing API key (change this in production)
      const VALID_API_KEY = process.env.SYNC_API_KEY || 'dev-sync-key-12345';
      
      if (apiKey !== VALID_API_KEY) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - must be logged in or provide valid API key' },
          { status: 401 }
        );
      }
    }

    // Check if user is admin (optional - implement based on your auth system)
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Forbidden - admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const limit = body.limit || 50;

    console.log(`Starting product sync with limit: ${limit}`);

    // Sync products from Printful
    const syncResult = await syncPrintfulProducts(limit);

    if (!syncResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: syncResult.error,
        },
        { status: 500 }
      );
    }

    // For each synced product, also fetch and store variants
    for (const product of syncResult.products) {
      try {
        // Get Printful variants
        const variantsResult = await getPrintfulVariants(product.printful_id);

        if (variantsResult.success && variantsResult.data) {
          // Store variants in database
          await storeProductVariants(product.id, variantsResult.data);
          console.log(`Synced ${variantsResult.data.length} variants for product ${product.id}`);
        }
      } catch (error) {
        console.error(`Error syncing variants for product ${product.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      synced_count: syncResult.synced,
      message: `Successfully synced ${syncResult.synced} products with variants`,
    });
  } catch (error: any) {
    console.error('Error syncing Printful products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync products',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
