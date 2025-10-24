'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function ApparelSection() {
  const apparelProducts = [
    {
      title: 'Custom T-Shirts',
      description: 'Create your own style with our AI tools.',
      image: '/images/tshirt.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
    {
      title: 'Personalized Hoodies',
      description: 'Cozy and stylish custom-designed hoodies.',
      image: '/images/hoodie.png',
      bgColor: 'bg-gradient-to-br from-[#f8ad9d] to-[#f4978e]',
    },
    {
      title: 'Design Your Own Caps',
      description: 'Top off your look with a personalized cap.',
      image: '/images/cap.png',
      bgColor: 'bg-gradient-to-br from-[#fbc4ab] to-[#f8ad9d]',
    },
    {
      title: 'Unique Socks',
      description: 'Step up your sock game with unique designs.',
      image: '/images/socks.png',
      bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
    },
  ];

  return (
    <section className="w-full px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Apparel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {apparelProducts.map((product, index) => (
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
