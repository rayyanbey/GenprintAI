'use client';

import React, { useEffect, useState } from 'react';
import { Users, ShoppingCart, DollarSign, Palette, TrendingUp, Package, Activity, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/Admin/StatCard';
import { RevenueAreaChart, OrdersBarChart, UserGrowthChart, DesignsPieChart } from '@/components/Admin/AdminCharts';

const statusColors: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700',
  shipped: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
};

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch('/api/admin/overview');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        
        const resCharts = await fetch('/api/admin/analytics');
        const jsonCharts = await resCharts.json();

        setData({
          ...json,
          charts: jsonCharts.charts,
          topDesigns: jsonCharts.topDesigns
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (error) return <div className="text-red-500 p-5 bg-red-50 rounded-xl">Error loading dashboard: {error}</div>;

  const { stats, recentOrders, activityFeed, charts, topDesigns } = data;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, change: parseFloat(stats.totalUsersChange), icon: <Users className="w-5 h-5" />, iconBg: 'from-[#ef4444] to-[#f08080]' },
    { title: 'Total Orders', value: stats.totalOrders, change: parseFloat(stats.totalOrdersChange), icon: <ShoppingCart className="w-5 h-5" />, iconBg: 'from-[#3b82f6] to-[#60a5fa]' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: parseFloat(stats.totalRevenueChange), icon: <DollarSign className="w-5 h-5" />, iconBg: 'from-[#10b981] to-[#34d399]' },
    { title: 'Designs Generated', value: stats.totalDesigns, change: parseFloat(stats.totalDesignsChange), icon: <Palette className="w-5 h-5" />, iconBg: 'from-[#8b5cf6] to-[#a78bfa]' },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = charts?.monthlyRevenue?.map((rev: number, i: number) => ({ month: months[i], revenue: rev })).filter((d: any) => d.revenue > 0) || [];
  const finalRevData = revenueData.length > 0 ? revenueData : [{ month: 'Jan', revenue: 0 }];

  // Fetch from the API payload returned
  const finalOrdersData = data.ordersData || [];

  const userGrowthData = charts?.userGrowth?.map((users: number, i: number) => ({ month: months[i], users })).filter((d: any) => d.users > 0) || [];
  const finalGrowthData = userGrowthData.length > 0 ? userGrowthData : [{ month: 'Jan', users: 0 }];

  const designPieData = topDesigns?.length > 0 
    ? topDesigns.map((d: any) => ({ name: d.category, value: d.uses }))
    : [{ name: 'Artwork', value: stats.totalDesigns || 1 }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.title} {...s} changeLabel="vs last week" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueAreaChart data={finalRevData} />
        <OrdersBarChart data={finalOrdersData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UserGrowthChart data={finalGrowthData} />
        <DesignsPieChart data={designPieData} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold px-5 py-3">Order</th>
                <th className="text-left text-xs font-semibold px-3 py-3">Customer</th>
                <th className="text-left text-xs font-semibold px-3 py-3">Amount</th>
                <th className="text-left text-xs font-semibold px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((o: any) => (
                <tr key={o.id} className="border-t border-gray-50">
                  <td className="px-5 py-3.5 text-sm">#{o.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-3 py-3.5 text-sm">{o.user}</td>
                  <td className="px-3 py-3.5 text-sm">${o.amount}</td>
                  <td className="px-3 py-3.5"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
