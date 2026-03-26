# Frontend Testing Guide - GenprintAI

Complete step-by-step guide to test all features on the frontend without needing backend testing tools.

---

## **Prerequisites**

- Dev server running: `npm run dev`
- Browser: Chrome/Firefox with DevTools (F12)
- User logged in OR ready to test auth flows
- Database synced with products (run: `node resync-products-with-categories.js`)

---

## **1. CART FUNCTIONALITY** 🛒

### **1.1 Add Product to Cart**

**Steps:**
1. Go to `http://localhost:3000/products`
2. Look at any product card
3. **Expected:** Cart icon visible in header (top right)
4. **Expected:** Cart count shows `0` or not visible

**Test Adding Item:**
1. Click "Add to Cart" button on any product
2. **Expected:** Red badge appears on cart icon with count `1` ✅
3. **Expected:** Toast notification at bottom right: "Added to cart" (green message)
4. Product card shows "Added ✓" feedback

**Verify Cart Updated:**
1. Click cart icon in header
2. **Expected:** Redirected to `/cart` page
3. **Expected:** Product appears in cart with:
   - Product name
   - Price (`$100.00` default)
   - Quantity set to `1`
   - Remove button
4. **Expected:** Subtotal shows correct amount

### **1.2 Update Quantity**

**Steps:**
1. On `/cart` page
2. Find product quantity selector (number input or +/- buttons)
3. Change quantity to `2`
4. **Expected:** 
   - Cart count updates to `2` in header
   - Subtotal recalculates immediately
   - Page shows new total

### **1.3 Remove Item**

**Steps:**
1. On `/cart` page, click "Remove" or delete icon
2. **Expected:**
   - Item disappears from cart
   - Cart count decreases
   - Subtotal updates
   - If last item removed, cart shows empty state

### **1.4 Cart Persistence**

**Steps:**
1. Add product to cart
2. Refresh page (F5)
3. **Expected:** Cart still shows same items (stored in localStorage)

---

## **2. PRODUCT FILTERING & SEARCH** 🔍

### **2.1 Category Filter**

**Steps:**
1. Go to `/products`
2. Left sidebar should show category list
3. Click "Men's clothing" category
4. **Expected:**
   - URL changes to `/products?category=1`
   - Products reload
   - Only men's products show (names contain "men's" or in that category)
   - Product count updates

**Test Multiple Categories:**
1. Click "Women's clothing"
2. **Expected:**
   - Products change to women's items
   - URL updates to `?category=2`

**Test Clear Filter:**
1. Click "All Products" or back button
2. **Expected:**
   - All products show again
   - URL resets

### **2.2 Price Range Filter**

**Steps:**
1. On products page, find price range slider
2. Set Min: `$20`, Max: `$80`
3. **Expected:**
   - Products filter to only show in that range
   - URL: `/products?minPrice=20&maxPrice=80`

### **2.3 Search**

**Steps:**
1. Find search bar on products page
2. Type "shirt"
3. Press Enter or wait for auto-search
4. **Expected:**
   - Products matching "shirt" appear
   - Others hidden

### **2.4 Combined Filters**

**Steps:**
1. Select Category: "Men's clothing"
2. Set Price: $20-$100
3. Search: "t-shirt"
4. **Expected:** Only men's t-shirts between $20-$100 show

---

## **3. PRODUCT DETAILS** 📄

### **3.1 View Product Details**

**Steps:**
1. Click on any product card
2. **Expected:** Product detail page loads with:
   - Large product image
   - Product name
   - Description
   - Price: `$100.00` (default since no variants set)
   - Variant selector (size/color dropdowns)
   - Stock status
   - "Add to Cart" button

### **3.2 Select Variant**

**Steps:**
1. On product detail page
2. Click size dropdown
3. **Expected:** Select size options appear
4. Select a size
5. Click color dropdown
6. **Expected:** Color options appear
7. Select a color
8. **Expected:** Price updates (if variant pricing differs)

### **3.3 Add to Cart from Detail Page**

**Steps:**
1. Select variant (size + color combo)
2. Click "Add to Cart"
3. **Expected:**
   - Toast notification: "Added to cart"
   - Cart icon updates with count
   - Can repeat to add multiple quantities

---

## **4. CHECKOUT FLOW** 💳

### **4.1 Start Checkout**

**Steps:**
1. Go to `/cart` with items
2. Click "Checkout" or "Proceed to Payment"
3. **Expected:** Redirected to checkout page (`/checkout`)
4. **Expected:** Page shows:
   - Order summary (items, prices)
   - Shipping address form
   - Payment method section

### **4.2 Fill Shipping Address**

**Steps - Required Fields:**
1. **Street Address:** `123 Main Street`
2. **City:** `New York`
3. **State/Province:** `NY`
4. **ZIP/Postal Code:** `10001`
5. **Country:** `United States`
6. Click "Continue" or next button

**Validation Test:**
1. Try submitting with empty fields
2. **Expected:** Error message: "Field required"
3. Fill field
4. **Expected:** Error disappears

### **4.3 Payment Information**

**Steps:**
1. On checkout, scroll to payment section
2. **Expected:** Stripe card element visible
3. Enter test card details:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** `12/25` (any future date)
   - **CVC:** `424` (any 3 digits)
   - **ZIP:** `12345`

### **4.4 Complete Order**

**Steps:**
1. Click "Place Order" or "Pay Now"
2. **Expected:** Loading spinner shows
3. **Expected:** After 2-3 seconds, success page appears
4. **Expected:** Shows:
   - "Order Confirmed!" message
   - Order ID
   - Order details (items, total, shipping)
   - "View Orders" button

### **4.5 Failed Payment (Test)**

**Steps - Use Declined Card:**
1. Go back to checkout (add items again)
2. Enter card: `4000 0000 0000 0002` (declined card)
3. Click "Pay"
4. **Expected:** Error message: "Card declined"
5. **Expected:** Can try different card

---

## **5. ORDER HISTORY** 📋

### **5.1 View Orders**

**Steps:**
1. Login (or create account)
2. Go to account page or click profile icon
3. Click "My Orders" or "Order History"
4. **Expected:**
   - List of past orders appears
   - Each shows: Order ID, date, total, status
   - Pagination if multiple orders

### **5.2 View Order Details**

**Steps:**
1. Click on order in list
2. **Expected:** Order detail page shows:
   - Order ID
   - Order date
   - Status (pending/processing/shipped)
   - Items ordered with prices
   - Shipping address
   - Total amount
   - Tracking number (if shipped)

### **5.3 Reorder**

**Steps - if feature exists:**
1. On order detail page
2. Look for "Reorder" button
3. Click it
4. **Expected:** Same items added to cart
5. **Expected:** Redirected to checkout

---

## **6. TEMPLATES** 🎨

### **6.1 Browse Templates**

**Steps:**
1. Go to `/templates` or click Templates in nav
2. **Expected:**
   - Grid of template cards loads
   - Shows: template image, name, category
   - 12+ templates visible

### **6.2 Filter Templates**

**Steps:**
1. Look for category/filter buttons at top
2. Click a category
3. **Expected:** Templates filter by category
4. Try sorting: Newest, Popular, Trending
5. **Expected:** Order changes

### **6.3 View Template Details**

**Steps:**
1. Click a template card
2. **Expected:** Template detail page with:
   - Large template image
   - Template name & description
   - Color variants if any
   - "Use Template" button
   - Usage count

### **6.4 Use Template in Design**

**Steps:**
1. On template detail page
2. Click "Use Template"
3. **Expected - If Logged In:** Design studio opens with template loaded
4. **Expected - If Not Logged In:** Redirect to login

---

## **7. DESIGN STUDIO** ✏️

### **7.1 Start Design**

**Steps:**
1. Go to `/design` or click "Design" in nav
2. **Expected:**
   - Design studio loads (may take 2-3 seconds)
   - Canvas area visible (white space)
   - Tools panel on left/right
   - Color picker visible
   - Export/Save buttons visible

### **7.2 Add Text**

**Steps:**
1. Click "Text" tool
2. Click on canvas where you want text
3. **Expected:** Text input appears
4. Type: "Hello World"
5. **Expected:** Text appears on canvas
6. Click outside or press Done
7. **Expected:** Text stays on canvas

### **7.3 Change Text Properties**

**Steps - on selected text:**
1. Select text by clicking it
2. Look for text properties:
   - Font size slider or input
   - Font family dropdown
   - Color picker
3. Change font size to 40
4. **Expected:** Text grows larger on canvas
5. Change color to red
6. **Expected:** Text turns red

### **7.4 Add Shapes/Stickers**

**Steps - if shapes available:**
1. Click "Shapes" or "Elements"
2. Select a shape (circle, rectangle, etc.)
3. Click on canvas to place
4. **Expected:** Shape appears with resize handles
5. Drag handles to resize
6. **Expected:** Shape resizes smoothly

### **7.5 Save Design**

**Steps:**
1. Click "Save Design" button
2. **Expected:** Modal appears asking for:
   - Design name
   - Description (optional)
   - Category/tags (optional)
3. Enter name: "My Test Design"
4. Click "Save"
5. **Expected:**
   - Toast: "Design saved successfully"
   - Redirected to designs list OR stays in editor
   - Design ID assigned

### **7.6 View Saved Designs**

**Steps:**
1. Go to "/my-designs" or profile > My Designs
2. **Expected:** List/grid of your designs
3. Click a design
4. **Expected:** Reopens in design studio with all elements
5. Can continue editing

### **7.7 Export Design**

**Steps - if feature exists:**
1. In design studio, click "Export" or "Download"
2. **Expected:** Select format dialog appears
3. Choose: PNG or PDF
4. Click "Export"
5. **Expected:** File downloads to computer

---

## **8. AUTHENTICATION** 🔐

### **8.1 Sign Up**

**Steps:**
1. Go to `/login` 
2. Click "Sign Up" or "Create Account"
3. **Expected:** Signup form appears with:
   - Email field
   - Password field
   - Confirm password
   - Terms checkbox
4. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirm: `Test123!`
5. Click "Sign Up"
6. **Expected:**
   - Account created
   - Redirected to `/home` or verify email page
   - User logged in

### **8.2 Login**

**Steps:**
1. Go to `/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Click "Login"
4. **Expected:**
   - Redirect to `/home`
   - User profile shows in header
   - Cart/orders become accessible

### **8.3 Logout**

**Steps:**
1. Click profile icon or avatar in header
2. Click "Logout"
3. **Expected:**
   - Redirected to landing page
   - Profile icons disappear
   - Login button reappears

### **8.4 Protected Routes**

**Steps - When Not Logged In:**
1. Try to access `/cart`
2. **Expected:** Redirects to `/login`
3. Try `/checkout`
4. **Expected:** Redirects to `/login`
5. Try `/design`
6. **Expected:** Redirects to `/login`

---

## **9. RESPONSIVE DESIGN** 📱

### **9.1 Mobile View**

**Steps:**
1. Press F12 to open DevTools
2. Click responsive design mode (Ctrl+Shift+M)
3. Select "iPhone 12" or similar
4. **Expected:**
   - Layout adapts to mobile
   - Navigation collapses to hamburger menu
   - Products show in single column
   - All buttons clickable

### **9.2 Tablet View**

**Steps:**
1. Change device to "iPad"
2. **Expected:**
   - Products show in 2 columns
   - Navigation visible
   - All features accessible

### **9.3 Desktop View**

**Steps:**
1. Full screen (1920px)
2. **Expected:**
   - Products show in 4+ columns
   - All features optimized
   - Whitespace balanced

---

## **10. ERROR HANDLING** ⚠️

### **10.1 Network Error**

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click throttling dropdown, select "Offline"
4. Try to add product to cart
5. **Expected:** Error message appears
6. Turn network back on, retry
7. **Expected:** Works again

### **10.2 Invalid Input**

**Steps:**
1. On checkout, enter:
   - Invalid ZIP: `abc`
   - Invalid email: `notanemail`
2. Try to submit
3. **Expected:** Validation errors appear

### **10.3 Session Timeout**

**Steps - if implemented:**
1. Login to account
2. Wait 30+ minutes without activity
3. Try to checkout
4. **Expected:** Redirects to login
5. Can login again

---

## **11. TOAST NOTIFICATIONS** 🔔

### **Expected Toast Messages:**

| Action | Toast Message | Color |
|--------|--------------|-------|
| Add to cart | "Added to cart" | Green ✓ |
| Item removed | "Removed from cart" | Gray |
| Order placed | "Order placed successfully" | Green ✓ |
| Save design | "Design saved successfully" | Green ✓ |
| Error | "Something went wrong" | Red ✗ |
| Login successful | "Logged in successfully" | Green ✓ |
| Logout | "Logged out" | Gray |

**Test Toast:**
1. Add product to cart
2. **Expected:** Green toast at bottom right
3. Toast auto-closes after 3 seconds
4. Can click X to close manually

---

## **12. CART ICON COUNTER** 🔴

### **Test Cart Badge:**

1. Add 1 product → Badge shows `1`
2. Add another → Badge shows `2`
3. Add 9 more → Badge shows `9+` (numbers 10+)
4. Hover over cart icon → Tooltip shows "Cart (X)"
5. Badge pulses/animates when items present

---

## **DEBUGGING TIPS** 🔧

### **DevTools Console (F12 > Console)**
```javascript
// Check cart state
JSON.parse(localStorage.getItem('cart'))

// Check session
JSON.parse(localStorage.getItem('session'))

// Log all network requests
// Check Network tab for failed requests
```

### **Check Network Requests:**
1. F12 > Network tab
2. Add product to cart
3. Look for request to `/api/products` or similar
4. Click request, check:
   - **Status:** 200 (success), 401 (auth error), 500 (server error)
   - **Response:** Check returned data
   - **Headers:** Verify auth token sent

### **Test Performance:**
1. F12 > Lighthouse
2. Run Full Page Audit
3. Check scores for:
   - Performance
   - Accessibility
   - Best Practices

---

## **CHECKLIST FOR COMPLETE TEST** ✅

- [ ] Add product to cart → See count update
- [ ] Remove product → Count decreases
- [ ] Filter by category → See products change
- [ ] Search products → Results update
- [ ] View product details → All info displays
- [ ] Select variant → Size/color options work
- [ ] Proceed to checkout → Form appears
- [ ] Enter shipping address → Validates correctly
- [ ] Enter test card → Payment processes
- [ ] See order confirmation → Order ID shows
- [ ] View order history → Past orders list
- [ ] Create design → Canvas loads
- [ ] Save design → Saved successfully
- [ ] Edit design → Opens with all layers
- [ ] Browse templates → Categories filter
- [ ] Login/logout → Works smoothly
- [ ] Mobile view → Responsive layout
- [ ] Toast notifications → Show correctly
- [ ] Error handling → Graceful messages

---

## **QUICK REFERENCE: TEST SCENARIOS** 🚀

### **Scenario 1: New User Journey**
1. Land on home page
2. Browse products
3. Add item to cart
4. Signup/login
5. Checkout
6. Place order
7. View order history

### **Scenario 2: Designer Workflow**
1. Login
2. Go to templates
3. Use template
4. Edit design
5. Save design
6. View saved designs
7. Export design

### **Scenario 3: Shopper Workflow**
1. Browse products with filters
2. View product details
3. Add multiple items to cart
4. Update quantities
5. Checkout with discount code (if feature exists)
6. Pay with card
7. View confirmation

### **Scenario 4: Category Filter Testing**
1. Visit `/products`
2. Test each root category:
   - Men's clothing
   - Women's clothing  
   - Kids' clothing
   - Accessories
   - Home & living
   - Hats
3. Verify products update correctly for each

---

## **COMMON ISSUES & FIXES** 🐛

| Issue | Solution |
|-------|----------|
| Cart not showing | Refresh page, check localStorage |
| Products not filtering | Verify category_id in database |
| Login not working | Check auth provider keys |
| Design studio blank | Wait 3+ seconds for load, clear cache |
| Toast not showing | Check ToastProvider in layout |
| Images not loading | Check image URL valid, CORS enabled |
| Payment fails | Use test card `4242 4242 4242 4242` |

---

## **CONTACT & SUPPORT** 💬

If tests fail:
1. Check browser console (F12) for errors
2. Check network requests for 404/500 errors
3. Verify dev server is running: `npm run dev`
4. Try clearing cache: `Ctrl+Shift+Delete`
5. Restart dev server and try again

---

**Last Updated:** March 2026  
**Test Environment:** Chrome/Firefox on Windows  
**Next:** Review results and report bugs with screenshots
