'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    if (redirectStatus === 'succeeded') {
      setStatus('success');
    } else if (redirectStatus === 'failed') {
      setStatus('error');
    } else {
      setStatus('loading');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-gray-600">
              There was an issue processing your payment. Please try again.
            </p>
          </div>
          <Link
            href="/cart"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We've received your order and will start processing it shortly.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <Package className="w-5 h-5" />
            <p className="font-semibold">
              A confirmation email has been sent to your inbox
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="block w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
