'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function AccessoriesSection() {
  const accessoriesProducts = [
    {
      title: 'Custom Phone Cases',
      description: 'Protect your phone with a case that reflects your style.',
      image: '/images/phone-case.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
    {
      title: 'Personalized Mugs',
      description: 'Enjoy your favorite beverage in a mug with a designer.',
      image: '/images/mug.png',
      bgColor: 'bg-gradient-to-br from-[#f8ad9d] to-[#fbc4ab]',
    },
    {
      title: 'Design Your Own Tote Bags',
      description: 'Carry your essentials in a tote with a personal touch.',
      image: '/images/tote.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
    {
      title: 'Unique Stickers',
      description: 'Add flair to your belongings with custom stickers.',
      image: '/images/stickers.png',
      bgColor: 'bg-gradient-to-br from-[#fbc4ab] to-[#f8ad9d]',
    },
  ];

  return (
    <section className="w-full px-6 py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Accessories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {accessoriesProducts.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              description={product.description}
              image={product.image}
              bgColor={product.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
