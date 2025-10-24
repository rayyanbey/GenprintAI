'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function HomeLivingSection() {
  const homeLivingProducts = [
    {
      title: 'Custom Pillows',
      description: 'Add a personal touch to your home decor.',
      image: '/images/pillow.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
    {
      title: 'Personalized Blankets',
      description: 'Stay warm with a blanket featuring your design.',
      image: '/images/blanket.png',
      bgColor: 'bg-gradient-to-br from-[#fbc4ab] to-[#f8ad9d]',
    },
    {
      title: 'Design Your Own Posters',
      description: 'Decorate walls with your creative posters.',
      image: '/images/poster.png',
      bgColor: 'bg-gradient-to-br from-[#f8ad9d] to-[#fbc4ab]',
    },
    {
      title: 'Unique Coasters',
      description: 'Protect surfaces with stylish, unique coasters.',
      image: '/images/coasters.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
  ];

  return (
    <section className="w-full px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Home & Living
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {homeLivingProducts.map((product, index) => (
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
