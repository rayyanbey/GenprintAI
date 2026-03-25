'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CartItemResponse {
  id: string;
  product_id: string;
  product?: {
    name: string;
    image_url: string;
  };
  design_id: string;
  design?: {
    title: string;
    artwork_file_url: string;
  };
  price: number;
  quantity: number;
  item_total: number;
  variant?: {
    size: string;
    color: string;
  };
}

interface CartSummary {
  total_items: number;
  total_price: number;
  item_count: number;
}

export function ShoppingCartDisplay() {
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    total_items: 0,
    total_price: 0,
    item_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
          setSummary(data.summary || { total_items: 0, total_price: 0, item_count: 0 });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_id: itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        // Reload cart
        const res = await fetch('/api/cart');
        const data = await res.json();
        setItems(data.items || []);
        setSummary(data.summary || {});
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: itemId }),
      });

      if (response.ok) {
        // Reload cart
        const res = await fetch('/api/cart');
        const data = await res.json();
        setItems(data.items || []);
        setSummary(data.summary || {});
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 x-8 py-12">
        <div className="max-w-2xl mx-auto text-center py-20">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Start designing and adding products to your cart!</p>
          <Link
            href="/design-to-cart"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition"
          >
            Start Designing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                updating={updating === item.id}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({summary.total_items} items)</span>
                  <span>${summary.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">To be calculated</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="text-gray-600">To be calculated</span>
                </div>
              </div>

              <div className="border-t-2 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600">${summary.total_price.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 mb-3">
                <ShoppingBag className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="w-full border-2 border-blue-500 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition text-center block"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  💡 <span className="font-semibold">Free shipping</span> on orders over $100!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItemResponse;
  onQuantityChange: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  updating: boolean;
}

function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  updating,
}: CartItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="flex gap-4 p-6">
        {/* Product Image */}
        <div className="flex-shrink-0 w-24 h-24">
          {item.product?.image_url ? (
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg" />
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {item.product?.name}
              </h3>
              {item.variant && (
                <p className="text-sm text-gray-600">
                  {item.variant.size} - {item.variant.color}
                </p>
              )}
            </div>
            <p className="font-bold text-lg text-blue-600 text-right">
              ${item.price.toFixed(2)}
            </p>
          </div>

          {/* Design Info */}
          {item.design && (
            <div className="flex gap-3 mb-4 p-3 bg-blue-50 rounded">
              {item.design.artwork_file_url && (
                <img
                  src={item.design.artwork_file_url}
                  alt={item.design.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase">Custom Design</p>
                <p className="font-semibold text-gray-900">{item.design.title}</p>
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={updating || item.quantity === 1}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(item.id, Math.max(1, parseInt(e.target.value) || 1))
                }
                disabled={updating}
                className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
              />
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                disabled={updating}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="ml-2 text-sm text-gray-600">
                Subtotal: ${item.item_total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              disabled={updating}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
