'use client';

import React, { useState } from 'react';

type TabType = 'solo' | 'collaborations' | 'community';

interface DashboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="w-full px-6 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <button
            onClick={() => onTabChange('solo')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'solo'
                ? 'border-[#ef4444] text-[#ef4444]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Solo Projects
          </button>
          <button
            onClick={() => onTabChange('collaborations')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborations'
                ? 'border-[#ef4444] text-[#ef4444]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Collaborations
          </button>
          <button
            onClick={() => onTabChange('community')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-[#ef4444] text-[#ef4444]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Community Designs
          </button>
        </div>
      </div>
    </div>
  );
}
