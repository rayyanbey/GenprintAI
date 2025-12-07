import { printful } from "@/src/utils/printful";
//http://localhost:3000/api/printify/products
export async function GET() {
  try {
    const response = await printful("/products");
    const products = response.data;
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products from Printful:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
