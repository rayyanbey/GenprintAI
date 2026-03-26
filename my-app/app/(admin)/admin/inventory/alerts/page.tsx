'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface LowStockVariant {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  color?: string;
  size?: string;
  sku: string;
  stock_level: number;
  low_stock_threshold: number;
  price: string;
}

export default function AdminInventoryAlertsPage() {
  const [variants, setVariants] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'stock' | 'threshold' | 'product'>('stock');

  useEffect(() => {
    fetchLowStockVariants();
  }, []);

  const fetchLowStockVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory/low-stock');
      const data = await response.json();

      if (data.success) {
        setVariants(data.variants || []);
      } else {
        setError(data.error || 'Failed to load inventory');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedVariants = () => {
    const sorted = [...variants];
    switch (sortBy) {
      case 'stock':
        return sorted.sort((a, b) => a.stock_level - b.stock_level);
      case 'threshold':
        return sorted.sort((a, b) => b.low_stock_threshold - a.low_stock_threshold);
      case 'product':
        return sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
      default:
        return sorted;
    }
  };

  const getAlertLevel = (stockLevel: number, threshold: number) => {
    if (stockLevel === 0) return 'critical';
    if (stockLevel <= threshold / 2) return 'high';
    return 'medium';
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTextColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-800';
      case 'high':
        return 'text-orange-800';
      case 'medium':
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };

  const sortedVariants = getSortedVariants();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Alerts</h1>
        <button
          onClick={fetchLowStockVariants}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-semibold">Critical (0 stock)</p>
          <p className="text-3xl font-bold text-red-600">
            {sortedVariants.filter((v) => v.stock_level === 0).length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 text-sm font-semibold">High Alert</p>
          <p className="text-3xl font-bold text-orange-600">
            {sortedVariants.filter((v) => getAlertLevel(v.stock_level, v.low_stock_threshold) === 'high').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm font-semibold">Medium Alert</p>
          <p className="text-3xl font-bold text-yellow-600">
            {sortedVariants.filter((v) => getAlertLevel(v.stock_level, v.low_stock_threshold) === 'medium').length}
          </p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        <label className="text-sm font-semibold text-gray-600">Sort by:</label>
        {(['stock', 'threshold', 'product'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-4 py-2 rounded-lg transition ${
              sortBy === option
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Variants Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : sortedVariants.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-green-800 font-semibold">✓ All inventory levels are healthy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVariants.map((variant) => {
            const alertLevel = getAlertLevel(variant.stock_level, variant.low_stock_threshold);
            const alertColor = getAlertColor(alertLevel);
            const alertTextColor = getAlertTextColor(alertLevel);

            return (
              <div
                key={variant.id}
                className={`border-2 rounded-lg p-4 ${alertColor} transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    {variant.product_image && (
                      <img
                        src={variant.product_image}
                        alt={variant.product_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${alertTextColor} truncate`}>
                      {variant.product_name}
                    </h3>
                    <p className={`text-xs ${alertTextColor} opacity-70`}>
                      {variant.color && variant.size
                        ? `${variant.color} / ${variant.size}`
                        : variant.color || variant.size || 'N/A'}
                    </p>
                    <p className={`text-xs ${alertTextColor} opacity-70 font-mono mt-1`}>
                      SKU: {variant.sku}
                    </p>

                    <div className="mt-3 space-y-2">
                      {/* Stock Level */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`font-semibold ${alertTextColor}`}>Stock Level</span>
                          <span className={`font-bold ${alertTextColor}`}>
                            {variant.stock_level} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              alertLevel === 'critical'
                                ? 'bg-red-600'
                                : alertLevel === 'high'
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                            }`}
                            style={{
                              width: `${Math.min(
                                (variant.stock_level / (variant.low_stock_threshold * 2)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Threshold Info */}
                      <div className="text-xs">
                        <span className={alertTextColor}>
                          Threshold: {variant.low_stock_threshold} units
                        </span>
                      </div>

                      {/* Price */}
                      <div className={`text-sm font-bold ${alertTextColor}`}>
                        ${parseFloat(variant.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Alert Icon */}
                  {alertLevel === 'critical' && (
                    <div className="text-red-600 text-2xl">!</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Alert Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
            <span>Critical: Stock = 0</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-orange-600 rounded-full mr-2"></span>
            <span>High: Stock ≤ 50% of threshold</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-yellow-600 rounded-full mr-2"></span>
            <span>Medium: Stock ≤ threshold</span>
          </div>
        </div>
      </div>
    </div>
  );
}
