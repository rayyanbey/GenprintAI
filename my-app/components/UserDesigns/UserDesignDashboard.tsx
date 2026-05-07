'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, MessageSquare, Zap, Share2, Users } from 'lucide-react';

interface Design {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  created_at: string;
  approval_status: string;
  admin_feedback?: string;
  admin_feedback_date?: string;
  is_shared?: boolean;
  community_post?: {
    id: number;
    title: string;
    content: string;
    created_at: string;
  } | null;
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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
  const [sharingDesignId, setSharingDesignId] = useState<string | null>(null);
  const [collaborationDesignId, setCollaborationDesignId] = useState<string | null>(null);
  const [shareDrafts, setShareDrafts] = useState<Record<string, { title: string; content: string }>>({});
  const [collaborationDrafts, setCollaborationDrafts] = useState<Record<string, { email: string; role: 'viewer' | 'editor' }>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load designs'));
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

  const handleShareDesign = async (design: Design) => {
    const draft = shareDrafts[design.id] || {
      title: design.title,
      content: design.description || '',
    };

    setBusyAction(`share-${design.id}`);
    setActionMessage(null);

    try {
      const response = await fetch('/api/community/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id: design.id,
          title: draft.title,
          content: draft.content,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to share design');
      }

      setActionMessage('Design shared to the community.');
      setSharingDesignId(null);
      await fetchDesigns();
    } catch (err: unknown) {
      setActionMessage(getErrorMessage(err, 'Failed to share design'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleInviteCollaborator = async (design: Design) => {
    const draft = collaborationDrafts[design.id] || { email: '', role: 'viewer' };
    if (!draft.email.trim()) {
      setActionMessage('Enter a collaborator email first.');
      return;
    }

    setBusyAction(`collaborate-${design.id}`);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/designs/${design.id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to invite collaborator');
      }

      setActionMessage('Collaborator access saved.');
      setCollaborationDesignId(null);
      setCollaborationDrafts((prev) => ({
        ...prev,
        [design.id]: { email: '', role: 'viewer' },
      }));
    } catch (err: unknown) {
      setActionMessage(getErrorMessage(err, 'Failed to invite collaborator'));
    } finally {
      setBusyAction(null);
    }
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

        {actionMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">{actionMessage}</p>
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

                      {/* Community actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSharingDesignId(sharingDesignId === design.id ? null : design.id);
                              setShareDrafts((prev) => ({
                                ...prev,
                                [design.id]: prev[design.id] || {
                                  title: design.community_post?.title || design.title,
                                  content: design.community_post?.content || design.description || '',
                                },
                              }));
                            }}
                            disabled={design.is_shared}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            <Share2 className="w-4 h-4" />
                            {design.is_shared ? 'Shared' : 'Share'}
                          </button>

                          <button
                            onClick={() => {
                              setCollaborationDesignId(
                                collaborationDesignId === design.id ? null : design.id
                              );
                              setCollaborationDrafts((prev) => ({
                                ...prev,
                                [design.id]: prev[design.id] || { email: '', role: 'viewer' },
                              }));
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Users className="w-4 h-4" />
                            Collaborate
                          </button>
                        </div>

                        {sharingDesignId === design.id && (
                          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="grid gap-3">
                              <input
                                value={shareDrafts[design.id]?.title || ''}
                                onChange={(event) =>
                                  setShareDrafts((prev) => ({
                                    ...prev,
                                    [design.id]: {
                                      title: event.target.value,
                                      content: prev[design.id]?.content || '',
                                    },
                                  }))
                                }
                                placeholder="Community post title"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                              />
                              <textarea
                                value={shareDrafts[design.id]?.content || ''}
                                onChange={(event) =>
                                  setShareDrafts((prev) => ({
                                    ...prev,
                                    [design.id]: {
                                      title: prev[design.id]?.title || design.title,
                                      content: event.target.value,
                                    },
                                  }))
                                }
                                placeholder="Tell the community about this design"
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setSharingDesignId(null)}
                                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleShareDesign(design)}
                                  disabled={busyAction === `share-${design.id}`}
                                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                                >
                                  Share Design
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {collaborationDesignId === design.id && (
                          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                              <input
                                value={collaborationDrafts[design.id]?.email || ''}
                                onChange={(event) =>
                                  setCollaborationDrafts((prev) => ({
                                    ...prev,
                                    [design.id]: {
                                      email: event.target.value,
                                      role: prev[design.id]?.role || 'viewer',
                                    },
                                  }))
                                }
                                placeholder="Collaborator email"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                              />
                              <select
                                value={collaborationDrafts[design.id]?.role || 'viewer'}
                                onChange={(event) =>
                                  setCollaborationDrafts((prev) => ({
                                    ...prev,
                                    [design.id]: {
                                      email: prev[design.id]?.email || '',
                                      role: event.target.value === 'editor' ? 'editor' : 'viewer',
                                    },
                                  }))
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                              </select>
                              <button
                                onClick={() => handleInviteCollaborator(design)}
                                disabled={busyAction === `collaborate-${design.id}`}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                              >
                                Invite
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
