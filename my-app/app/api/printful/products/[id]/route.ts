import { printful } from "@/src/utils/printful";
import { NextResponse } from "next/server";

// GET /api/printful/products/[id] - Fetch specific product from Printful
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const response = await printful(`/products/${productId}`);
    const product = response.result || response.data;
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error(`Error fetching product ${params.id} from Printful:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch product", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
