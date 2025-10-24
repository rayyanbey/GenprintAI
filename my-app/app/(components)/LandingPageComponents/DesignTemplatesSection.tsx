'use client';

import React from 'react';

export default function DesignTemplatesSection() {
  const templates = [
    {
      title: 'Abstract Art',
      gradient: 'bg-gradient-to-br from-[#fbc4ab] via-[#ffdab9] to-[#f8ad9d]',
    },
    {
      title: 'Geometric Patterns',
      gradient: 'bg-gradient-to-br from-[#f8ad9d] via-[#fbc4ab] to-[#f4978e]',
    },
    {
      title: 'Nature Inspired',
      gradient: 'bg-gradient-to-br from-[#ffdab9] via-[#fbc4ab] to-[#f8ad9d]',
    },
    {
      title: 'Minimalist Designs',
      gradient: 'bg-gradient-to-br from-[#fbc4ab] via-[#f4978e] to-[#f08080]',
    },
  ];

  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Design Templates
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >
              <div className={`${template.gradient} rounded-2xl aspect-square mb-4 hover:scale-105 transition-transform relative overflow-hidden`}>
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-30">
                  {index === 1 && (
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute bg-white/20 rounded-full"
                          style={{
                            width: '80px',
                            height: '80px',
                            top: `${i * 20}%`,
                            left: `${i * 15}%`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                {template.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
