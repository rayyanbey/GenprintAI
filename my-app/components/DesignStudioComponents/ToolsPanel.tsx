'use client';

import React from 'react';
import { Home, FolderOpen, FileText, Users, Settings } from 'lucide-react';
import Link from 'next/link';

interface ToolsPanelProps {
  activeMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function ToolsPanel({ activeMenu, onMenuSelect }: ToolsPanelProps) {
  const menuItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'projects', name: 'Projects', icon: FolderOpen },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'community', name: 'Community', icon: Users, href: '/community' },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col py-6">
      <div className="flex flex-col gap-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === item.id
                    ? 'bg-[#ffdab9] text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onMenuSelect(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeMenu === item.id
                  ? 'bg-[#ffdab9] text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
