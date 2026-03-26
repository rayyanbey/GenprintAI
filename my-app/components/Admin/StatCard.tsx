'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last week',
  icon,
  iconBg = 'from-[#ef4444] to-[#f08080]',
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive && (
            <>
              <div className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-semibold">+{change}%</span>
              </div>
              <span className="text-xs text-gray-400">{changeLabel}</span>
            </>
          )}
          {isNegative && (
            <>
              <div className="flex items-center gap-0.5 text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs font-semibold">{change}%</span>
              </div>
              <span className="text-xs text-gray-400">{changeLabel}</span>
            </>
          )}
          {isNeutral && (
            <>
              <div className="flex items-center gap-0.5 text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                <Minus className="w-3 h-3" />
                <span className="text-xs font-semibold">0%</span>
              </div>
              <span className="text-xs text-gray-400">{changeLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
