'use client';

import React, { useState } from 'react';
import { RotateCcw, Maximize, ChevronDown } from 'lucide-react';

export default function DesignCanvas() {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between p-8 overflow-y-auto">
        <div className="flex flex-col items-center w-full">
          {/* Title and Description */}
          <div className="text-center mb-8 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              AI Design Studio
            </h1>
            <p className="text-sm text-gray-600">
              Generate unique designs with the power of AI
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Regenerate</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Maximize className="w-4 h-4" />
              <span className="text-sm font-medium">Upscale</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronDown className="w-4 h-4" />
              <span className="text-sm font-medium">Apply Template</span>
            </button>
          </div>

          {/* Canvas/Preview Area */}
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl aspect-[4/3] flex items-center justify-center mb-8">
            <div className="text-center text-gray-400">
              <p className="text-base">Your generated image will appear here</p>
            </div>
          </div>

          {/* Bottom Action Icons */}
          <div className="flex items-center gap-6 mb-12">
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors" title="Undo">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors" title="Zoom">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors" title="Redo">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Prompt Input - Fixed at Bottom */}
        <div className="w-full max-w-3xl pb-4">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design... e.g., 'A cat astronaut on a vibrant background'"
              className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f4978e] focus:border-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
            <button className="px-8 py-3 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] transition-colors font-medium text-sm whitespace-nowrap shadow-sm">
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
