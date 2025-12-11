'use client';

import React from 'react';
import ProductCard from './ProductCard';

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

export default function ApparelSection({ products = [] }: Props) {
  // Filter apparel products or use hardcoded fallback
  const apparelProducts = products.length > 0
    ? products.filter(p => 
        p.type_name?.toLowerCase().includes('shirt') ||
        p.type_name?.toLowerCase().includes('hoodie') ||
        p.type_name?.toLowerCase().includes('cap') ||
        p.type_name?.toLowerCase().includes('sock')
      ).slice(0, 8).map(p => ({
        title: p.name,
        description: `${p.brand} - ${p.type_name}`,
        image: p.image_url,
        bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
        link: `/products/${p.id}`,
      }))
    : [
        {
          title: 'Custom T-Shirts',
          description: 'Create your own style with our AI tools.',
          image: '/images/tshirt.png',
          bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
          link: undefined,
        },
        {
          title: 'Personalized Hoodies',
          description: 'Cozy and stylish custom-designed hoodies.',
          image: '/images/hoodie.png',
          bgColor: 'bg-gradient-to-br from-[#f8ad9d] to-[#f4978e]',
          link: undefined,
        },
        {
          title: 'Design Your Own Caps',
          description: 'Top off your look with a personalized cap.',
          image: '/images/cap.png',
          bgColor: 'bg-gradient-to-br from-[#fbc4ab] to-[#f8ad9d]',
          link: undefined,
        },
        {
          title: 'Unique Socks',
          description: 'Step up your sock game with unique designs.',
          image: '/images/socks.png',
          bgColor: 'bg-gradient-to-br from-[#ffdab9] to-[#fbc4ab]',
          link: undefined,
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
              link={product.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
