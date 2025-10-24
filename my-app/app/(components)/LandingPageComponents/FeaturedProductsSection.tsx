'use client';

import React from 'react';
import Link from 'next/link';

export default function FeaturedProductsSection() {
  const products = [
    {
      title: 'Custom T-shirts',
      description: 'Express yourself with AI-generated designs on high-quality apparel.',
      image: '/images/tshirt.png',
      bgColor: 'bg-gradient-to-br from-[#fbc4ab] to-[#ffdab9]',
    },
    {
      title: 'Personalized Mugs',
      description: 'Enjoy your favorite beverage with a mug that reflects your style.',
      image: '/images/mug.png',
      bgColor: 'bg-gradient-to-br from-[#f8ad9d] to-[#fbc4ab]',
    },
    {
      title: 'Unique Phone Cases',
      description: 'Protect your phone with a case designed by you, powered by AI.',
      image: '/images/phone-case.png',
      bgColor: 'bg-gradient-to-br from-[#f4978e] to-[#f8ad9d]',
    },
  ];

  return (
    <section className="w-full px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`${product.bgColor} h-64 flex items-center justify-center p-8`}>
                {/* Placeholder for product image */}
                <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-white/50 text-sm">Product Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/home" className="inline-block px-8 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium shadow-lg">
            Start Designing Now
          </Link>
        </div>
      </div>
    </section>
  );
}
