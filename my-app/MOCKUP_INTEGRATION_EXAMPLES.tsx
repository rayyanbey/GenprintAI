/**
 * EXAMPLE: Product Card with Mockup Preview
 * Shows how to integrate MockupPreviewModalAsync into your product pages
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import MockupPreviewModalAsync from '@/components/Mockups/MockupPreviewModalAsync';

interface ProductCardExampleProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  design?: {
    id: string;
    name: string;
    artwork_file_url: string;
  };
}

/**
 * ✨ EXAMPLE: Product card with "Preview on Product" button
 * 
 * Usage:
 * <ProductCardExample
 *   product={{ id: '123', name: 'T-Shirt', price: 29.99, image: '...' }}
 *   design={{ id: 'design-1', name: 'My Design', artwork_file_url: '...' }}
 * />
 */
export function ProductCardExample({
  product,
  design,
}: ProductCardExampleProps) {
  const [showMockupModal, setShowMockupModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      {/* Product Image */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <h3 className="text-lg font-bold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Preview Button - NEW! */}
        <button
          onClick={() => setShowMockupModal(true)}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            design
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!design}
          title={design ? 'Preview design on product' : 'Select a design first'}
        >
          👀 Preview
        </button>

        {/* Add to Cart Button */}
        <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition">
          🛒 Add to Cart
        </button>
      </div>

      {/* Mockup Preview Modal */}
      {design && (
        <MockupPreviewModalAsync
          productId={product.id}
          productName={product.name}
          price={product.price}
          designId={design.id}
          designImageUrl={design.artwork_file_url}
          isOpen={showMockupModal}
          onClose={() => setShowMockupModal(false)}
        />
      )}
    </div>
  );
}

// ============================================

/**
 * EXAMPLE: Product Listing Page
 * Shows multiple products with mockup preview capability
 */
export function ProductListingPageExample() {
  // Mock data - replace with real data
  const products = [
    {
      id: '71',
      name: 'Classic T-Shirt',
      price: 24.99,
      image: '/images/tshirt.jpg',
    },
    {
      id: '72',
      name: 'Hoodie',
      price: 49.99,
      image: '/images/hoodie.jpg',
    },
  ];

  const design = {
    id: 'design-abc123',
    name: 'My Awesome Design',
    artwork_file_url: 'https://example.com/designs/abc123.png',
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCardExample
            key={product.id}
            product={product}
            design={design}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================

/**
 * EXAMPLE: Design Studio Page
 * After user creates a design, show products they can put it on
 */
export function DesignStudioExamplePage() {
  const userDesign = {
    id: 'design-xyz789',
    name: 'My Custom Design',
    artwork_file_url: 'https://example.com/user-designs/xyz789.png',
  };

  const recommendedProducts = [
    {
      id: '71',
      name: 'T-Shirt',
      price: 24.99,
      image: '/images/tshirt.jpg',
    },
    {
      id: '75',
      name: 'Hoodie',
      price: 49.99,
      image: '/images/hoodie.jpg',
    },
    {
      id: '76',
      name: 'Crewneck Sweatshirt',
      price: 44.99,
      image: '/images/sweatshirt.jpg',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Design is Ready! 🎨</h1>
        <p className="text-lg">
          See how it looks on different products before ordering
        </p>
      </div>

      {/* Product Grid with Design Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedProducts.map((product) => (
          <ProductCardExample
            key={product.id}
            product={product}
            design={userDesign}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          💡 Click "Preview" to see your design on each product
        </p>
        <p className="text-sm text-gray-500">
          Mockup images are generated in real-time using Printful's mockup API
        </p>
      </div>
    </div>
  );
}

// ============================================

/**
 * EXAMPLE: Direct Modal Usage (without ProductCard wrapper)
 */
export function DirectModalUsageExample() {
  const [showMockup, setShowMockup] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowMockup(true)}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
      >
        Preview Mockup
      </button>

      <MockupPreviewModalAsync
        productId="71"
        productName="Classic T-Shirt"
        price={24.99}
        designId="design-123"
        designImageUrl="https://example.com/design.png"
        isOpen={showMockup}
        onClose={() => setShowMockup(false)}
      />
    </div>
  );
}
