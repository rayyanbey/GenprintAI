# E-Commerce Developer Guide - GenprintAI

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Shopping Cart Implementation](#shopping-cart-implementation)
5. [Payment Gateway Integration](#payment-gateway-integration)
6. [Order Tracking System](#order-tracking-system)
7. [Order Confirmation & Notifications](#order-confirmation--notifications)
8. [Transaction History](#transaction-history)
9. [Printful API Integration](#printful-api-integration)
10. [Database Schema](#database-schema)
11. [API Endpoints](#api-endpoints)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Overview

This guide provides comprehensive instructions for implementing e-commerce functionality in the GenprintAI platform, including:
- Shopping cart management
- Secure payment processing
- Order tracking and management
- Email notifications
- Transaction history
- Printful API integration for print-on-demand products

**Tech Stack:**
- **Frontend:** Next.js 15.5.5 with React 19
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** NextAuth.js v5
- **Payment:** Stripe (recommended) or PayPal
- **Email:** Nodemailer with AWS SES
- **Print-on-Demand:** Printful API

---

## Prerequisites

### Required Environment Variables

Create a `.env` file in the `my-app` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/genprintai

# Authentication
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Printful API
POD=your-printful-api-key

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (AWS SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Install Dependencies

```bash
cd my-app
npm install stripe @stripe/stripe-js
npm install @aws-sdk/client-sesv2  # Already installed
```

---

## Architecture

### System Architecture

```mermaid
graph TB
    User[User Browser] --> NextJS[Next.js Frontend]
    NextJS --> API[API Routes]
    API --> Auth[NextAuth.js]
    API --> DB[(PostgreSQL)]
    API --> Printful[Printful API]
    API --> Stripe[Stripe API]
    API --> Email[AWS SES]
    
    subgraph "E-Commerce Flow"
        Cart[Shopping Cart] --> Checkout[Checkout]
        Checkout --> Payment[Payment Processing]
        Payment --> Order[Order Creation]
        Order --> Notification[Email Notification]
        Order --> Tracking[Order Tracking]
    end
```

### Data Flow

1. **Product Browsing:** User browses products from Printful API
2. **Cart Management:** Items added to shopping cart (stored in state/localStorage)
3. **Checkout:** User proceeds to checkout with shipping details
4. **Payment:** Stripe processes payment securely
5. **Order Creation:** Order stored in database with transaction details
6. **Notification:** Email sent to user with order confirmation
7. **Tracking:** User can track order status in their dashboard

---

## Shopping Cart Implementation

### 1. Create Cart Context

Create `my-app/contexts/CartContext.tsx`:

```typescript
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
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
```

### 2. Add Cart Provider to Layout

Update `my-app/app/layout.tsx`:

```typescript
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

### 3. Create Cart Component

Create `my-app/components/Cart/ShoppingCart.tsx`:

```typescript
'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export default function ShoppingCartComponent() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
        <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart ({totalItems} items)</h1>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 border rounded-lg p-4">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              {item.variant && (
                <p className="text-sm text-gray-600">
                  {item.variant.size} - {item.variant.color}
                </p>
              )}
              <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        
        <Link
          href="/checkout"
          className="mt-4 w-full block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
```

---

## Payment Gateway Integration

### 1. Install Stripe

```bash
npm install stripe @stripe/stripe-js
```

### 2. Create Stripe Utility

Create `my-app/lib/stripe.ts`:

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

### 3. Create Payment Intent API

Create `my-app/app/api/payment/create-intent/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'usd', metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        user_id: session.user.id,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 4. Create Webhook Handler

Create `my-app/app/api/payment/webhook/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getModels } from '@/lib/db-dynamic';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: any) {
  const models = await getModels();
  const { Order } = models;

  // Update order status
  const orderId = paymentIntent.metadata.order_id;
  if (orderId) {
    await Order.update(
      {
        status: 'paid',
        payment_intent_id: paymentIntent.id,
      },
      {
        where: { id: orderId },
      }
    );

    // TODO: Send confirmation email
    // TODO: Create Printful order
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  const models = await getModels();
  const { Order } = models;

  const orderId = paymentIntent.metadata.order_id;
  if (orderId) {
    await Order.update(
      {
        status: 'payment_failed',
      },
      {
        where: { id: orderId },
      }
    );
  }
}
```

### 5. Create Checkout Component

Create `my-app/components/Checkout/CheckoutForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { totalPrice, items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order first
      const orderResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total_amount: totalPrice,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error);
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation?order_id=${orderData.order.id}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        clearCart();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutFormContent />
    </Elements>
  );
}
```

---

## Order Tracking System

### 1. Update Order Model

The order model already exists at `my-app/src/models/order.model.ts`. Add tracking fields:

```typescript
// Add to the Order model definition
tracking_number: {
  type: DataTypes.STRING,
  allowNull: true,
},
carrier: {
  type: DataTypes.STRING,
  allowNull: true,
},
estimated_delivery: {
  type: DataTypes.DATE,
  allowNull: true,
},
printful_order_id: {
  type: DataTypes.STRING,
  allowNull: true,
},
payment_intent_id: {
  type: DataTypes.STRING,
  allowNull: true,
},
```

### 2. Create Order Status Update API

Create `my-app/app/api/orders/[orderId]/status/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, tracking_number, carrier, estimated_delivery } = await request.json();
    const models = await getModels();
    const { Order } = models;

    const order = await Order.findOne({
      where: {
        id: params.orderId,
        user_id: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await order.update({
      status,
      tracking_number,
      carrier,
      estimated_delivery,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Create Order Tracking Component

Create `my-app/components/Orders/OrderTracking.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  order_date: string;
  total_amount: number;
  product_name: string;
}

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const statusSteps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Tracking</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">
              {new Date(order.order_date).toLocaleDateString()}
            </p>
          </div>
          {order.tracking_number && (
            <>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-semibold">{order.tracking_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carrier</p>
                <p className="font-semibold">{order.carrier}</p>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-1 bg-gray-200">
            <div
              className="bg-blue-600 transition-all duration-500"
              style={{
                height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-8 ml-8">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isCurrent ? 'text-blue-600' : ''}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-gray-600">Current Status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Order Confirmation & Notifications

### 1. Create Email Service

Create `my-app/lib/email.ts`:

```typescript
import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-sesv2';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    orderDate: string;
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Thank you for your order!</p>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(orderDetails.orderDate).toLocaleDateString()}</p>
          
          <h2>Order Details:</h2>
          ${orderDetails.items.map(item => `
            <div class="order-item">
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          `).join('')}
          
          <div class="total">
            <p>Total: $${orderDetails.totalAmount.toFixed(2)}</p>
          </div>
          
          <p style="margin-top: 20px;">
            You can track your order status in your account dashboard.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 GenprintAI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const command = new SendEmailCommand({
    FromEmailAddress: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: `Order Confirmation - ${orderDetails.orderId}`,
        },
        Body: {
          Html: {
            Data: htmlContent,
          },
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendShippingNotificationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
  }
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .tracking-box { background: white; border: 2px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Great news! Your order is on its way.</p>
          
          <div class="tracking-box">
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${orderDetails.carrier}</p>
            ${orderDetails.estimatedDelivery ? `
              <p><strong>Estimated Delivery:</strong> ${new Date(orderDetails.estimatedDelivery).toLocaleDateString()}</p>
            ` : ''}
          </div>
          
          <p>You can track your package using the tracking number above.</p>
        </div>
        <div class="footer">
          <p>© 2024 GenprintAI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const command = new SendEmailCommand({
    FromEmailAddress: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: `Your Order Has Shipped - ${orderDetails.orderId}`,
        },
        Body: {
          Html: {
            Data: htmlContent,
          },
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log('Shipping notification email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
```

### 2. Update Checkout API to Send Confirmation

Update `my-app/app/api/checkout/route.ts`:

```typescript
import { sendOrderConfirmationEmail } from '@/lib/email';

// After creating the order, add:
if (session.user.email) {
  await sendOrderConfirmationEmail(session.user.email, {
    orderId: order.id,
    orderDate: order.order_date,
    totalAmount: order.total_amount,
    items: [{
      name: order.product_name,
      quantity: order.quantity,
      price: order.product_price,
    }],
  });
}
```

---

## Transaction History

### 1. Create Transaction History Page

Create `my-app/app/(pages)/orders/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Package, Eye } from 'lucide-react';

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  quantity: number;
  product: {
    name: string;
    image: string;
  };
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session, page]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex gap-4">
                  <img
                    src={order.product.image}
                    alt={order.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{order.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total_amount}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## Printful API Integration

### 1. Printful API Utility (Already Exists)

The Printful API utility already exists at `my-app/src/utils/printful.ts`. Here's how to use it:

```typescript
import { printful } from '@/src/utils/printful';

// Get all products
const products = await printful('/products');

// Get specific product
const product = await printful('/products/123');

// Create order
const order = await printful('/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});
```

### 2. Fetch Products from Printful

The API route already exists at `my-app/app/api/printify/products/route.ts`. Update it:

```typescript
import { printful } from '@/src/utils/printful';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await printful('/products');
    const products = response.result || response.data;
    
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('Error fetching products from Printful:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Create Printful Order After Payment

Create `my-app/app/api/printful/create-order/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await request.json();
    const models = await getModels();
    const { Order } = models;

    // Get order details
    const order = await Order.findByPk(order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create Printful order
    const printfulOrderData = {
      recipient: {
        name: session.user.name || 'Customer',
        email: session.user.email,
        address1: order.shipping_address?.address1 || '',
        city: order.shipping_address?.city || '',
        state_code: order.shipping_address?.state || '',
        country_code: order.shipping_address?.country || 'US',
        zip: order.shipping_address?.zip || '',
      },
      items: [
        {
          variant_id: order.product_id,
          quantity: order.quantity,
        },
      ],
    };

    const printfulResponse = await printful('/orders', {
      method: 'POST',
      body: JSON.stringify(printfulOrderData),
    });

    // Update order with Printful order ID
    await order.update({
      printful_order_id: printfulResponse.result.id,
      status: 'processing',
    });

    return NextResponse.json({
      success: true,
      printful_order: printfulResponse.result,
    });
  } catch (error: any) {
    console.error('Printful order creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 4. Sync Printful Order Status

Create `my-app/app/api/printful/sync-status/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { printful } from '@/src/utils/printful';
import { getModels } from '@/lib/db-dynamic';

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();
    const models = await getModels();
    const { Order } = models;

    const order = await Order.findByPk(order_id);
    if (!order || !order.printful_order_id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get Printful order status
    const printfulOrder = await printful(`/orders/${order.printful_order_id}`);
    const printfulData = printfulOrder.result;

    // Update order status
    const updates: any = {
      status: printfulData.status,
    };

    if (printfulData.shipments && printfulData.shipments.length > 0) {
      const shipment = printfulData.shipments[0];
      updates.tracking_number = shipment.tracking_number;
      updates.carrier = shipment.carrier;
      updates.status = 'shipped';
    }

    await order.update(updates);

    return NextResponse.json({
      success: true,
      order: updates,
    });
  } catch (error: any) {
    console.error('Printful sync error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Database Schema

### Current Schema

```sql
-- Users table (managed by NextAuth)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  price DECIMAL(10, 2) DEFAULT 0.00,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255),
  design_id VARCHAR(255),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'confirmed',
  total_amount DECIMAL(10, 2),
  product_name VARCHAR(255),
  product_price DECIMAL(10, 2),
  product_image TEXT,
  shipping_address TEXT,
  quantity INTEGER DEFAULT 1,
  tracking_number VARCHAR(255),
  carrier VARCHAR(255),
  estimated_delivery TIMESTAMP,
  printful_order_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_status ON orders(status);
```

### Migration Script

Run the migration to add new fields:

```sql
-- Add payment and tracking fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS carrier VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP,
ADD COLUMN IF NOT EXISTS printful_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Products
- `GET /api/printify/products` - Get all Printful products
- `GET /api/printify/products/:id` - Get specific product

### Cart (Client-side only via Context)
- Managed through `CartContext`

### Checkout & Payment
- `POST /api/checkout` - Create order
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook handler

### Orders
- `GET /api/orders` - Get user's orders (paginated)
- `GET /api/orders/:id` - Get specific order
- `PATCH /api/orders/:id/status` - Update order status

### Printful Integration
- `POST /api/printful/create-order` - Create Printful order
- `POST /api/printful/sync-status` - Sync order status from Printful

---

## Testing

### 1. Test Payment Flow

```bash
# Use Stripe test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
```

### 2. Test Printful API

```typescript
// Test in API route or script
import { printful } from '@/src/utils/printful';

async function testPrintful() {
  try {
    // Get products
    const products = await printful('/products');
    console.log('Products:', products);

    // Get store info
    const store = await printful('/store');
    console.log('Store:', store);
  } catch (error) {
    console.error('Test failed:', error);
  }
}
```

### 3. Test Email Notifications

```typescript
import { sendOrderConfirmationEmail } from '@/lib/email';

await sendOrderConfirmationEmail('test@example.com', {
  orderId: 'TEST123',
  orderDate: new Date().toISOString(),
  totalAmount: 29.99,
  items: [
    { name: 'Test Product', quantity: 1, price: 29.99 }
  ],
});
```

---

## Deployment

### 1. Environment Variables

Ensure all environment variables are set in production:
- Database credentials
- Stripe keys (production)
- Printful API key
- AWS SES credentials
- NextAuth secret

### 2. Database Migration

```bash
# Run migrations in production
psql $DATABASE_URL < database_migration_order_history.sql
```

### 3. Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

### 4. Printful Webhook (Optional)

Set up webhook in Printful dashboard to receive order updates:
- Endpoint: `https://yourdomain.com/api/printful/webhook`
- Events: Order status updates

### 5. Build and Deploy

```bash
cd my-app
npm run build
npm start
```

---

## Best Practices

1. **Security**
   - Never expose API keys in client-side code
   - Validate all user inputs
   - Use HTTPS in production
   - Implement rate limiting

2. **Error Handling**
   - Log all errors
   - Provide user-friendly error messages
   - Implement retry logic for API calls

3. **Performance**
   - Cache Printful product data
   - Use database indexes
   - Implement pagination for large datasets

4. **User Experience**
   - Show loading states
   - Provide clear feedback
   - Handle edge cases gracefully

---

## Troubleshooting

### Common Issues

1. **Printful API 401 Error**
   - Check `POD` environment variable
   - Verify API key is valid

2. **Stripe Payment Fails**
   - Check webhook secret
   - Verify test/production mode
   - Check card details

3. **Email Not Sending**
   - Verify AWS SES credentials
   - Check email is verified in SES
   - Review SES sending limits

4. **Database Connection Error**
   - Check `DATABASE_URL`
   - Verify PostgreSQL is running
   - Check network connectivity

---

## Additional Resources

- [Printful API Documentation](https://developers.printful.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

---

## Support

For questions or issues, please refer to:
- Project README: `my-app/README.md`
- Docker Setup: `my-app/DOCKER_SETUP.md`
- Database Migrations: `my-app/database_migration_order_history.sql`
