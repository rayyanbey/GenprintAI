import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getProducts,
  searchProducts,
  getProductWithVariants,
  getProductVariants,
  storeProductVariants,
  syncPrintfulProducts,
} from '@/src/services/product.service';
import { getProductVariants as getPrintfulVariants } from '@/src/services/printful.service';

/**
 * GET /api/products - List products with pagination and filters
 * Query params: category, minPrice, maxPrice, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await searchProducts({
      category: category,
      minPrice,
      maxPrice,
      page,
      limit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
