'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CheckoutPreview from '@/components/Checkout/CheckoutPreview';

export default function CheckoutPreviewPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderData(data.order || data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const handleConfirm = () => {
    // Navigate to actual checkout with Stripe
    router.push(`/checkout/${orderId}`);
  };

  const handleCancel = () => {
    // Go back to cart or product
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order preview...</p>
        </div>
      </div>
    );
  }

  return (
    <CheckoutPreview
      orderData={orderData}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
