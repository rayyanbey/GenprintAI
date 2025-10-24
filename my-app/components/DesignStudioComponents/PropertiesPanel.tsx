'use client';

import React from 'react';

export default function PropertiesPanel() {
  const colors = ['#ffffff', '#000000', '#d1d5db', '#3b82f6', '#ef4444'];
  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto p-6">
      {/* Product Options */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-4">Product Options</h3>
        
        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color
          </label>
          <div className="flex gap-2">
            {colors.map((color, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full border-2 ${
                  index === 1 ? 'border-gray-900' : 'border-gray-300'
                } hover:border-gray-400 transition-colors`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Size
          </label>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  size === 'M'
                    ? 'bg-[#f4978e] text-white border-[#f4978e]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Design Details */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Design Details</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          AI has generated a vibrant, abstract design featuring geometric shapes with a retro color palette. The composition is balanced with energetic lines, creating a sense of dynamic movement. It's perfectly suited for a modern, creative t-shirt.
        </p>
      </div>
    </div>
  );
}
