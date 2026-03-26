'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';

// Default price when POD doesn't return a price
const DEFAULT_PRODUCT_PRICE = 100;

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price: number | null;
  category: string;
  variant_count?: number;
  onPreview?: (productId: string) => void;
}

export default function ProductCardEnhanced({
  id,
  name,
  description,
  image_url,
  price,
  category,
  variant_count,
  onPreview,
}: ProductCardProps) {
  // Use default price if not provided
  const displayPrice = price || DEFAULT_PRODUCT_PRICE;

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPreview) {
      onPreview(id);
    }
  };

  return (
    <div className="group flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-gray-400 text-sm">No image</div>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
          {category}
        </div>
        {/* Variant Count */}
        {variant_count && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-600">
            {variant_count} variants
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {name}
        </h3>
        {description && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto mb-4">
          <p className="text-lg font-bold text-gray-900">
            ${displayPrice.toFixed(2)}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/products/${id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#f08080] to-[#f4978e] hover:from-[#f08080]/90 hover:to-[#f4978e]/90 text-white font-medium py-2 rounded-lg transition-all text-sm"
          >
            <ShoppingCart size={16} />
            <span>View Details</span>
          </Link>
          {onPreview && (
            <button
              onClick={handlePreview}
              className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg transition-all text-sm"
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
