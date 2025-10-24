'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';

export default function ProductCatalogHeader() {
  return (
    <header className="w-full px-6 py-4 bg-white border-b border-gray-200">
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
          <Link href="/home" className="text-gray-700 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-[#ef4444] font-medium transition-colors">
            Products
          </Link>
          <Link href="/design" className="text-gray-700 hover:text-gray-900 transition-colors">
            Design
          </Link>
        </div>

        {/* Search and Cart */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ffdab9]/30 rounded-lg">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 w-48"
            />
          </div>

          {/* Cart Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </nav>
    </header>
  );
}
