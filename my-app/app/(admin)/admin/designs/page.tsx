'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trash2, Loader2, MessageSquare, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

interface Design {
  id: string;
  title: string;
  type: string;
  author: { name: string; avatar?: string };
  image: string;
  uses: number;
  status: string;
  date: string;
  admin_feedback?: string;
  admin_feedback_date?: string;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isDeletingDesign, setIsDeletingDesign] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/designs?limit=50');
      const data = await res.json();
      setDesigns(data.designs || []);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (designId: string) => {
    if (!feedbackText.trim()) {
      alert('Please enter feedback');
      return;
    }

    setIsSendingFeedback(true);
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: designId,
          feedback_text: feedbackText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send feedback');

      // Update local state
      setDesigns(designs.map(d =>
        d.id === designId
          ? {
              ...d,
              admin_feedback: feedbackText.trim(),
              admin_feedback_date: new Date().toISOString(),
            }
          : d
      ));

      setFeedbackModal(null);
      setFeedbackText('');
      alert('Feedback sent successfully!');
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    setIsDeletingDesign(designId);
    try {
      const res = await fetch(`/api/admin/designs?id=${designId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete design');

      setDesigns(designs.filter(d => d.id !== designId));
      alert('Design deleted successfully');
    } catch (err) {
      console.error('Error deleting design:', err);
      alert('Failed to delete design');
    } finally {
      setIsDeletingDesign(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            {designs.length} designs total
          </p>
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No designs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {designs.map(design => (
            <div
              key={design.id}
              onClick={() => setSelectedDesign(design)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      statusColors[design.status] || statusColors.pending
                    }`}
                  >
                    {design.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <p className="font-bold text-sm truncate">{design.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {design.author.avatar && (
                    <img
                      src={design.author.avatar}
                      alt={design.author.name}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="truncate">{design.author.name}</span>
                </div>
                <p className="text-xs text-gray-500">{design.date}</p>

                {/* Feedback indicator */}
                {design.admin_feedback && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Has feedback
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackModal(design.id);
                      setFeedbackText(design.admin_feedback || '');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Feedback
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDesign(design.id);
                    }}
                    disabled={isDeletingDesign === design.id}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {isDeletingDesign === design.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Send Feedback</h2>
              <button
                onClick={() => {
                  setFeedbackModal(null);
                  setFeedbackText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Message
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your feedback for the designer..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFeedbackModal(null);
                    setFeedbackText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendFeedback(feedbackModal)}
                  disabled={isSendingFeedback || !feedbackText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isSendingFeedback && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Design Details Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-900">{selectedDesign.title}</h2>
              <button
                onClick={() => setSelectedDesign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image */}
              <div>
                <img
                  src={selectedDesign.image}
                  alt={selectedDesign.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Author</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedDesign.author.avatar && (
                      <img
                        src={selectedDesign.author.avatar}
                        alt={selectedDesign.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <p className="text-gray-900">{selectedDesign.author.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Type</p>
                  <p className="text-gray-900 mt-1">{selectedDesign.type}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Date Created</p>
                  <p className="text-gray-900 mt-1">{selectedDesign.date}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Uses</p>
                  <p className="text-gray-900 mt-1">{selectedDesign.uses}</p>
                </div>
              </div>

              {/* Feedback section */}
              {selectedDesign.admin_feedback && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-900 font-medium mb-2">Admin Feedback</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">{selectedDesign.admin_feedback}</p>
                    {selectedDesign.admin_feedback_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(selectedDesign.admin_feedback_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => {
                  setFeedbackModal(selectedDesign.id);
                  setSelectedDesign(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Send Feedback
              </button>
              <button
                onClick={() => {
                  handleDeleteDesign(selectedDesign.id);
                  setSelectedDesign(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedDesign(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
