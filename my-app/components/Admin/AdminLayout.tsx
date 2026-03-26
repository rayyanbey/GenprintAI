'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Palette,
  ShoppingCart,
  LayoutTemplate,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  RefreshCw,
  Menu,
} from 'lucide-react';

const navItems = [
  { href: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/designs', label: 'Designs', icon: Palette },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const syncItem = { href: '/admin/sync', label: 'Product Sync', icon: RefreshCw };

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          border-r border-slate-700/50 shadow-2xl
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ef4444] to-[#f08080] flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">Genprint AI</p>
              <p className="text-slate-400 text-xs">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className={`px-3 mb-2 ${collapsed ? 'text-center' : ''}`}>
            {!collapsed && <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-2">Menu</p>}
          </div>
          <ul className="space-y-1 px-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-gradient-to-r from-[#ef4444]/20 to-[#f08080]/10 text-[#f87171] border border-[#ef4444]/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#ef4444]' : ''}`} />
                    {!collapsed && <span className="text-sm font-medium">{label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="mx-4 my-3 border-t border-slate-700/50" />

          {/* Sync */}
          <ul className="px-2">
            {(() => {
              const { href, label, icon: Icon } = syncItem;
              const isActive = pathname === href;
              return (
                <li>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{label}</span>}
                  </Link>
                </li>
              );
            })()}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-6 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4444]/20 focus:border-[#ef4444]/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full" />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ef4444] to-[#f08080] flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">Admin</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>

            <Link href="/home" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Exit Admin">
              <LogOut className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
