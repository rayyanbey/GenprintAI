'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SafeAvatar } from '@/components/ui/safe-image';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Settings,
  Package,
  Palette,
  LogOut,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserInitials, getDisplayName } from '@/lib/session-utils';

interface ProfileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSidebar({ open, onOpenChange }: ProfileSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleNavigation = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const userInitials = getUserInitials(session?.user?.name, session?.user?.email);
  const displayName = getDisplayName(session?.user?.name, session?.user?.email);
  const userEmail = session?.user?.email || '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">My Profile</SheetTitle>
          <SheetDescription className="text-left">
            Manage your account settings and preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info Section */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#f08080]/10 to-[#f4978e]/10 rounded-lg">
            <SafeAvatar
              src={session?.user?.image}
              alt={displayName}
              fallback={userInitials}
              size="lg"
              className="border-2 border-[#f08080]"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{userEmail}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <User className="w-5 h-5" />
              <div>
                <div className="font-medium">Profile Settings</div>
                <div className="text-xs text-gray-500">Update your personal information</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/orders')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Package className="w-5 h-5" />
              <div>
                <div className="font-medium">Order History</div>
                <div className="text-xs text-gray-500">View your past orders</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/designs')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Palette className="w-5 h-5" />
              <div>
                <div className="font-medium">Saved Designs</div>
                <div className="text-xs text-gray-500">Access all your designs</div>
              </div>
            </button>
          </nav>

          <Separator />

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </Button>

          {/* Account Info */}
          <div className="pt-4 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Member since {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3" />
              <span>Account Type: {session?.user ? 'Premium' : 'Free'}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
