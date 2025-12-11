'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
