'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SplashCursor } from '@/components/ui/splash-cursor';

export default function HeroSection() {
  return (
    <section className="w-full px-6 py-12 md:py-20 relative">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl relative overflow-hidden">
          {/* Splash Cursor Effect */}
          <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
            <SplashCursor />
          </div>

          {/* Background Image */}
          {/* <Image
            src="/hero-bg.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          /> */}
          
          {/* Gradient Overlay - transparent to blackish */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
 
          {/* Content */}
          <div className="relative z-10 p-12 md:p-16 lg:p-20 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Personalized Merchandise, Powered by AI
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Genprint AI revolutionizes custom merchandise with AI-driven designs and real-time 3D previews, ensuring your vision comes to life perfectly.
            </p>
            <Link href="/home" className="px-8 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium text-lg shadow-lg w-fit inline-block">
              Start Designing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
