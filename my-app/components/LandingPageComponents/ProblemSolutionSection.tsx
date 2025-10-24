'use client';

import React from 'react';

export default function ProblemSolutionSection() {
  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* The Problem */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            The Problem
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Traditional merchandise platforms lack personalization and live previews, leading to dissatisfaction with final products. Genprint AI addresses this by offering AI-generated designs tailored to your preferences and interactive 3D previews for a seamless experience.
          </p>
        </div>

        {/* Our Solution */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Solution
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Genprint AI integrates AI, 3D product previews, and web technology themes to provide a unique, tailored design experience. Our platform ensures your custom merchandise reflects your style with precision and creativity.
          </p>
        </div>
      </div>
    </section>
  );
}
