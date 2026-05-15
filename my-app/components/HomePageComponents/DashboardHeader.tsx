'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { SafeAvatar } from '@/components/ui/safe-image';
import { ProfileSidebar } from '@/components/Profile';
import { getUserInitials } from '@/lib/session-utils';
import { useCart } from '@/contexts/CartContext';
import { useAdminFeedbackNotifications } from '@/hooks/useAdminFeedbackNotifications';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const { totalItems } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { count: adminFeedbackCount } = useAdminFeedbackNotifications();

  const userInitials = getUserInitials(session?.user?.name, session?.user?.email);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();

    if (!query) {
      router.push('/my-designs');
      return;
    }

    router.push(`/my-designs?search=${encodeURIComponent(query)}`);
  };

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
            <Link href="/templates" className="text-gray-700 hover:text-gray-900 transition-colors">
              Templates
            </Link>
            <Link href="/design" className="text-gray-700 hover:text-gray-900 transition-colors">
              Design
            </Link>
            <Link href="/mockup-request" className="text-gray-700 hover:text-gray-900 transition-colors">
              Mockups
            </Link>
          </div>

          {/* Search, Notifications, and Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search designs..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 w-48"
                aria-label="Search designs"
              />
            </form>

            {/* Notification Bell - Only show when logged in */}
            {session?.user && (
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" aria-label={`Notifications${adminFeedbackCount > 0 ? ` (${adminFeedbackCount} new admin feedback items)` : ''}`}>
                <Bell className="w-5 h-5 text-gray-700" />
                {adminFeedbackCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-sm">
                    {adminFeedbackCount > 9 ? '9+' : adminFeedbackCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Icon - Only show when logged in */}
            {session?.user && (
              <Link href="/cart">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative group" aria-label="Shopping cart">
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Cart ({totalItems})
                  </span>
                </button>
              </Link>
            )}

            {/* User Avatar or Login Button */}
            {session?.user ? (
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
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-br from-[#f08080] to-[#f4978e] hover:from-[#e07070] hover:to-[#e38878] text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Log In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Profile Sidebar */}
      {session?.user && <ProfileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />}
    </>
  );
}
