'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full px-6 py-4 bg-white">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#f08080] to-[#f4978e] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">▲</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Genprint AI</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link href="about" className="text-gray-700 hover:text-gray-900 transition-colors">
            About Us
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="">
            <button className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors">
              Login
            </button>
          </Link>
          <Link href="/home" className="px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium inline-block">
            Start Designing
          </Link>
        </div>
      </nav>
    </header>
  );
}
