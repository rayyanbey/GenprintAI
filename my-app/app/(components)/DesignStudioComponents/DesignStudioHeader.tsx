'use client';

import React from 'react';

export default function DesignStudioHeader() {
  return (
    <header className="w-full px-8 py-6 bg-white">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#f08080] to-[#f4978e] rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">▲</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Genprint AI</span>
        </div>
      </div>
    </header>
  );
}
