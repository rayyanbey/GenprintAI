'use client';

import React from 'react';

export default function DashboardHero() {
  return (
    <section className="w-full px-6 py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Dashboard
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Manage your solo projects, collaborations, and community-sponsored designs.
        </p>
      </div>
    </section>
  );
}
