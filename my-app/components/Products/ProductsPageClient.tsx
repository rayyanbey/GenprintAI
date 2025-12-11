'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  printful_id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  brand: string;
  model: string;
  type_name: string;
  variant_count: number;
  origin_country: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  initialProducts: Product[];
  initialPagination: Pagination;
}

export default function ProductsPageClient({ initialProducts, initialPagination }: Props) {
  const [products] = useState<Product[]>(initialProducts);
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price || 19.99, // Default price if not set
      quantity: 1,
      image_url: product.image_url,
    });
    
    // Show success message (you can add a toast notification here)
    alert(`${product.name} added to cart!`);
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No products available</h3>
          <p className="mt-2 text-gray-600">
            Products need to be synced from Printful first.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Run: <code className="bg-gray-200 px-2 py-1 rounded">POST /api/printful/sync-products</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Browse our collection of {initialPagination.total} premium products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative h-64 bg-gray-200">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {product.brand}
                  </span>
                  <span>{product.variant_count} variants</span>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {product.type_name}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${product.price > 0 ? product.price.toFixed(2) : '19.99'}
                    </p>
                    <p className="text-xs text-gray-500">Starting price</p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {initialPagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="text-gray-600">
              Page {initialPagination.page} of {initialPagination.totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
