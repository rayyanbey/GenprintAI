'use client';

import React from 'react';

type Status = 'pending' | 'shipped' | 'delivered' | 'approved' | 'rejected' | 'paid' | 'unpaid' | 'active' | 'banned' | 'admin' | 'customer' | 'designer';

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  shipped:   { label: 'Shipped',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  approved:  { label: 'Approved',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:  { label: 'Rejected',  className: 'bg-red-50 text-red-600 border-red-200' },
  paid:      { label: 'Paid',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unpaid:    { label: 'Unpaid',    className: 'bg-red-50 text-red-600 border-red-200' },
  active:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  banned:    { label: 'Banned',    className: 'bg-red-50 text-red-600 border-red-200' },
  admin:     { label: 'Admin',     className: 'bg-purple-50 text-purple-700 border-purple-200' },
  customer:  { label: 'Customer',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  designer:  { label: 'Designer',  className: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60" />
      {config.label}
    </span>
  );
}
