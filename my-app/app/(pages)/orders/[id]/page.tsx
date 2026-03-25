'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import OrderTracking from '@/components/Tracking/OrderTracking';

interface Order {
  id: string;
  status: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  order_date: string;
  total_amount: number;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
  shipping_address?: any;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending_payment', label: 'Payment Pending', icon: Clock },
    { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStepIndex = (status: string) => {
    const index = statusSteps.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <h1 className="text-3xl font-bold mb-6">Order Details</h1>
        
        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold">
                {new Date(order.order_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {order.tracking_number && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-semibold">{order.tracking_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="font-semibold">{order.carrier}</p>
                </div>
              </>
            )}
            {order.estimated_delivery && (
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-semibold">
                  {new Date(order.estimated_delivery).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={order.product_image || '/placeholder.png'}
                  alt={order.product_name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{order.product_name}</h4>
                <p className="text-gray-600">Quantity: {order.quantity}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  ${parseFloat(order.product_price.toString()).toFixed(2)} × {order.quantity} = ${parseFloat(order.total_amount.toString()).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="text-gray-600">
                {typeof order.shipping_address === 'string' ? (
                  <p>{order.shipping_address}</p>
                ) : (
                  <>
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address1}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Tracking - Using Advanced Tracking Component */}
        <div className="mb-6">
          <OrderTracking orderId={order.id} initialData={order} />
        </div>
      </div>
    </div>
  );
}
