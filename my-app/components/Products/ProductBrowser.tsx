'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Grid, Search, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image_url: string;
  category_id: number;
  variant_count: number;
  printful_id: number;
}

interface Category {
  id: number;
  name: string;
  product_count?: number;
}

export function ProductBrowser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load products based on selected category
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${page}&limit=${limit}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalCount(data.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, page, searchQuery]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Design Your Merchandise</h1>
          <p className="text-gray-600 mt-2">Create custom designs and print them on quality products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg text-gray-900">Categories</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-semibold">All Products</span>
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{category.name}</span>
                      {category.product_count && (
                        <span className="text-xs bg-gray-300 px-2 py-1 rounded">
                          {category.product_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold">{products.length}</span> of{' '}
                  <span className="font-bold">{totalCount}</span> products
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                <p className="text-gray-600 mt-2">Try adjusting your filters or search</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                      .map((p, idx, arr) => (
                        <div key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 py-2">...</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 rounded-lg transition ${
                              p === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const loadVariants = async () => {
    if (variants.length === 0) {
      setLoadingVariants(true);
      try {
        const res = await fetch(`/api/products/${product.id}/variants`);
        const data = await res.json();
        setVariants(data.variants || []);
      } catch (error) {
        console.error('Error loading variants:', error);
      } finally {
        setLoadingVariants(false);
      }
    }
    setShowVariants(!showVariants);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-200 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {product.variant_count} Variants
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">Product ID: {product.printful_id}</p>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={loadVariants}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {showVariants ? 'Hide Options' : 'View Options'}
          </button>
        </div>

        {/* Variants Dropdown */}
        {showVariants && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {loadingVariants ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : variants.length === 0 ? (
              <p className="text-gray-600 text-sm">No variants available</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {variants.slice(0, 5).map((variant) => (
                  <div
                    key={variant.id}
                    className="flex justify-between items-center p-2 bg-white rounded hover:bg-blue-50 transition"
                  >
                    <span className="text-sm text-gray-700">
                      {variant.size && `${variant.size} - `}
                      {variant.color}
                    </span>
                    <span className="font-bold text-blue-600">${variant.price?.toFixed(2)}</span>
                  </div>
                ))}
                {variants.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{variants.length - 5} more options
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
