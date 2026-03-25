'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface OrderTrackingProps {
  orderId: string;
  initialData?: {
    status: string;
    tracking_number?: string;
    carrier?: string;
    estimated_delivery?: string;
    product_name?: string;
    quantity?: number;
    order_date?: string;
  };
}

export default function OrderTracking({
  orderId,
  initialData,
}: OrderTrackingProps) {
  const [orderData, setOrderData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!initialData) {
      const fetchOrderData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch order');
          }
          const data = await response.json();
          setOrderData(data.order || data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load order information'
          );
        } finally {
          setLoading(false);
        }
      };
      fetchOrderData();
    }
  }, [orderId, initialData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-orange-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Your order is pending. We will process it shortly.';
      case 'paid':
        return 'Payment received! Your order is being prepared for shipment.';
      case 'processing':
        return 'Your order is being prepared at our production facility.';
      case 'shipped':
        return 'Your order is on its way! Track your package below.';
      case 'delivered':
        return 'Your order has been delivered. Thank you for your purchase!';
      case 'payment_failed':
        return 'Payment failed. Please try again or contact support.';
      default:
        return 'Your order status is being updated...';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-600">No order data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order {orderId}
            </h1>
            <p className="text-gray-600">
              Order placed on{' '}
              {orderData.order_date
                ? new Date(orderData.order_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full font-semibold text-lg ${getStatusBadgeColor(
              orderData.status
            )}`}
          >
            {orderData.status?.charAt(0).toUpperCase() +
              orderData.status?.slice(1).toLowerCase()}
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          {getStatusIcon(orderData.status)}
          <p className="text-blue-900 font-semibold">
            {getStatusMessage(orderData.status)}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Product Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-semibold text-gray-900">
                {orderData.product_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-semibold text-gray-900">
                {orderData.quantity || 1}x
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Info */}
        {orderData.status?.toLowerCase() === 'shipped' ||
        orderData.status?.toLowerCase() === 'delivered' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Shipping Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Carrier</p>
                <p className="font-semibold text-gray-900">
                  {orderData.carrier || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 font-mono text-lg">
                    {orderData.tracking_number || 'N/A'}
                  </p>
                  {orderData.tracking_number && (
                    <button
                      onClick={() =>
                        copyToClipboard(orderData.tracking_number)
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="Copy tracking number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
        <div className="relative">
          <div className="space-y-6">
            {/* Step 1: Order Confirmed */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 border-2 border-green-600">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="w-1 h-16 bg-green-200 mt-2"></div>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">Order Confirmed</p>
                <p className="text-sm text-gray-600 mt-1">
                  {orderData.order_date
                    ? new Date(orderData.order_date).toLocaleString()
                    : 'Your order has been confirmed'}
                </p>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    ['paid', 'processing', 'shipped', 'delivered'].includes(
                      orderData.status?.toLowerCase() || ''
                    )
                      ? 'bg-green-100 border-green-600'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      ['paid', 'processing', 'shipped', 'delivered'].includes(
                        orderData.status?.toLowerCase() || ''
                      )
                        ? 'text-green-600'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">Payment Processed</p>
                <p className="text-sm text-gray-600 mt-1">
                  {['paid', 'processing', 'shipped', 'delivered'].includes(
                    orderData.status?.toLowerCase() || ''
                  )
                    ? 'Payment confirmed'
                    : 'Awaiting payment confirmation'}
                </p>
              </div>
            </div>

            {/* Step 3: Processing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    ['processing', 'shipped', 'delivered'].includes(
                      orderData.status?.toLowerCase() || ''
                    )
                      ? 'bg-blue-100 border-blue-600'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <Package
                    className={`w-6 h-6 ${
                      ['processing', 'shipped', 'delivered'].includes(
                        orderData.status?.toLowerCase() || ''
                      )
                        ? 'text-blue-600'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">
                  Processing & Printing
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {['processing', 'shipped', 'delivered'].includes(
                    orderData.status?.toLowerCase() || ''
                  )
                    ? 'Your item is being printed'
                    : 'Will begin once payment is confirmed'}
                </p>
              </div>
            </div>

            {/* Step 4: Shipped */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    ['shipped', 'delivered'].includes(
                      orderData.status?.toLowerCase() || ''
                    )
                      ? 'bg-orange-100 border-orange-600'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <Truck
                    className={`w-6 h-6 ${
                      ['shipped', 'delivered'].includes(
                        orderData.status?.toLowerCase() || ''
                      )
                        ? 'text-orange-600'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
                <div className="w-1 h-16 bg-gray-200 mt-2"></div>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">On the Way</p>
                <p className="text-sm text-gray-600 mt-1">
                  {orderData.estimated_delivery
                    ? `Expected delivery: ${new Date(
                        orderData.estimated_delivery
                      ).toLocaleDateString()}`
                    : 'Tracking information will be provided when shipped'}
                </p>
              </div>
            </div>

            {/* Step 5: Delivered */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    orderData.status?.toLowerCase() === 'delivered'
                      ? 'bg-green-100 border-green-600'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      orderData.status?.toLowerCase() === 'delivered'
                        ? 'text-green-600'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">Delivered</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your order has been delivered to your address
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 mb-4">
          If you have any questions about your order, please contact our support
          team.
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
          <button className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-colors">
            View FAQ
          </button>
        </div>
      </div>

      {/* Copied Notification */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          Tracking number copied!
        </div>
      )}
    </div>
  );
}
