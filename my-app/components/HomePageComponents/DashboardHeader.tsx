'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { SafeAvatar } from '@/components/ui/safe-image';
import { ProfileSidebar } from '@/components/Profile';
import { getUserInitials } from '@/lib/session-utils';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInitials = getUserInitials(session?.user?.name, session?.user?.email);

  return (
    <>
      <header className="w-full px-6 py-4 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f08080] to-[#f4978e] rounded-sm flex items-center justify-center">
              <span className="text-white text-sm font-bold">▲</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Genprint AI</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home" className="text-gray-900 font-medium transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link href="/design" className="text-gray-700 hover:text-gray-900 transition-colors">
              Design
            </Link>
          </div>

          {/* Search, Notifications, and Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 w-48"
              />
            </div>

            {/* Notification Bell */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" aria-label="Notifications">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>

            {/* User Avatar - Clickable */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-[#f08080] rounded-full"
              aria-label="Open profile menu"
            >
              <SafeAvatar
                src={session?.user?.image}
                alt={session?.user?.name || 'User'}
                fallback={userInitials}
                size="md"
                className="cursor-pointer hover:ring-2 hover:ring-[#f08080] transition-all"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Profile Sidebar */}
      <ProfileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
