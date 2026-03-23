'use client';

import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export interface MockupPreviewModalProps {
  productId: string;
  productName: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  designId?: string;
}

export default function MockupPreviewModal({
  productId,
  productName,
  price,
  isOpen,
  onClose,
  designId,
}: MockupPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupId, setMockupId] = useState<string | null>(null);
  const [showMultiAngle, setShowMultiAngle] = useState(false);
  const [mockups, setMockups] = useState<any[]>([]);
  const { addItem } = useCart();

  if (!isOpen) return null;

  const generateMockup = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!designId) {
        setError('Please select or create a design first');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/mockups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || ''}`,
        },
        body: JSON.stringify({
          product_id: productId,
          design_id: designId,
          layer_position: 'front',
          display_size: 'high_res',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate mockup');
      }

      setMockupUrl(data.mockup?.image_url || null);
      setMockupId(data.mockup?.id || null);
    } catch (err: any) {
      setError(err.message || 'Error generating mockup');
      console.error('Mockup generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAllAngles = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!designId) {
        setError('Please select or create a design first');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/mockups/${productId}/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || ''}`,
        },
        body: JSON.stringify({
          design_id: designId,
          display_size: 'high_res',
          include_video: false,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate mockups');
      }

      setMockups(data.mockups || []);
      setShowMultiAngle(true);
      if (data.mockups?.length > 0) {
        setMockupUrl(data.mockups[0].image_url);
        setMockupId(data.mockups[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error generating mockups');
      console.error('Multi-angle mockup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (addItem && mockupId) {
      addItem({
        id: `${productId}-${mockupId}`,
        product_id: productId,
        name: productName,
        price,
        quantity: 1,
        image_url: mockupUrl || '',
        design_id: designId || '',
        variant: 'front',
      });

      // Close modal after adding
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{productName}</h2>
            <p className="text-gray-600 text-sm mt-1">${price.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">{error}</p>
                {error.includes('design') && (
                  <p className="text-sm text-red-700 mt-1">
                    Please create or select a design first before previewing.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mockup Preview */}
          {mockupUrl ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <img
                  src={mockupUrl}
                  alt={`${productName} mockup`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Multi-angle Tabs */}
              {showMultiAngle && mockups.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">View angles:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {mockups.map((mockup, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMockupUrl(mockup.image_url);
                          setMockupId(mockup.id);
                        }}
                        className={`p-2 border-2 rounded-lg transition-all ${
                          mockupUrl === mockup.image_url
                            ? 'border-[#f08080] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-square relative bg-gray-50 rounded">
                          <img
                            src={mockup.image_url}
                            alt={mockup.layer_position}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-700 mt-1 capitalize text-center">
                          {mockup.layer_position}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-[#f08080] animate-spin" />
                  <p className="text-gray-600 font-medium">Generating mockup...</p>
                  <p className="text-xs text-gray-500">
                    This may take 30-40 seconds
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Preview your design on this product
                  </p>
                  <div className="inline-block text-4xl mb-4">🎨</div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!mockupUrl && (
              <>
                <button
                  onClick={generateMockup}
                  disabled={loading || !designId}
                  className="flex-1 bg-gradient-to-r from-[#f08080] to-[#f4978e] hover:from-[#f08080]/90 hover:to-[#f4978e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Front View</span>
                  )}
                </button>
                <button
                  onClick={generateAllAngles}
                  disabled={loading || !designId}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 rounded-lg transition-all"
                >
                  All Angles
                </button>
              </>
            )}

            {mockupUrl && (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-[#f08080] to-[#f4978e] hover:from-[#f08080]/90 hover:to-[#f4978e]/90 text-white font-medium py-3 rounded-lg transition-all"
                >
                  Add to Cart
                </button>
                <button
                  onClick={generateAllAngles}
                  disabled={loading || !designId || showMultiAngle}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View All Angles
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
            >
              Close
            </button>
          </div>

          {/* Help Text */}
          {!mockupUrl && !designId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Tip:</span> You need an active design to generate a mockup. 
                Start by creating or uploading a design.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
