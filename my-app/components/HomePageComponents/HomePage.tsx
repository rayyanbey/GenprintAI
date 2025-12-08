'use client';

import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardHero from './DashboardHero';
import DashboardTabs from './DashboardTabs';
import EmptyState from './EmptyState';
import CommunityPosts from './CommunityPosts';

type TabType = 'solo' | 'collaborations' | 'community';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('solo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Hero Section */}
      <DashboardHero />

      {/* Tabs */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content based on active tab */}
      <div className="w-full">
        {activeTab === 'solo' && <EmptyState />}
        {activeTab === 'collaborations' && (
          <div className="w-full px-6 py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-600">No collaborations yet.</p>
            </div>
          </div>
        )}
        {activeTab === 'community' && (
          <div className="w-full px-6 py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center">
              <CommunityPosts/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
