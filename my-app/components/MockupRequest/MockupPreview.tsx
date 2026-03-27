'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, Download, ShoppingCart, Zap } from 'lucide-react';
import { useMockupGeneration } from '@/hooks/useMockupGeneration';
import { useCart } from '@/contexts/CartContext';

interface Design {
  id: string;
  title: string;
  artwork_file_url?: string;
}

interface MockupPreviewProps {
  design: Design | null;
  productId: string | null;
  placement: string;
  variantId: number | null;
  hasInStockVariants: boolean | null;
}

export default function MockupPreview({
  design,
  productId,
  placement,
  variantId,
  hasInStockVariants,
}: MockupPreviewProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const {
    status,
    mockupData,
    error,
    progress,
    generateMockup,
    reset,
  } = useMockupGeneration({
    pollInterval: 2000,
    maxRetries: 45,
  });

  const isReady =
    design &&
    productId &&
    placement &&
    design.artwork_file_url &&
    variantId &&
    hasInStockVariants !== false;

  const handleGenerateMockup = async () => {
    if (!isReady) return;

    const selectedDesign = design;
    const selectedVariantId = variantId;
    if (!selectedDesign || !selectedVariantId) return;

    try {
      await generateMockup({
        product_id: productId,
        design_id: selectedDesign.id,
        design_image_url: selectedDesign.artwork_file_url!,
        variant_ids: [selectedVariantId],
        placement,
      });
    } catch (err) {
      console.error('Failed to generate mockup:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!mockupData?.mockups?.[0]) return;
    if (!productId || !design || !variantId) return;

    setIsAddingToCart(true);
    try {
      addItem({
        id: `${productId}-${variantId}-${placement}`,
        product_id: productId!,
        name: `${design.title} Mockup`,
        price: 0,
        image_url: mockupData.mockups[0].mockup_url || '',
        design_id: design.id,
        quantity: 1,
        variant: {
          sku: `SKU-${variantId}`,
          color: placement,
          size: 'Selected',
        },
      });

      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const mockupUrl = mockupData?.mockups?.[0]?.mockup_url;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Mockup Preview</h2>
        <p className="text-xs text-gray-600 mt-1">
          See your design on the product
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-6">
        {!isReady ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            {productId && hasInStockVariants === false ? (
              <>
                <p className="text-gray-700 font-semibold">
                  This product has no in-stock variants.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please select another product. Stock is empty for this one.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  Select a design and product to generate mockup
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Choose design, product, and variant from the panels on the left
                </p>
              </>
            )}
          </div>
        ) : status === 'idle' ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Zap className="w-12 h-12 text-[#f4978e] mb-4" />
            <p className="text-gray-600 font-medium">Ready to generate</p>
            <p className="text-sm text-gray-500 mt-2">
              Click the button below to create a mockup
            </p>
            <div className="mt-6 w-full max-w-xs">
              <img
                src={design.artwork_file_url}
                alt={design.title}
                className="w-full h-auto rounded-lg border border-gray-200"
              />
              <p className="text-xs text-gray-600 mt-2">{design.title}</p>
            </div>
          </div>
        ) : status === 'pending' ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-[#f4978e] animate-spin mx-auto" />
            </div>
            <p className="text-gray-600 font-medium">Generating mockup</p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a minute...
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mt-6 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#f4978e] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 95)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}%</p>
          </div>
        ) : status === 'completed' && mockupUrl ? (
          <div className="flex flex-col items-center w-full h-full">
            <div className="relative w-full max-w-sm mb-6">
              <img
                src={mockupUrl}
                alt="Mockup"
                className="w-full h-auto rounded-lg border border-gray-200 shadow-md"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                ⏰ Mockup URL expires in 72 hours
              </p>
            </div>

            {cartSuccess && (
              <div className="w-full max-w-sm p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Added to cart!
                </p>
              </div>
            )}

            {error && (
              <div className="w-full max-w-sm p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : status === 'failed' ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-600 font-medium">Generation failed</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-6 space-y-3">
        {status === 'idle' && isReady && (
          <button
            onClick={handleGenerateMockup}
            className="w-full px-4 py-3 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Generate Mockup
          </button>
        )}

        {status === 'completed' && mockupUrl && (
          <>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? 'Adding to cart...' : 'Add to Cart'}
            </button>
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              Generate Another
            </button>
          </>
        )}

        {status === 'failed' && (
          <button
            onClick={reset}
            className="w-full px-4 py-3 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] transition-colors font-medium"
          >
            Try Again
          </button>
        )}

        {status === 'pending' && (
          <button
            disabled
            className="w-full px-4 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium"
          >
            Generating...
          </button>
        )}
      </div>
    </div>
  );
}
