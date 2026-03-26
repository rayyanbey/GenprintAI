'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';

interface ReturnRequest {
  id: string;
  order_id: string;
  user_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  refund_amount: number;
  created_at: string;
  approval_date?: string;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [filter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/admin/returns${status}`);
      const data = await response.json();

      if (data.success) {
        setReturns(data.returns || []);
      } else {
        setError(data.error || 'Failed to load returns');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (returnId: string, refundAmount: number) => {
    try {
      setActionInProgress(returnId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', refund_amount: refundAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve return');
      }

      setSuccessMessage('Return approved and refund processed');
      fetchReturns();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    try {
      setActionInProgress(returnId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject return');
      }

      setSuccessMessage('Return request rejected');
      fetchReturns();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Return Management</h1>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : returns.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-600">No return requests found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-xs font-semibold px-5 py-3 uppercase">Return ID</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Order ID</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Customer</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Reason</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Amount</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Status</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Date</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnReq) => (
                <tr key={returnReq.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-5 py-4 text-sm font-mono font-bold text-gray-700">
                    #{returnReq.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-4 text-sm">#{returnReq.order_id.slice(0, 8)}</td>
                  <td className="px-4 py-4 text-sm">{returnReq.user_name}</td>
                  <td className="px-4 py-4 text-sm">{returnReq.reason}</td>
                  <td className="px-4 py-4 text-sm font-bold">
                    ${returnReq.refund_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        returnReq.status
                      )}`}
                    >
                      {returnReq.status.charAt(0).toUpperCase() + returnReq.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(returnReq.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {returnReq.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveReturn(returnReq.id, returnReq.refund_amount)}
                          disabled={actionInProgress === returnReq.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {actionInProgress === returnReq.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectReturn(returnReq.id)}
                          disabled={actionInProgress === returnReq.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-gray-400 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {returnReq.status === 'approved' && (
                      <CheckCircle size={18} className="text-green-600" />
                    )}
                    {returnReq.status === 'rejected' && (
                      <X size={18} className="text-red-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
