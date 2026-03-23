'use client';

import React, { useState, useId } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCardEnhanced from './ProductCardEnhanced';
import { useProducts, SearchFilters, Product } from '@/hooks/useProducts';

export interface ProductBrowserProps {
  onPreview?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home_living', label: 'Home & Living' },
];

export default function ProductBrowser({ onPreview, onAddToCart }: ProductBrowserProps) {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [page, setPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Create filters object
  const filters: SearchFilters = {
    category: category !== 'all' ? category : undefined,
    minPrice: minPrice > 0 ? minPrice : undefined,
    maxPrice: maxPrice < 500 ? maxPrice : undefined,
    search: search.length > 0 ? search : undefined,
    page,
    limit: 12,
  };

  const { products, loading, error, pagination } = useProducts(filters);
  const inputId = useId();
  const filterFormId = useId();

  const handleResetFilters = () => {
    setCategory('all');
    setSearch('');
    setMinPrice(0);
    setMaxPrice(500);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage(Math.max(1, page - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id={inputId}
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f08080] focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 border-t border-b border-gray-200 py-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-900 font-semibold hover:text-[#f08080] transition-colors mb-4"
          >
            <span>Filters</span>
            <ChevronLeft
              size={20}
              className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        category === cat.id
                          ? 'bg-gradient-to-r from-[#f08080] to-[#f4978e] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Price Range
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">Min</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(Number(e.target.value));
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f08080] text-gray-900"
                      />
                    </div>
                    <span className="text-gray-500 text-sm mt-6">—</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">Max</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(Number(e.target.value));
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f08080] text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    ${minPrice} – ${maxPrice}
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold mb-1">Unable to load products</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div>
          <div className="mb-4 h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-gray-200 aspect-square rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{pagination.totalCount}</span> products
              {search && ` matching "${search}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <ProductCardEnhanced
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                image_url={product.image_url}
                price={product.price}
                category={product.category}
                variant_count={product.variant_count}
                onPreview={onPreview}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <div className="px-4 py-2 text-sm text-gray-600">
                Page <span className="font-semibold">{pagination.page}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-8">
            {search
              ? `No products match your search for "${search}"`
              : "Try adjusting your filters or search terms to find what you're looking for"}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-gradient-to-r from-[#f08080] to-[#f4978e] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
