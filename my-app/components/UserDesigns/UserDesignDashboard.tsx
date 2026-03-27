'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, MessageSquare, Zap } from 'lucide-react';

interface Design {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  created_at: string;
  approval_status: string;
  admin_feedback?: string;
  admin_feedback_date?: string;
}

interface StatusCounts {
  approved: number;
  pending: number;
  rejected: number;
}

const statusConfig = {
  approved: {
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    icon: CheckCircle,
    label: 'Approved',
  },
  pending: {
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: Clock,
    label: 'Pending',
  },
  rejected: {
    color: 'bg-red-50 border-red-200 text-red-700',
    icon: XCircle,
    label: 'Rejected',
  },
};

export default function UserDesignDashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/designs?limit=100');
      if (!response.ok) throw new Error('Failed to fetch designs');

      const data = await response.json();
      const designList = data.designs || [];

      setDesigns(designList);

      // Calculate status counts
      const counts = {
        approved: 0,
        pending: 0,
        rejected: 0,
      };

      designList.forEach((design: Design) => {
        const status = (design.approval_status || 'pending').toLowerCase();
        if (status === 'approved') counts.approved++;
        else if (status === 'rejected' || status === 'denied') counts.rejected++;
        else counts.pending++;
      });

      setStatusCounts(counts);
    } catch (err: any) {
      setError(err.message || 'Failed to load designs');
      console.error('Design fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    if (normalizedStatus === 'rejected' || normalizedStatus === 'denied') {
      return statusConfig.rejected;
    }
    return statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#f4978e] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
            <p className="text-gray-600 mt-2">
              View and manage all your design submissions
            </p>
          </div>
          <Link href="/mockup-request">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
              <Zap className="w-5 h-5" />
              Request Mockup
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={fetchDesigns}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Approved */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {statusCounts.approved}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {statusCounts.pending}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {statusCounts.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Designs List */}
        {designs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No designs yet</p>
            <p className="text-gray-500 mt-2">
              Create your first design in the Design Studio to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {designs.map((design) => {
              const config = getStatusConfig(design.approval_status);
              const StatusIcon = config.icon;

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    {design.artwork_file_url && (
                      <div className="w-32 h-32 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img
                          src={design.artwork_file_url}
                          alt={design.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {design.title}
                          </h3>
                          {design.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {design.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Created {new Date(design.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap ${config.color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium text-sm">{config.label}</span>
                        </div>
                      </div>

                      {/* Admin Feedback */}
                      {design.admin_feedback && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() =>
                              setSelectedDesignId(
                                selectedDesignId === design.id ? null : design.id
                              )
                            }
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {selectedDesignId === design.id
                              ? 'Hide feedback'
                              : 'View admin feedback'}
                          </button>

                          {selectedDesignId === design.id && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {design.admin_feedback}
                              </p>
                              {design.admin_feedback_date && (
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(design.admin_feedback_date).toLocaleDateString()}{' '}
                                  {new Date(design.admin_feedback_date).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Alert */}
        {designs.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> Admin feedback appears as a notification in your email.
              Check the feedback section on each design card to see detailed comments from our
              team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
