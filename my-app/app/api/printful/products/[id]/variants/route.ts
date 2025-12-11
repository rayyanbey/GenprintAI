import { printful } from "@/src/utils/printful";
import { NextResponse } from "next/server";

// GET /api/printful/products/[id]/variants - Fetch product variants from Printful
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    // Get product with variants
    const response = await printful(`/products/${productId}`);
    const product = response.result || response.data;
    
    // Extract variants
    const variants = product.variants || [];
    
    return NextResponse.json({
      success: true,
      product_id: productId,
      variants,
      count: variants.length,
    });
  } catch (error: any) {
    console.error(`Error fetching variants for product ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch product variants", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
