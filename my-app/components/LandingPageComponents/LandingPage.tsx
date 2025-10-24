'use client';

import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import FeaturedProductsSection from './FeaturedProductsSection';
import DesignTemplatesSection from './DesignTemplatesSection';
import AIToolsSection from './AIToolsSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem & Solution Section */}
      <ProblemSolutionSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Design Templates Section */}
      <DesignTemplatesSection />

      {/* AI Tools Section */}
      <AIToolsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
