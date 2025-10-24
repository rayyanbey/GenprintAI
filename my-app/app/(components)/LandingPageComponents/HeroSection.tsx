'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="w-full px-6 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#f8ad9d] via-[#fbc4ab] to-[#ffdab9] rounded-3xl p-12 md:p-16 lg:p-20 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#f08080] to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#ffdab9] to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Personalized Merchandise, Powered by AI
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Genprint AI revolutionizes custom merchandise with AI-driven designs and real-time 3D previews, ensuring your vision comes to life perfectly.
            </p>
            <button className="px-8 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium text-lg shadow-lg">
              Start Designing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
