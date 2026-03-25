'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Design {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  version_number: number;
  created_at: string;
  updated_at: string;
}

export default function DesignsList() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/designs?page=${page}&limit=12`);
        if (!response.ok) {
          throw new Error('Failed to fetch designs');
        }
        const data = await response.json();
        setDesigns(data.designs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load designs'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [page]);

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete design');
      }

      setDesigns((prevDesigns) =>
        prevDesigns.filter((d) => d.id !== designId)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete design'
      );
    }
  };

  if (loading && designs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your custom designs
          </p>
        </div>
        <Link
          href="/design-studio"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Design
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {designs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No designs yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start creating your first design to get started
          </p>
          <Link
            href="/design-studio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Design
          </Link>
        </div>
      ) : (
        <>
          {/* Grid of Designs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {design.artwork_file_url ? (
                    <img
                      src={design.artwork_file_url}
                      alt={design.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎨</div>
                      <p className="text-gray-500 text-sm">No preview</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                    {design.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {design.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>v{design.version_number}</span>
                    <span>
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/design-studio/${design.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteDesign(design.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={designs.length < 12}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
