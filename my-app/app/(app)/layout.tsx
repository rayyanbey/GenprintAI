import React from 'react';
import { DashboardHeader } from '@/components/HomePageComponents';
import { Breadcrumbs, Footer } from '@/components/Navigation';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />
      
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
