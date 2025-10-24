'use client';

import React from 'react';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductCatalogHero from './ProductCatalogHero';
import ApparelSection from './ApparelSection';
import AccessoriesSection from './AccessoriesSection';
import HomeLivingSection from './HomeLivingSection';

export default function ProductCatalog() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ProductCatalogHeader />

      {/* Hero Section */}
      <ProductCatalogHero />

      {/* Apparel Section */}
      <ApparelSection />

      {/* Accessories Section */}
      <AccessoriesSection />

      {/* Home & Living Section */}
      <HomeLivingSection />
    </div>
  );
}
