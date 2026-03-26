import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  printful_id?: number;
  name: string;
  description?: string;
  category?: string;  // Deprecated - use category_id instead
  category_id?: number;  // Numeric category ID from Printful
  price: number;
  image_url?: string;
  brand?: string;
  variant_count?: number;
}

export interface SearchFilters {
  category?: string | number;  // Accept both string and number for flexibility
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

export function useProducts(filters: SearchFilters = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (filters.category) query.append('category', filters.category);
        if (filters.minPrice) query.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) query.append('maxPrice', filters.maxPrice.toString());
        if (filters.search) query.append('search', filters.search);
        query.append('page', (filters.page || 1).toString());
        query.append('limit', (filters.limit || 12).toString());

        const response = await fetch(`/api/products?${query.toString()}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        setProducts(data.products || []);
        setPagination({
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalCount: data.pagination?.total || 0,
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.search, filters.page, filters.limit]);

  return { products, loading, error, pagination };
}
