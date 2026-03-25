'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Download } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useMockupGeneration } from '@/hooks/useMockupGeneration';

export interface MockupPreviewModalProps {
  productId: string;
  productName: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  designId?: string;
  designImageUrl?: string;
}

/**
 * Enhanced MockupPreviewModal with proper async Printful API integration
 *
 * Features:
 * - Single angle mockup (fast)
 * - Multi-angle mockup (all angles)
 * - Proper polling with progress indicator
 * - Error handling and retry
 * - URL expiration info
 * - Add to cart with selected angle
 */
export default function MockupPreviewModalAsync({
  productId,
  productName,
  price,
  isOpen,
  onClose,
  designId,
  designImageUrl,
}: MockupPreviewModalProps) {
  const { addItem } = useCart();
  const {
    status,
    mockupData,
    error,
    progress,
    generateMockup,
    generateMultiAngleMockups,
    reset,
  } = useMockupGeneration({
    pollInterval: 2000, // Poll every 2 seconds
    maxRetries: 45, // Up to 90 seconds
  });

  const [selectedAngle, setSelectedAngle] = useState('front');
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [printFiles, setPrintFiles] = useState<any>(null);

  // Load print files on mount
  useEffect(() => {
    if (isOpen && productId) {
      loadPrintFiles();
    }
  }, [isOpen, productId]);

  const loadPrintFiles = async () => {
    try {
      const response = await fetch(`/api/mockups/printfiles/${productId}`);
      const data = await response.json();
      if (data.success) {
        setPrintFiles(data.data);
      }
    } catch (err) {
      console.error('Failed to load print files:', err);
    }
  };

  const handleGenerateSingleMockup = async () => {
    if (!designImageUrl) {
      alert('Please select a design first');
      return;
    }

    try {
      await generateMockup({
        product_id: productId,
        design_id: designId || 'temp-' + Date.now(),
        design_image_url: designImageUrl,
        placement: selectedAngle,
      });
      setMode('single');
    } catch (err) {
      console.error('Failed to generate mockup:', err);
    }
  };

  const handleGenerateMultiAngle = async () => {
    if (!designImageUrl) {
      alert('Please select a design first');
      return;
    }

    try {
      await generateMultiAngleMockups({
        product_id: productId,
        design_id: designId || 'temp-' + Date.now(),
        design_image_url: designImageUrl,
        placements: Object.keys(printFiles?.availablePlacements || { front: 'Front' }),
      });
      setMode('multi');
    } catch (err) {
      console.error('Failed to generate mockups:', err);
    }
  };

  const handleAddToCart = () => {
    if (!mockupData?.mockups) return;

    const currentMockup = mockupData.mockups.find(
      (m: any) => m.placement === selectedAngle
    );

    if (!currentMockup) {
      alert('Please select an angle');
      return;
    }

    addItem({
      id: `${productId}-${selectedAngle}`,
      product_id: productId,
      design_id: designId || '',
      quantity: 1,
      image_url: currentMockup.mockup_url,
      variant: selectedAngle,
      mockup_placement: selectedAngle,
    });

    onClose();
  };

  const handleDownloadMockup = async () => {
    if (!mockupData?.mockups) return;

    const currentMockup = mockupData.mockups.find(
      (m: any) => m.placement === selectedAngle
    );

    if (!currentMockup?.mockup_url) return;

    try {
      const response = await fetch(currentMockup.mockup_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mockup-${selectedAngle}-${Date.now()}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download mockup:', err);
      alert('Failed to download mockup');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{productName}</h2>
            <p className="text-gray-600">${price.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status: Idle - Show options */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 mb-4">
                  👀 Preview how your design looks on the product before ordering
                </p>

                {printFiles?.availablePlacements && (
                  <>
                    {/* Placement Selector */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Select Placement:
                      </label>
                      <select
                        value={selectedAngle}
                        onChange={(e) => setSelectedAngle(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        {Object.entries(printFiles.availablePlacements).map(
                          ([key, label]: [string, any]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Generate Options */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateSingleMockup}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Generate This Angle
                      </button>

                      {Object.keys(printFiles.availablePlacements).length > 1 && (
                        <button
                          onClick={handleGenerateMultiAngle}
                          className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                        >
                          Generate All Angles
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status: Pending - Show progress */}
          {status === 'pending' && (
            <div className="text-center space-y-4">
              <Loader2 className="animate-spin mx-auto" size={40} />
              <p className="font-medium">Generating mockup...</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress}%</p>

              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                ⏱️ This typically takes 10-30 seconds. Please wait...
              </p>
            </div>
          )}

          {/* Status: Failed - Show error */}
          {status === 'failed' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border border-red-200">
                <AlertCircle className="text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>

              <button
                onClick={() => reset()}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Status: Completed - Show mockup */}
          {status === 'completed' && mockupData?.mockups && (
            <div className="space-y-4">
              {/* Mockup Image */}
              <div className="bg-gray-100 rounded-lg p-4">
                {mockupData.mockups[0]?.mockup_url && (
                  <img
                    src={mockupData.mockups[0].mockup_url}
                    alt="Product mockup"
                    className="w-full rounded-lg"
                  />
                )}
              </div>

              {/* Angle Selector */}
              {mockupData.mockups.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Viewing Angles:</label>
                  <div className="flex gap-2 flex-wrap">
                    {mockupData.mockups.map((mockup: any) => (
                      <button
                        key={mockup.placement}
                        onClick={() => setSelectedAngle(mockup.placement)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          selectedAngle === mockup.placement
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {mockup.display_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiration Warning */}
              <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
                ⚠️ Mockup images expire in 72 hours. Save or order soon if needed.
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadMockup}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Add to Cart
                </button>
              </div>

              <button
                onClick={() => reset()}
                className="w-full text-blue-500 hover:text-blue-700 text-sm py-2"
              >
                Generate Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
