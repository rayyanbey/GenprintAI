'use client';

import React, { useState } from 'react';
import { ProductBrowser } from '@/components/ProductBrowser';
import { MockupPreviewModal } from '@/components/Mockups';
import { PageHero } from '@/components/PageHero';

export default function ProductsPage() {
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handlePreview = (productId: string) => {
    setPreviewProductId(productId);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewProductId(null);
  };

  return (
    <>
      <PageHero
        title="Our Products"
        description="Explore our collection of high-quality, customizable products perfect for your designs."
        subtitle="From apparel to home goods, find the perfect base for your custom creations."
      />
      
      <div className="bg-white">
        <ProductBrowser onPreview={handlePreview} />
      </div>
      
      {previewProductId && (
        <MockupPreviewModal
          isOpen={showPreviewModal}
          onClose={handleClosePreview}
          productId={previewProductId}
          productName="Product Preview"
          price={0}
        />
      )}
    </>
  );
}
