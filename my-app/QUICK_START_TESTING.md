# 🚀 Quick Start: Testing Commands & Setup

**Run these commands in order to get everything working**

---

## 1️⃣ Install Dependencies
```bash
cd my-app
npm install
```
**Time**: 2-3 minutes

---

## 2️⃣ Run Database Migrations
```bash
# Connect to your database and run these SQL migrations
psql postgresql://avnadmin:AVNS_u-j6u2rxRfa8Q2GtB-Y@pg-38603677-rayyanasghar9-f141.g.aivencloud.com:21331/genprintai < database_migration_ecommerce.sql

psql postgresql://avnadmin:AVNS_u-j6u2rxRfa8Q2GtB-Y@pg-38603677-rayyanasghar9-f141.g.aivencloud.com:21331/genprintai < database_migration_order_history.sql
```

**Or copy your DB_URL from .env**:
```bash
psql $DB_URL < database_migration_ecommerce.sql
psql $DB_URL < database_migration_order_history.sql
```


**What it does**: 
- Adds order tracking fields (tracking_number, carrier, etc.)
- Adds payment fields (payment_intent_id, printful_order_id)
- Creates cart_items table
- Creates indexes for performance

**Time**: 30 seconds

---

## 3️⃣ Sync Printful Products (CORE DATA)
```bash
npx ts-node scripts/sync-printful-categories.ts
```

**What it does**:
- Downloads all Printful categories (apparel, accessories, etc.)
- Downloads all Printful products with variants
- Downloads pricing and images
- Populates products table

**⚠️ CRITICAL**: Without this, no products appear!

**Time**: 2-3 minutes

---

## 4️⃣ Create Upload Directories
```bash
npm run setup
```

**What it does**:
- Creates `public/uploads/avatars/`
- Creates `public/uploads/designs/`
- Creates `public/uploads/temp/`

**Time**: 5 seconds

---

## 5️⃣ Start Development Server
```bash
npm run dev
```

**Expected output**:
```
> next dev --turbopack
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  - Environments: .env
  ✓ Ready in 2.5s
```

**Time**: 5-10 seconds

---

## 6️⃣ Create Test Account
1. Open **http://localhost:3000**
2. Click **Sign Up**
3. Fill in:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
4. Click **Create Account**
5. Check console for confirmation (or email)

**Time**: 1 minute

---

## 7️⃣ Test Each Module

### Test Module 2: Templates ✅
```
1. After login, go to: http://localhost:3000/design-studio
2. Look for "Templates" sidebar section
3. Browse templates by category
4. Search templates
5. Click "Use This Template"
```

**Expected**: Templates load and filter by category

---

### Test Module 3: Mockups ✅
```
1. Go to: http://localhost:3000/products
2. Find any product
3. Click "Preview" button (looks like an eye icon)
4. Click "Generate This Angle"
5. Wait 15-30 seconds... ⏳
6. See mockup appear on product
7. Click other angle tabs to see different views
```

**Expected**: 
- Mockup generates in 20-30 seconds
- Multiple angles available (front, back, side)
- Can zoom (50%-200%)

**⚠️ Note**: First mockup might be slower. Subsequent ones are faster.

---

### Test Module 4: POD Integration (Full Flow) ✅

#### Step 1: Create Design
```
1. Go to: http://localhost:3000/design-studio
2. Upload an image or draw something simple
3. Click "Save Design"
4. Copy the Design ID from URL (will use in next step)
```

#### Step 2: Preview Mockup
```
1. Go to: http://localhost:3000/products
2. Click "Preview" on any product
3. In modal, click "Generate This Angle"
4. Wait for mockup...
5. Click "Add to Cart"
```

#### Step 3: Checkout
```
1. Go to: http://localhost:3000/cart
2. Verify item is there
3. Click "Proceed to Checkout"
4. Fill shipping address:
   - Name: John Doe
   - Address: 123 Main St
   - City: Los Angeles
   - State: CA
   - Zip: 90001
   - Country: US
5. Click "Continue to Payment"
```

#### Step 4: Pay
```
1. Fill payment form:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25 (any future date)
   - CVC: 123 (any 3 digits)
   - Name: John Doe
2. Click "Pay $X.XX"
3. Wait for processing...
```

#### Step 5: Verify Success
```
✅ Should see: "Order Confirmed!" page
✅ Order appears in: http://localhost:3000/orders
✅ Email is sent (check console logs)
✅ Printful order created (check Printful dashboard)
```

**Expected Flow**: 30-60 seconds total

---

## 🧪 Test Cards for Stripe

### ✅ Success
```
Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
→ Payment succeeds immediately
```

### ❌ Test Failures
```
Number: 4000 0000 0000 0002
→ Card declined (appears during payment)

Number: 4000 0000 0000 0341
→ Insufficient funds

Number: 4000 0000 0000 0069
→ Expired card
```

---

## 📊 Verify Everything Works

### Check Database
```bash
psql $DB_URL

# List all products
SELECT COUNT(*) FROM products;

# List all orders
SELECT * FROM orders;

# List all templates
SELECT * FROM templates LIMIT 5;
```

### Check Logs
```
# In terminal running 'npm run dev', you should see:
✅ Product sync completed
✅ API calls working
✅ Database queries logging
```

### Check Stripe Dashboard
```
1. Go to: https://dashboard.stripe.com
2. Login to your Stripe account
3. Go to: Developers → Events
4. Should see: payment_intent.created, payment_intent.succeeded
```

### Check Printful Dashboard
```
1. Go to: https://www.printful.com/dashboard
2. Login to your Printful account
3. Go to: Orders
4. Should see test orders appearing after checkout
```

---

## 🆘 Troubleshooting

### No Products Appearing?
```bash
# Did you run the sync?
npx ts-node scripts/sync-printful-categories.ts

# Verify products in DB
psql $DB_URL -c "SELECT COUNT(*) FROM products;"
```

### Mockup Generation Times Out?
```
1. Check Printful API status
2. Check PRINTFUL env key is valid
3. Try refreshing page and generating again
4. Check browser console for errors (F12)
```

### Payment Declined?
```
1. Use test card: 4242 4242 4242 4242
2. Check Stripe keys start with pk_test_ and sk_test_
3. Check .env has NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Database Connection Error?
```bash
# Test connection
psql $DB_URL -c "SELECT 1"

# View current connection string
echo $DB_URL
```

### Email Not Sending?
```
1. Check SMTP configuration in .env
2. For Gmail: Use app password, not account password
3. Check SMTP_PASS has spaces (copy carefully!)
4. Look for errors in server logs
```

---

## 📋 Checklist Before Testing

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm dependencies installed (`npm install`)
- [ ] `.env` file configured with all keys
- [ ] Database migrations run (2 SQL files)
- [ ] Printful sync completed (`npx ts-node scripts/sync-printful-categories.ts`)
- [ ] Development server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Test account created
- [ ] No errors in browser console (F12)
- [ ] No database connection errors in terminal

---

## 📈 Testing Flow (30 minutes total)

| Step | Task | Time |
|------|------|------|
| 1 | Install & setup | 5 min |
| 2 | Run migrations | 1 min |
| 3 | Sync Printful | 3 min |
| 4 | Start server | 1 min |
| 5 | Create account | 1 min |
| 6 | Test templates | 2 min |
| 7 | Test mockups | 5 min |
| 8 | Complete checkout | 5 min |
| 9 | Verify results | 2 min |
| **Total** | **Complete cycle** | **~30 min** |

---

## ✨ Expected Results

### Module 2: Templates
- ✅ Can browse templates
- ✅ Can filter by category
- ✅ Can search templates
- ✅ Can apply template to design

### Module 3: Mockups
- ✅ Can generate single mockup (20-30 sec)
- ✅ Can generate all angles
- ✅ Can switch between angles
- ✅ Can zoom in/out
- ✅ Design overlayed on product

### Module 4: POD
- ✅ Can checkout with shipping address
- ✅ Can pay with test card
- ✅ See order confirmation
- ✅ Order appears in `/orders`
- ✅ Email confirmation sent
- ✅ Printful order created automatically

---

## 🎉 Success!

When all three modules work end-to-end, you're ready for:
- User acceptance testing
- Performance optimization
- Feature refinement
- Production deployment

**Happy testing!** 🚀
