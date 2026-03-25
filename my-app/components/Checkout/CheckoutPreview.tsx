'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Truck, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface CheckoutPreviewProps {
  orderData?: {
    id: string;
    product_name: string;
    product_id: string;
    quantity: number;
    product_price: string;
    total_amount: string;
    shipping_address?: {
      name: string;
      email: string;
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    design_id?: string;
  };
  designArtwork?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function CheckoutPreview({
  orderData,
  designArtwork,
  onConfirm,
  onCancel,
}: CheckoutPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [design, setDesign] = useState<any>(null);
  const [mockupImage, setMockupImage] = useState<string | null>(null);

  useEffect(() => {
    if (designArtwork) {
      setMockupImage(designArtwork);
      setIsLoading(false);
    }
  }, [designArtwork]);

  // Fetch design details if design_id provided
  useEffect(() => {
    if (orderData?.design_id) {
      const fetchDesign = async () => {
        try {
          const response = await fetch(`/api/designs/${orderData.design_id}`);
          if (response.ok) {
            const data = await response.json();
            setDesign(data.design);
            setMockupImage(data.design.artwork_file_url);
          }
        } catch (error) {
          console.error('Error fetching design:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDesign();
    } else {
      setIsLoading(false);
    }
  }, [orderData?.design_id]);

  if (!orderData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-600">No order data available</p>
        </div>
      </div>
    );
  }

  const shippingAddress = orderData.shipping_address || {};
  const productPrice = parseFloat(orderData.product_price || '0');
  const shippingCost = 10;
  const subtotal = productPrice * orderData.quantity;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Order Review
          </h1>
          <p className="text-gray-600 mt-2">
            Please review your order details before confirming payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Design Preview & Product */}
          <div className="lg:col-span-2 space-y-6">
            {/* Design Preview */}
            {mockupImage && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <img
                      src={mockupImage}
                      alt="Design preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <p className="text-sm font-semibold text-gray-700">
                    Design Preview
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This design will be printed on your {orderData.product_name}
                  </p>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Product Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-700">
                      {orderData.product_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Product ID: {orderData.product_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${productPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <p className="text-gray-700">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {orderData.quantity}x
                  </p>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <p className="text-gray-700">Subtotal</p>
                  <p className="font-semibold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <p className="text-gray-700">Shipping</p>
                  <p className="font-semibold text-gray-900">
                    ${shippingCost.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">{shippingAddress.name}</p>
                <p>{shippingAddress.address1}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{' '}
                  {shippingAddress.zip}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Process Steps */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order Configured
                    </p>
                    <p className="text-sm text-gray-500">All details set</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Design Ready</p>
                    <p className="text-sm text-gray-500">Uploaded & verified</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Complete Payment
                    </p>
                    <p className="text-sm text-gray-500">Next step</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> After payment, we'll immediately send
                  your order to our production partner. You'll receive tracking
                  information via email.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 py-4 border-y border-gray-200 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    ${shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Continue to Payment
                </button>
                <button
                  onClick={onCancel}
                  className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Edit Order
                </button>
              </div>

              {/* Security Message */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-900 font-semibold">
                  🔒 Payments secured by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
