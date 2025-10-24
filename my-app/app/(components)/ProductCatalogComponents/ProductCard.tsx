'use client';

import React from 'react';
import Image from 'next/image';

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
  bgColor: string;
}

export default function ProductCard({ title, description, image, bgColor }: ProductCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className={`${bgColor} rounded-2xl aspect-square mb-4 p-8 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105`}>
        {/* Placeholder for product image */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/30 text-sm">Product Image</div>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}
