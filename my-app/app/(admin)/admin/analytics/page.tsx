'use client';

import React, { useState, useEffect } from 'react';
import { MonthlyRevenueBarChart, UserGrowthChart, DesignsPieChart } from '@/components/Admin/AdminCharts';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/analytics');
        const json = await res.json();
        setData(json);
      } finally { setLoading(false); }
    }
    init();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  const { charts, topDesigns } = data || {};
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const finalRevData = charts?.monthlyRevenue?.map((rev: number, i: number) => ({ month: months[i], revenue: rev })).filter((d: any) => d.revenue > 0) || [{ month: 'Jan', revenue: 0 }];
  const finalGrowthData = charts?.userGrowth?.map((users: number, i: number) => ({ month: months[i], users })).filter((d: any) => d.users > 0) || [{ month: 'Jan', users: 0 }];
  const designPieData = topDesigns?.length > 0 ? topDesigns.map((d: any) => ({ name: d.category, value: d.uses })) : [{ name: 'Artwork', value: 1 }];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyRevenueBarChart data={finalRevData} />
        <UserGrowthChart data={finalGrowthData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DesignsPieChart data={designPieData} />
      </div>
    </div>
  );
}
