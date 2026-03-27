'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductBrowser } from '@/components/ProductBrowser';
import { PageHero } from '@/components/PageHero';
import { Product } from '@/hooks/useProducts';

export default function ProductsPage() {
  const router = useRouter();

  const handlePreview = (product: Product) => {
    router.push(`/mockup-request?productId=${encodeURIComponent(product.id)}`);
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
    </>
  );
}
