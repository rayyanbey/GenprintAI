'use client';
import Image from 'next/image';
import React from 'react';

export default function EmptyState() {
  return (
    <div className="w-full px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Empty State Illustration */}
          <div className="w-full max-w-md mb-8">
            <Image 
              src="/HomeIllustration.png" 
              alt="No Projects" 
              width={400}
              height={400}
              className="w-full h-auto rounded-2xl"
              priority
            />
          </div>

          {/* Empty State Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            No Solo Projects Yet
          </h2>
          <p className="text-base text-gray-600 mb-8 max-w-md">
            Start a new project to see it here. Let your creativity shine!
          </p>

          {/* CTA Button */}
          <button className="px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium shadow-lg">
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
}
