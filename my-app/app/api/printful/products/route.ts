import { printful } from "@/src/utils/printful";
import { NextResponse } from "next/server";

// GET /api/printful/products - Fetch all products from Printful
export async function GET() {
  try {
    const response = await printful("/products");
    const products = response.result || response.data || [];
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: any) {
    console.error("Error fetching products from Printful:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch products", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
