'use client';

import React from 'react';

export default function CTASection() {
  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Ready to Create?
        </h2>
        <button className="px-8 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium text-lg shadow-lg">
          Start Designing
        </button>
      </div>
    </section>
  );
}
