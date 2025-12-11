import { ProductCatalog } from '@/components/ProductCatalogComponents';
import { getProducts } from '@/src/services/product.service';

export default async function ProductsPage() {
  // Fetch products from database
  const result = await getProducts(1, 50);
  
  return <ProductCatalog products={result.products} />;
}
