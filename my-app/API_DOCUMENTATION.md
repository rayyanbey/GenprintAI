# E-Commerce API Routes Documentation

## Overview
This document describes all backend API routes for the e-commerce functionality.

---

## Authentication
All routes marked with 🔒 require authentication via NextAuth session.

---

## Cart Management (Client-Side)
Cart is managed client-side using React Context and localStorage.
Optional server-side cart persistence can be implemented using the CartItem model.

---

## Payment Routes

### Create Payment Intent
**POST** `/api/payment/create-intent` 🔒

Creates a Stripe payment intent for checkout.

**Request Body:**
```json
{
  "amount": 29.99,
  "currency": "usd",
  "metadata": {
    "items_count": 2
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Stripe Webhook
**POST** `/api/payment/webhook`

Handles Stripe webhook events (payment success/failure).

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Order Routes

### Create Orders (Checkout)
**POST** `/api/checkout` 🔒

Creates orders from cart items.

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "123",
      "name": "T-Shirt",
      "price": 19.99,
      "quantity": 2,
      "image_url": "https://...",
      "design_id": "abc"
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "total_amount": 39.98
}
```

**Response:**
```json
{
  "success": true,
  "message": "Orders created successfully",
  "orders": [
    {
      "id": "order_xxx",
      "product_name": "T-Shirt",
      "quantity": 2,
      "total_amount": 39.98
    }
  ],
  "total_amount": 39.98
}
```

### Get User Orders
**GET** `/api/orders?page=1&limit=10` 🔒

Retrieves paginated list of user's orders.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_xxx",
      "order_date": "2024-01-15T10:30:00Z",
      "status": "shipped",
      "total_amount": 39.98,
      "quantity": 2,
      "shipping_address": {...},
      "product": {
        "name": "T-Shirt",
        "image": "https://..."
      },
      "design": null
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  }
}
```

### Get Single Order
**GET** `/api/orders/[id]` 🔒

Retrieves detailed information about a specific order.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_xxx",
    "order_date": "2024-01-15T10:30:00Z",
    "status": "shipped",
    "total_amount": 39.98,
    "quantity": 2,
    "shipping_address": {...},
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "estimated_delivery": "2024-01-20T00:00:00Z",
    "printful_order_id": "12345",
    "payment_intent_id": "pi_xxx",
    "product_name": "T-Shirt",
    "product_price": 19.99,
    "product_image": "https://...",
    "product": {...},
    "design": null
  }
}
```

---

## Printful Integration Routes

### Get All Products
**GET** `/api/printful/products`

Fetches all products from Printful catalog.

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 123,
      "name": "Unisex T-Shirt",
      "description": "...",
      "variants": [...]
    }
  ],
  "count": 50
}
```

### Get Single Product
**GET** `/api/printful/products/[id]`

Fetches specific product details from Printful.

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 123,
    "name": "Unisex T-Shirt",
    "description": "...",
    "variants": [...]
  }
}
```

### Get Product Variants
**GET** `/api/printful/products/[id]/variants`

Fetches available variants (sizes, colors) for a product.

**Response:**
```json
{
  "success": true,
  "product_id": "123",
  "variants": [
    {
      "id": 4011,
      "name": "Bella + Canvas 3001 (White / S)",
      "size": "S",
      "color": "White",
      "price": "11.50"
    }
  ],
  "count": 24
}
```

### Create Printful Order
**POST** `/api/printful/create-order` 🔒

Creates an order in Printful after payment confirmation.

**Request Body:**
```json
{
  "order_id": "order_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "printful_order": {
    "id": 12345,
    "status": "draft",
    "recipient": {...},
    "items": [...]
  },
  "order_id": "order_xxx"
}
```

### Sync Order Status
**POST** `/api/printful/sync-status` 🔒

Syncs order status and tracking from Printful.

**Request Body:**
```json
{
  "order_id": "order_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_xxx",
    "status": "shipped",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "estimated_delivery": "2024-01-20T00:00:00Z"
  },
  "printful_data": {...}
}
```

### Printful Webhook
**POST** `/api/printful/webhook`

Receives webhook events from Printful.

**Events Handled:**
- `package_shipped` - Updates order status and tracking
- `package_returned` - Marks order as returned
- `order_failed` - Marks order as failed
- `order_canceled` - Marks order as cancelled
- `product_synced` - Updates product information

---

## Order Status Values

- `pending_payment` - Order created, awaiting payment
- `paid` - Payment successful
- `confirmed` - Order confirmed
- `processing` - Being prepared/printed
- `shipped` - Package shipped
- `delivered` - Package delivered
- `cancelled` - Order cancelled
- `payment_failed` - Payment failed
- `failed` - Order failed
- `returned` - Package returned

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Printful
POD=your-printful-api-key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
EMAIL_FROM=noreply@yourdomain.com
```

---

## Testing

### Test Stripe Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Test Printful API
Use Printful sandbox environment for testing without creating real orders.

---

## Rate Limiting

- Printful API: ~120 requests/minute
- Stripe API: No strict limit, but use reasonable rates

---

## Webhook Setup

### Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

### Printful Webhook
1. Go to Printful Dashboard → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/printful/webhook`
3. Select all order-related events

---

## Security Notes

1. **Never expose API keys** in client-side code
2. **Always validate** user authentication for protected routes
3. **Verify webhook signatures** for Stripe webhooks
4. **Sanitize user inputs** before database operations
5. **Use HTTPS** in production
6. **Implement rate limiting** for public endpoints
