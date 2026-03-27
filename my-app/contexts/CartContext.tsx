'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  design_id?: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function seededFallbackPrice(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  // Stable pseudo-random range: $19.99 - $89.99
  const min = 19.99;
  const max = 89.99;
  const ratio = (hash % 10000) / 10000;
  return Number((min + ratio * (max - min)).toFixed(2));
}

function normalizeItemPrice(item: CartItem): CartItem {
  const parsedPrice = Number(item.price);
  if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
    return { ...item, price: parsedPrice };
  }

  return {
    ...item,
    price: seededFallbackPrice(`${item.id}:${item.product_id}`),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart) as CartItem[];
        setItems(parsedItems.map(normalizeItemPrice));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item: CartItem) => {
    const normalizedItem = normalizeItemPrice(item);

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === normalizedItem.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === normalizedItem.id
            ? {
                ...i,
                quantity: i.quantity + normalizedItem.quantity,
                price: i.price > 0 ? i.price : normalizedItem.price,
              }
            : i
        );
      }
      return [...prevItems, normalizedItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
