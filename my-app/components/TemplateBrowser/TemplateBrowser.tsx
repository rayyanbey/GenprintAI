'use client';

import React, { useState, useId } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { useTemplates, SearchFilters } from '@/hooks/useTemplates';

export interface TemplateBrowserProps {
  onSelectTemplate?: (templateId: string) => void;
  isStandalone?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home_living', label: 'Home & Living' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'trending', label: 'Trending' },
];

export default function TemplateBrowser({ 
  onSelectTemplate, 
  isStandalone = true 
}: TemplateBrowserProps) {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('popular');
  const [page, setPage] = useState<number>(1);

  const filters: SearchFilters = {
    category: category !== 'all' ? category : undefined,
    search: search.length > 0 ? search : undefined,
    sort: sortBy,
    page,
    limit: 12,
  };

  const { templates, loading, error, pagination } = useTemplates(filters);
  const inputId = useId();

  const handleResetFilters = () => {
    setCategory('all');
    setSearch('');
    setSortBy('popular');
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

  const handleSelectTemplate = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
  };

  if (!isStandalone) {
    // Sidebar mode (minimal UI)
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              category={template.category}
              description={template.description}
              color_variants={template.color_variants}
              usage_count={template.usage_count}
              is_community={template.is_community}
              approval_status={template.approval_status}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      </div>
    );
  }

  // Full page mode
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
              placeholder="Search templates by name..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f08080] text-gray-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f08080] text-gray-900 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold mb-1">Unable to load templates</p>
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

        {/* Templates Grid */}
        {!loading && templates.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{templates.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.totalCount}</span> templates
                {search && ` matching "${search}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  category={template.category}
                  description={template.description}
                  color_variants={template.color_variants}
                  usage_count={template.usage_count}
                  is_community={template.is_community}
                  approval_status={template.approval_status}
                  onSelect={handleSelectTemplate}
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
        {!loading && templates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-8">
              {search
                ? `No templates match your search for "${search}"`
                : 'Try adjusting your filters or search terms to find what you\'re looking for'}
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
