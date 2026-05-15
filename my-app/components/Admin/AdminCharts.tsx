'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.name === 'revenue' ? `$${parseFloat(entry.value).toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// === Revenue Area Chart ===
export function RevenueAreaChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Revenue Overview</h3>
          <p className="text-sm text-gray-400 mt-0.5">Monthly revenue</p>
        </div>
        <div className="flex gap-2">
          {['1W', '1M', '3M', '1Y'].map((p) => (
            <button key={p} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${p === '1Y' ? 'bg-[#ef4444] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2.5} fill="url(#revGrad)" name="revenue" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// === Orders Bar Chart ===
export function OrdersBarChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">Weekly Orders</h3>
        <p className="text-sm text-gray-400 mt-0.5">Order status breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={8} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
          <Bar dataKey="pending" name="pending" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          <Bar dataKey="shipped" name="shipped" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          <Bar dataKey="delivered" name="delivered" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// === User Growth Line Chart ===
export function UserGrowthChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">User Growth</h3>
        <p className="text-sm text-gray-400 mt-0.5">Total registered users</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f08080" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#f08080" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 999 ? `${(v/1000).toFixed(1)}k` : v} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="users" name="users" stroke="#f08080" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#ef4444' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// === Designs Pie Chart ===
const PIE_COLORS = ['#ef4444', '#f08080', '#fbc4ab', '#fbbf24', '#60a5fa'];

export function DesignsPieChart({ data }: { data: any[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1; // avoid div by zero
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">Designs by Category</h3>
        <p className="text-sm text-gray-400 mt-0.5">Design distribution</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={`${item.name}-${i}`} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
              <span className="text-xs font-semibold text-gray-800">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// === Monthly Revenue Bar Chart (for Analytics) ===
export function MonthlyRevenueBarChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-base">Monthly Revenue</h3>
        <p className="text-sm text-gray-400 mt-0.5">Revenue breakdown by month</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f08080" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" name="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
