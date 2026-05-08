# ✅ Full Product → Mockup → Checkout → Payment Flow Testing Guide

> **Status**: ✅ **READY TO TEST** - All components are in place!

## 🎯 What You Can Now Test

With Stripe keys added and configured, you can now test the **complete end-to-end flow**:

```
1. Browse Products
   ↓
2. Preview Mockup (Design on Product)
   ↓
3. Add to Cart
   ↓
4. Checkout (Enter Shipping Address)
   ↓
5. Payment (Enter Test Card)
   ↓
6. Order Confirmation
   ↓
7. View Orders & Tracking
```

---

## 🚀 Step-by-Step Testing Flow

### Step 1: Create/Select a Design
- Go to `/design-studio`
- Either create a new design or use an existing one
- Save the design
- Note the design ID from the URL or database

### Step 2: Browse Products
- Go to `/products`
- Select a product (e.g., T-Shirt, Hoodie)

### Step 3: Preview Design on Product (NEW!)
- Click **"👀 Preview"** button
- Modal opens
- Click **"Generate This Angle"** or **"Generate All Angles"**
- Wait 10-30 seconds for mockup to generate
- See design rendered on product
- Switch between angles (front, back, etc.)

### Step 4: Add to Cart
- From product page, click **"🛒 Add to Cart"**
- Or from mockup preview modal, click **"Add to Cart"**
- See cart badge update in header

### Step 5: Go to Checkout
- Navigate to cart: `/cart`
- Review items
- Click **"Proceed to Checkout"**

### Step 6: Enter Shipping Address
- Fill in shipping details:
  ```
  Name: John Doe
  Address: 123 Main St
  City: New York
  State: NY
  ZIP: 10001
  Country: United States
  ```

### Step 7: Payment (Use Test Card)
- Enter **Stripe Test Card**:
  ```
  Card Number: 4242 4242 4242 4242
  Expiry: 12/34
  CVC: 123
  ```
- Click **"Pay $X.XX"**
- Payment processes in real-time

### Step 8: Order Confirmation
- Automatically redirected to `/order-confirmation`
- See success message ✅
- Confirmation email sent
- Order status is "paid"

### Step 9: View Orders
- Go to `/orders`
- See order details
- View tracking information (once Printful processes)

---

## 🧪 Test Cards for Stripe

### Success Scenarios

| Card Number | Expires | CVC | Scenario |
|---|---|---|---|
| `4242 4242 4242 4242` | Any future date | Any 3 digits | ✅ Successful payment |
| `4000 0025 0000 3155` | Any future date | Any 3 digits | ✅ 3D Secure 2 Authentication |
| `4000 0027 6000 3184` | Any future date | Any 3 digits | ✅ No authentication required |

### Failure Scenarios

| Card Number | Scenario |
|---|---|
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0000 0000 0069` | ❌ Expired card |
| `4000 0000 0000 0127` | ❌ Incorrect CVC |
| `4000 0000 0000 0341` | ❌ Insufficient funds |

---

## 📋 Complete Architecture Overview

### Frontend Flow

```
Products Page (/products)
  ├── Product Card
  │   └── [Preview Button]
  │       └── MockupPreviewModalAsync
  │           ├── GET /api/mockups/printfiles/:id (get placements)
  │           ├── POST /api/mockups (create task)
  │           ├── GET /api/mockups/status/:taskKey (poll)
  │           └── Show mockup on product
  │
  └── [Add to Cart]
      └── Updates CartContext

Cart Page (/cart)
  ├── Display Items
  │   └── [Proceed to Checkout]
  │
Checkout Page (/checkout)
  ├── GET /api/payment/create-intent
  │   ├── Stripe Client Secret
  │   └── Initialize Elements
  │
  ├── CheckoutForm
  │   ├── Shipping Address Form
  │   ├── Payment Element (Stripe)
  │   ├── POST /api/checkout (create orders)
  │   └── stripe.confirmPayment()
  │
  └── Order Confirmation Page (/order-confirmation)
      ├── Show Success/Failure
      └── Link to Orders (/orders)
```

### Backend Flow

```
POST /api/payment/create-intent
├── Validate auth
├── Create Stripe PaymentIntent
├── Return clientSecret

POST /api/checkout
├── Validate auth
├── Validate items
├── Create Order records in DB
└── Return order IDs

Stripe Webhook (POST /api/payment/webhook)
├── Verify signature
├── On payment_intent.succeeded:
│   ├── Update Order status → "paid"
│   ├── Send confirmation email
│   └── Auto-create Printful order
│
└── On payment_intent.payment_failed:
    └── Update Order status → "payment_failed"
```

---

## ✅ Pre-Flight Checklist

Before you test, verify:

- [ ] **Environment Variables Set**
  ```bash
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```

- [ ] **Database Connected**
  ```bash
  npx sequelize-cli db:migrate
  ```

- [ ] **User Logged In**
  - Go to `/login` or `/signup`
  - Create test account

- [ ] **Design Created**
  - Go to `/design-studio`
  - Create or select a design
  - Export as PNG/JPG

- [ ] **Printful API Key Set**
  ```bash
  PRINTFUL=YTNHVzy80wXE8RNIgfluZ1tXjcZhwv0WaLLAqZXX
  ```

---

## 🧑‍💻 API Endpoints Summary

### Payment Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/payment/create-intent` | Create Stripe PaymentIntent | ✅ Required |
| POST | `/api/checkout` | Create Order records | ✅ Required |
| POST | `/api/payment/webhook` | Stripe webhook handler | 🔐 Signature |

### Mockup Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/mockups/printfiles/:id` | Get available placements | ❌ Public |
| POST | `/api/mockups` | Create mockup task | ✅ Required |
| GET | `/api/mockups/status/:taskKey` | Poll for results | ✅ Required |
| POST | `/api/mockups/:id/all` | Multi-angle tasks | ✅ Required |

### Order Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/orders` | Get user's orders | ✅ Required |
| GET | `/api/orders/:id` | Get order details | ✅ Required |

---

## 🔍 Testing Workflows

### Workflow 1: Simple Purchase (Fastest)

**Time: ~3-5 minutes**

```
1. Login
2. Go to /products
3. Click Add to Cart (skip mockup for speed)
4. Go to /cart → Checkout
5. Fill address
6. Use test card 4242 4242 4242 4242
7. See order confirmation ✅
```

### Workflow 2: Full Mockup + Purchase

**Time: ~5-8 minutes**

```
1. Login
2. Go to /design-studio → Create simple design
3. Go to /products
4. Click Preview → Generate Mockup
5. Wait for mockup (10-30s)
6. Click Add to Cart
7. Checkout with test card
8. See order confirmation ✅
```

### Workflow 3: Multi-Angle Mockup

**Time: ~8-15 minutes**

```
1. Login
2. Go to /design-studio → Create design
3. Go to /products
4. Click Preview → Generate All Angles
5. Switch between angles
6. Add to Cart
7. Checkout
8. Confirm order ✅
```

---

## 🐛 Troubleshooting

### Issue: Mockup generation stuck on "pending"

**Solution**:
- Check browser console for errors
- Verify Printful API key in `.env`
- Check network tab → /api/mockups/status
- Max retry is 45 attempts (~90 seconds)

### Issue: "Unauthorized" on checkout

**Solution**:
- Verify user is logged in
- Check session cookie
- Clear browser cache
- Try logging in again

### Issue: Payment fails with "Invalid client_secret"

**Solution**:
- Verify `STRIPE_SECRET_KEY` is correct
- Don't expose secret key in frontend
- Check `.env` file permissions
- Restart Next.js server

### Issue: Order created but payment not reflected

**Solution**:
- Webhook not received (local dev)
- Check Stripe Dashboard → Events
- For local testing, use `stripe listen` CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/payment/webhook
  ```
- Copy webhook secret to `.env`:
  ```bash
  STRIPE_WEBHOOK_SECRET=whsec_test_...
  ```

### Issue: "Design image URL not found" (in mockup)

**Solution**:
- Ensure design is exported/saved with URL
- Design artwork_file_url must be publicly accessible
- Check design.artwork_file_url in database

---

## 📊 Expected Database State After Payment

### Order Table (After Successful Payment)

```json
{
  "id": "order-uuid",
  "user_id": "user-uuid",
  "product_id": "71",
  "design_id": "design-uuid",
  "status": "paid",
  "total_amount": "29.99",
  "payment_intent_id": "pi_1TEp...",
  "shipping_address": "{ ... address ... }",
  "order_date": "2024-03-25T...",
  "quantity": 1
}
```

### Printful Order (Auto-Created on Payment)

```json
{
  "id": "printful-order-id",
  "external_id": "order-uuid",
  "status": "pending",
  "items": [
    {
      "sync_product_id": 123456,
      "sync_variant_id": 456789,
      "files": [
        {
          "type": "front",
          "url": "https://your-design.png"
        }
      ]
    }
  ],
  "recipient": {
    "name": "John Doe",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

---

## 🎯 Success Indicators

After completing a full test flow, you should see:

✅ **Order created** in DB with status `pending_payment`  
✅ **Payment intent created** in Stripe  
✅ **Payment successful** → Order status → `paid`  
✅ **Confirmation email** sent to user  
✅ **Printful order created** auto-triggered  
✅ **Order page shows** order with tracking info (eventually)  
✅ **Webhook received** order status updated  

---

## 🚀 Next Steps (After Testing)

1. **Setup Stripe Webhook** (for production)
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Get webhook secret and add to `.env`

2. **Download Mockup Images** (before 72 hours)
   - Images expire in 72 hours
   - Consider downloading/storing on your CDN

3. **Email Notifications**
   - Order confirmation already sent
   - Add order tracking email option

4. **Error Notifications**
   - Add Sentry/error tracking
   - Monitor failed payment attempts

5. **Production Stripe Keys**
   - Get live keys from Stripe
   - Update `.env` for production
   - Switch from test mode

---

## 📞 Support

**Test Flow Issues?**
- Check invoice error logs: browser DevTools → Console
- Verify all `.env` variables are set
- Check DATABASE is connected

**Stripe Issues?**
- Go to Stripe Dashboard → Developers → Logs
- Check "recent events" for your test payments
- Use Stripe's test card documentation

**Payment Not Processing?**
- Verify billing address is filled
- Use supported test card (4242...)
- Check Stripe Dashboard → Payments for activity

---

## 🎉 You're Ready!

Your system is now **fully configured** for end-to-end testing:

✅ Products browsable  
✅ Mockups generating  
✅ Cart working  
✅ Stripe payment integration complete  
✅ Orders being created  
✅ Webhooks ready  
✅ Confirmations sending  
✅ Printful orders auto-creating  

**Start testing!** 🚀
