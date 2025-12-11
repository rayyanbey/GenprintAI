'use client';

import React from 'react';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductCatalogHero from './ProductCatalogHero';
import ApparelSection from './ApparelSection';
import AccessoriesSection from './AccessoriesSection';
import HomeLivingSection from './HomeLivingSection';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  brand: string;
  type_name: string;
}

interface Props {
  products?: Product[];
}

export default function ProductCatalog({ products = [] }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ProductCatalogHeader />

      {/* Hero Section */}
      <ProductCatalogHero />

      {/* Apparel Section */}
      <ApparelSection products={products} />

      {/* Accessories Section */}
      <AccessoriesSection products={products} />

      {/* Home & Living Section */}
      <HomeLivingSection products={products} />
    </div>
  );
}
