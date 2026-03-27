'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ShoppingCartComponent() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-[#f4978e]" />
        <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
        <p className="mt-2 text-gray-600">Add some products to get started!</p>
        <Link 
          href="/products" 
          className="mt-4 inline-block px-6 py-2 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#b4534f]">Shopping Cart ({totalItems} items)</h1>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 border border-[#fbc4ab]/70 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={item.image_url || '/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover rounded"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{item.name}</h3>
              {item.variant && (
                <p className="text-sm text-gray-600">
                  {item.variant.size && `Size: ${item.variant.size}`}
                  {item.variant.size && item.variant.color && ' • '}
                  {item.variant.color && `Color: ${item.variant.color}`}
                </p>
              )}
              <p className="text-lg font-bold mt-2 text-[#f4978e]">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 rounded hover:bg-[#fff1ee] transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded hover:bg-[#fff1ee] transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-[#f08080] hover:bg-[#fff1ee] rounded transition"
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <p className="font-bold text-lg">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-[#fbc4ab]/60 pt-6 bg-[#fff8f6] rounded-lg p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({totalItems} items):</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between text-2xl font-bold pt-2 border-t">
            <span>Total:</span>
            <span className="text-[#f4978e]">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <Link
          href="/checkout"
          className="mt-6 w-full block text-center bg-[#f4978e] text-white py-3 rounded-lg hover:bg-[#f08080] transition font-semibold text-lg"
        >
          Proceed to Checkout
        </Link>
        
        <Link
          href="/products"
          className="mt-3 w-full block text-center border border-[#f8ad9d] text-[#b4534f] py-3 rounded-lg hover:bg-[#fff1ee] transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
