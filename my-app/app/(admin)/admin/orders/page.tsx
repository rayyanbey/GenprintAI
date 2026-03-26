'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/Admin/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/orders?limit=15');
        const data = await res.json();
        setOrders(data.orders || []);
      } finally { setLoading(false); }
    }
    init();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-xs font-semibold px-5 py-3 uppercase">Order #</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Customer</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Product</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Amount</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-5 py-4 text-sm font-mono font-bold text-gray-700">#{order.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-4 py-4 text-sm">{order.user.name}</td>
                  <td className="px-4 py-4 text-sm">{order.product}</td>
                  <td className="px-4 py-4 text-sm font-bold">${order.amount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
