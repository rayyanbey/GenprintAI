'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function ProductSyncAdmin() {
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dev-sync-key-12345',
        },
        body: JSON.stringify({ limit }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          synced_count: data.synced_count,
          message: data.message,
        });
      } else {
        setError(data.error || 'Failed to sync products');
      }
    } catch (err: any) {
      setError(err.message || 'Error syncing products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sync Printful Products</h1>
          </div>

          <div className="space-y-6">
            {/* Current Limits Info */}
            <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h2 className="font-bold text-lg text-blue-900 mb-3">How Product Sync Works</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    This tool syncs products from Printful to your database
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    It downloads product details, variants, and pricing
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    All variants are synced with their retail prices from Printful
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    You can sync more products by increasing the limit and running again
                  </span>
                </li>
              </ul>
            </div>

            {/* Issue Info */}
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h2 className="font-bold text-lg text-amber-900 mb-3">Why You Only Have 50 Products</h2>
              <p className="text-amber-800 mb-3">
                The initial sync was set to sync only 50 products (default limit). Now you can sync more!
              </p>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold">#1</span>
                  <span>Change the number below to how many products you want (e.g., 200, 500)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">#2</span>
                  <span>Click "Sync Products" to start the process</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">#3</span>
                  <span>Wait for the process to complete (check console for progress)</span>
                </li>
              </ul>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Number of Products to Sync
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={limit}
                onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 50))}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 200-500 products for a good catalog
              </p>
            </div>

            {/* Results */}
            {result && (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-green-900">Sync Complete!</h3>
                    <p className="text-green-800">{result.message}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-100 rounded">
                  <p className="text-sm text-green-900">
                    <span className="font-bold">Products Synced:</span> {result.synced_count}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-red-900">Error</h3>
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Syncing... (This may take a minute)
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Sync {limit} Products
                </>
              )}
            </button>

            {/* Info */}
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                <span className="font-semibold">Note:</span> The first sync in the session may take
                longer as it downloads all product data and variants. Subsequent syncs are faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
