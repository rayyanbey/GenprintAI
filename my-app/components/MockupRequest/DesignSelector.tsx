'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Design {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  created_at: string;
}

interface DesignSelectorProps {
  onSelectDesign: (design: Design) => void;
  selectedDesignId?: string;
  featuredDesign?: Design | null;
}

export default function DesignSelector({
  onSelectDesign,
  selectedDesignId,
  featuredDesign,
}: DesignSelectorProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDesigns();
  }, [page]);

  const fetchDesigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/designs?page=${page}&limit=12`);
      if (!response.ok) throw new Error('Failed to fetch designs');

      const data = await response.json();
      setDesigns(data.designs || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load designs');
      console.error('Design fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#f4978e] animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading your designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => {
              setPage(1);
              fetchDesigns();
            }}
            className="mt-4 px-4 py-2 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No designs yet</p>
          <p className="text-sm text-gray-500">
            Create a design in the Design Studio first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Your Designs</h2>
        <p className="text-xs text-gray-600 mt-1">Select a design to request mockups</p>
      </div>

      {featuredDesign && (
        <div className="border-b border-gray-200 bg-amber-50/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Community design</p>
          <button
            onClick={() => onSelectDesign(featuredDesign)}
            className={`flex w-full gap-3 rounded-xl border-2 p-3 text-left transition-all ${
              selectedDesignId === featuredDesign.id
                ? 'border-[#f4978e] bg-orange-50'
                : 'border-amber-200 bg-white hover:border-amber-300'
            }`}
          >
            {featuredDesign.artwork_file_url && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={featuredDesign.artwork_file_url}
                  alt={featuredDesign.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{featuredDesign.title}</p>
              {featuredDesign.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{featuredDesign.description}</p>
              )}
              <p className="mt-1 text-xs text-amber-700">Ready to use in mockups</p>
            </div>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 grid grid-cols-1 gap-3">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => onSelectDesign(design)}
              className={`flex gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                selectedDesignId === design.id
                  ? 'border-[#f4978e] bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {design.artwork_file_url && (
                <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img
                    src={design.artwork_file_url}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{design.title}</p>
                {design.description && (
                  <p className="text-xs text-gray-600 truncate">{design.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(design.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
