'use client';

import React from 'react';

interface PageHeroProps {
  title: string;
  description: string;
  subtitle?: string;
  backgroundGradient?: boolean;
}

export default function PageHero({
  title,
  description,
  subtitle,
  backgroundGradient = true,
}: PageHeroProps) {
  return (
    <div
      className={`px-6 py-12 md:py-16 border-b ${
        backgroundGradient
          ? 'bg-gradient-to-r from-[#f08080]/5 to-[#f4978e]/5'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 mb-2">{description}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
