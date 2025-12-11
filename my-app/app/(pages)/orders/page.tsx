'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Package, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  quantity: number;
  product: {
    name: string;
    image: string;
  };
}

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchOrders();
    } else if (sessionStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [sessionStatus, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      payment_failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Please log in to view your orders</h3>
          <Link href="/auth/signin" className="mt-4 inline-block text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
            <p className="mt-2 text-gray-600">Start shopping to see your orders here</p>
            <Link 
              href="/products" 
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={order.product.image || '/placeholder.png'}
                        alt={order.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{order.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Order #{order.id.slice(0, 12)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.order_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-xl text-blue-600">
                            ${parseFloat(order.total_amount.toString()).toFixed(2)}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
