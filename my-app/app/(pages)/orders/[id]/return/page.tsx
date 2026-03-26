'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  product_name: string;
  total_amount: number;
  created_at: string;
}

interface ReturnRequest {
  id: string;
  status: string;
  reason: string;
  refund_amount: number;
  created_at: string;
}

const RETURN_REASONS = [
  'Defective or damaged',
  'Wrong item received',
  'Not as described',
  'Changed mind',
  'Size or fit issue',
  'Quality issue',
  'Other',
];

export default function ReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reason: '',
    comments: '',
  });

  useEffect(() => {
    fetchOrderAndReturn();
  }, [params.id]);

  const fetchOrderAndReturn = async () => {
    try {
      setLoading(true);
      // Fetch order details
      const orderRes = await fetch(`/api/orders/${params.id}`);
      const orderData = await orderRes.json();

      if (orderData.success) {
        const orderInfo = orderData.order;
        setOrder(orderInfo);

        // Check if return request already exists
        const returnRes = await fetch(`/api/orders/${params.id}/return-request`);
        const returnData = await returnRes.json();

        if (returnData.success && returnData.return_request) {
          setReturnRequest(returnData.return_request);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEligibleForReturn = () => {
    if (!order) return false;
    // Allow returns for shipped and delivered orders
    return ['shipped', 'delivered'].includes(order.status);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason) {
      setError('Please select a return reason');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/orders/${params.id}/return-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: formData.reason,
          comments: formData.comments || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit return request');
      }

      setSuccess(true);
      setReturnRequest(data.return_request);
      setFormData({ reason: '', comments: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Order not found</h3>
          <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href={`/orders/${params.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Request Return</h1>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="text-green-600 mr-3">✓</div>
                <div>
                  <h3 className="font-semibold text-green-800">Return Request Submitted</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Your return request has been submitted successfully. An admin will review it shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="text-red-600 mr-3">✕</div>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-3">Order Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Product</p>
                <p className="font-semibold">{order.product_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {returnRequest && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Return Status</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  <span className="font-semibold">Current Status:</span>{' '}
                  <span className="capitalize">{returnRequest.status}</span>
                </p>
                <p>
                  <span className="font-semibold">Refund Amount:</span> ${returnRequest.refund_amount.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">Requested On:</span>{' '}
                  {new Date(returnRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {!isEligibleForReturn() ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="text-yellow-600 mr-3">⚠</div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Not Eligible for Return</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    This order is not eligible for return. Only shipped or delivered orders can be returned.
                    Current status: <span className="font-semibold capitalize">{order.status}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : !returnRequest ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Return Reason */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Return Reason <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Tell us more about why you want to return this item..."
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
                <Link
                  href={`/orders/${params.id}`}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <h3 className="font-semibold text-blue-800 mb-2">Return Request Already Submitted</h3>
              <p className="text-blue-700 text-sm mb-4">
                You have already submitted a return request for this order. An admin will review it and contact you shortly.
              </p>
              <Link
                href={`/orders/${params.id}`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Back to Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
