'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Check, X, Trash2, Eye } from 'lucide-react';

interface Creator {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  usage_count?: number;
  created_at: string;
  creator?: Creator;
  metadata?: any;
}

export const AdminTemplateModeration: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchPendingTemplates();
  }, [currentPage]);

  const fetchPendingTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/templates/pending?page=${currentPage}&limit=${limit}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pending templates');
      }

      setTemplates(data.templates || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending templates');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    templateId: string,
    action: 'approve' | 'reject' | 'delete'
  ) => {
    setActionLoading((prev) => ({ ...prev, [templateId]: true }));

    try {
      let endpoint = '';
      let method = 'PUT';

      if (action === 'approve') {
        endpoint = `/api/admin/templates/${templateId}`;
      } else if (action === 'reject') {
        endpoint = `/api/admin/templates/${templateId}`;
      } else if (action === 'delete') {
        endpoint = `/api/admin/templates/${templateId}`;
        method = 'DELETE';
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:
          method === 'PUT'
            ? JSON.stringify({
                approval_status: action === 'approve' ? 'approved' : 'rejected',
              })
            : undefined,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Action failed');
      }

      setActionMessage({
        type: 'success',
        message: `Template ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deleted'} successfully`,
      });

      // Refresh list
      setTimeout(() => {
        fetchPendingTemplates();
        setActionMessage(null);
      }, 1500);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        message: err.message || `Failed to ${action} template`,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#f4978e] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading pending templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-lg border flex gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={
              actionMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
            }
          >
            {actionMessage.message}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchPendingTemplates}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* No Templates */}
      {templates.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="inline-block p-3 bg-gray-200 rounded-full mb-4">
            <Check className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">
            No pending templates to moderate. Come back later.
          </p>
        </div>
      )}

      {/* Templates Table */}
      {templates.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Template
                </th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Creator
                </th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Category
                </th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Submitted
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {template.metadata?.image_url && (
                        <img
                          src={template.metadata.image_url}
                          alt={template.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {template.name}
                        </p>
                        {template.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {template.creator?.avatar_url && (
                        <img
                          src={template.creator.avatar_url}
                          alt={template.creator.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {template.creator?.full_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          @{template.creator?.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-[#f4978e]/10 text-[#f4978e] rounded-full text-sm font-semibold capitalize">
                      {template.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">
                      {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Button */}
                      <button
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        disabled={actionLoading[template.id]}
                        title="View template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve Button */}
                      <button
                        onClick={() => handleAction(template.id, 'approve')}
                        disabled={actionLoading[template.id]}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve template"
                      >
                        {actionLoading[template.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => handleAction(template.id, 'reject')}
                        disabled={actionLoading[template.id]}
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject template"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this template?'
                            )
                          ) {
                            handleAction(template.id, 'delete');
                          }
                        }}
                        disabled={actionLoading[template.id]}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#f4978e] transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                page = currentPage - 2 + i;
              }
              return page <= totalPages ? (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-[#f4978e] text-white'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-[#f4978e]'
                  }`}
                >
                  {page}
                </button>
              ) : null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#f4978e] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
