'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Palette,
  Share2,
  Trash2,
  Eye,
  Calendar,
  Filter,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardHeader from '@/components/HomePageComponents/DashboardHeader';

interface Design {
  id: string;
  title: string;
  description: string;
  template_id: string;
  created_at: string;
  template: {
    id: string;
    name: string;
    category: string;
  } | null;
  is_shared: boolean;
  community_post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  } | null;
}

export default function DesignsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [filter, setFilter] = useState<'all' | 'shared' | 'private'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch designs
  const fetchDesigns = async (currentFilter: string, currentPage: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/designs?page=${currentPage}&limit=12&filter=${currentFilter}`
      );
      const data = await response.json();

      if (data.success) {
        setDesigns(data.designs);
        setTotalPages(data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch designs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDesigns(filter, page);
    } else {
      router.push('/login');
    }
  }, [session, filter, page, router]);

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'shared' | 'private') => {
    setFilter(newFilter);
    setPage(1);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDesign) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/user/designs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: selectedDesign.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh designs list
        fetchDesigns(filter, page);
        setDeleteDialogOpen(false);
        setSelectedDesign(null);
      }
    } catch (error) {
      console.error('Failed to delete design:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f08080] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading designs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Designs</h1>
              <p className="text-gray-600 mt-2">Manage and view all your design creations</p>
            </div>
            <Button
              onClick={() => router.push('/design')}
              className="gap-2 bg-gradient-to-br from-[#f08080] to-[#f4978e] hover:from-[#e07070] hover:to-[#e38878]"
            >
              <Plus className="w-4 h-4" />
              Create New Design
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(val) => handleFilterChange(val as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Palette className="w-4 h-4" />
              All Designs ({designs.length})
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Share2 className="w-4 h-4" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-2">
              <Eye className="w-4 h-4" />
              Private
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Designs Grid */}
        {designs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' && 'No designs yet'}
              {filter === 'shared' && 'No shared designs'}
              {filter === 'private' && 'No private designs'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' && 'Start creating amazing designs with our AI-powered tools'}
              {filter === 'shared' &&
                'Share your designs with the community to inspire others'}
              {filter === 'private' && 'All your unshared designs will appear here'}
            </p>
            <Button
              onClick={() => router.push('/design')}
              className="gap-2 bg-gradient-to-br from-[#f08080] to-[#f4978e] hover:from-[#e07070] hover:to-[#e38878]"
            >
              <Plus className="w-4 h-4" />
              Create Your First Design
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Design Preview */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    {design.is_shared && (
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                        <Share2 className="w-3 h-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>

                  {/* Design Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {design.title || 'Untitled Design'}
                    </h3>
                    {design.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {design.description}
                      </p>
                    )}
                    {design.template && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {design.template.name}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      {formatDate(design.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/design?id=${design.id}`)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDesign(design);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDesign?.title || 'this design'}"? This
              action cannot be undone.
              {selectedDesign?.is_shared && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: This design is shared with the community. Deleting it will also remove
                  it from the community feed.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Design'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
