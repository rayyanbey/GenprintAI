'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  '/home': [{ label: 'Home', href: '/home' }],
  '/products': [
    { label: 'Home', href: '/home' },
    { label: 'Products', href: '/products' },
  ],
  '/templates': [
    { label: 'Home', href: '/home' },
    { label: 'Templates', href: '/templates' },
  ],
  '/design': [
    { label: 'Home', href: '/home' },
    { label: 'Design Studio', href: '/design' },
  ],
  '/orders': [
    { label: 'Home', href: '/home' },
    { label: 'My Orders', href: '/orders' },
  ],
  '/profile': [
    { label: 'Home', href: '/home' },
    { label: 'Profile', href: '/profile' },
  ],
  '/my-designs': [
    { label: 'Home', href: '/home' },
    { label: 'My Designs', href: '/my-designs' },
  ],
  '/mockup-request': [
    { label: 'Home', href: '/home' },
    { label: 'Request Mockup', href: '/mockup-request' },
  ],
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = BREADCRUMB_MAP[pathname] || [];

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="px-6 py-3 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
        <Link
          href="/home"
          className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          <Home size={16} />
        </Link>

        {breadcrumbs.map((item, idx) => (
          <React.Fragment key={item.href}>
            <ChevronRight size={16} className="text-gray-400" />
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
