'use client';

import React, { useState } from 'react';
import DesignSelector from './DesignSelector';
import ProductSelector from './ProductSelector';
import MockupPreview from './MockupPreview';

interface Design {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  created_at: string;
}

interface MockupRequestPageProps {
  initialProductId?: string;
}

export default function MockupRequestPage({ initialProductId }: MockupRequestPageProps) {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProductId || null
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [hasInStockVariants, setHasInStockVariants] = useState<boolean | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState('front');

  const handleSelectDesign = (design: Design) => {
    setSelectedDesign(design);
  };

  const handleSelectProduct = (productId: string, placement: string) => {
    setSelectedProductId(productId);
    setSelectedPlacement(placement);
    setHasInStockVariants(null);
  };

  const handleSelectVariant = (variantId: number | null) => {
    setSelectedVariantId(variantId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Request Mockup</h1>
        <p className="text-gray-600 text-lg mt-2">
          Select a design and product to see how it looks
        </p>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Design Selector */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
          <DesignSelector
            onSelectDesign={handleSelectDesign}
            selectedDesignId={selectedDesign?.id}
          />
        </div>

        {/* Middle Panel - Product Selector */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
          <ProductSelector
            onSelectProduct={handleSelectProduct}
            onSelectVariant={handleSelectVariant}
            onVariantAvailabilityChange={setHasInStockVariants}
            selectedProductId={selectedProductId || undefined}
            selectedPlacement={selectedPlacement}
            selectedVariantId={selectedVariantId || undefined}
          />
        </div>

        {/* Right Panel - Mockup Preview */}
        <div className="w-1/3 bg-gray-50 overflow-hidden">
          <MockupPreview
            design={selectedDesign}
            productId={selectedProductId}
            placement={selectedPlacement}
            variantId={selectedVariantId}
            hasInStockVariants={hasInStockVariants}
          />
        </div>
      </div>
    </div>
  );
}
