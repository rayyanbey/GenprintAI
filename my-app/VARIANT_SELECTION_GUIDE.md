# Variant & Size Selection Guide

## ✅ What Was Fixed

**Problem:** Users could not select product variants (size, color) before adding items to cart.

**Solution:** Created a complete product detail page at `/products/[id]` with:
- Product information display
- Size selector dropdown
- Color selector dropdown  
- Real-time availability status
- Quantity selector
- Proper cart integration with selected variant

---

## 🛒 How to Use (Frontend Testing)

### **Step 1: Browse Products**

1. Go to `http://localhost:3000/products`
2. Browse the product listing
3. See each product with name, image, price, category badge

### **Step 2: View Product Details**

**Click "View Details" button** on any product card
- Red/pink "View Details" button with shopping cart icon
- This opens the product detail page

**OR click "Preview"** (gray button) to see a mockup

### **Step 3: Select Variant (SIZE)**

On the product detail page:

1. **Size Selector** - Click dropdown
   - Shows all available sizes for this product
   - Examples: XS, S, M, L, XL, 2XL, 3XL
   - Select one size

2. **Color Selector** - Becomes available after selecting size
   - Shows all colors available for the selected size
   - Examples: Black, White, Navy, Gray, Red, etc.
   - Select a color

### **Step 4: Check Price & Availability**

- **Price** - Updates based on variant if different
  - Shows in large blue text: `$99.99`
  - May vary by size/color (variant-specific pricing)

- **Availability Badge** - Shows:
  - ✓ Green "In Stock" = Can add to cart
  - Red "Out of Stock" = Cannot add to cart (disabled)

### **Step 5: Select Quantity**

- Use `-` and `+` buttons OR type number directly
- Default: 1
- Can order multiple quantities

### **Step 6: Add to Cart**

1. **Red/pink "Add to Cart" button** at bottom
2. Button is **disabled** (grayed out) if:
   - Size not selected
   - Color not selected
   - Variant is out of stock

3. Click **"Add to Cart"** when all required fields set
4. See **green success toast**: "✓ Added 1 to cart!"
5. Quantity resets to 1 (ready for next product)

---

## 📋 Complete Test Workflow

### **Scenario 1: Add Single Item**

```
1. Go to /products
2. Click "View Details" on any product  
3. Select Size: "M"
4. Select Color: "Black"
5. Quantity: 1
6. Click "Add to Cart"
7. See toast: "✓ Added 1 to cart!"
8. Click cart icon → See item in cart
```

### **Scenario 2: Add Multiple Sizes/Colors**

```
1. On product detail page
2. Select Size: "M", Color: "Black", Qty: 2 > Add to Cart
3. Select Size: "L", Color: "Red", Qty: 1 > Add to Cart
4. See toast twice (once per submission)
5. Cart now has 2 items with different variants
```

### **Scenario 3: Check Variant Availability**

```
1. Select Size: "XL"
2. Select Color: "Rare-Purple" (if in stock)
3. See green "✓ In Stock" badge
4. Can add to cart
5. Try selecting Size: "XXXL" (if no colors available)
6. Color dropdown becomes empty
7. "Add to Cart" button disabled
```

---

## 🔧 Technical Details

### **Product Detail Page Structure**
- **Route:** `/products/[id]`
- **File:** `app/(pages)/products/[id]/page.tsx`
- **API Calls:**
  - `GET /api/products/:id` - Get product info
  - `GET /api/products/:id/variants` - Get all variants

### **Variant Data Structure**
```javascript
{
  id: "variant-123",
  printful_variant_id: "abc123",
  name: "Unisex T-Shirt",
  size: "L",           // Size option
  color: "Black",      // Color option
  price: 12.50,        // Variant-specific price
  availability: true,  // In stock?
  sku: "TSH-L-BLK",   // Stock keeping unit
  weight: "0.25"       // Shipping weight
}
```

### **Cart Item with Variant**
When you add a product with variant selection:
```javascript
{
  id: "product-123-TSH-L-BLK",
  product_id: "123",
  name: "Awesome T-Shirt - L Black",
  price: 12.50,
  quantity: 2,
  image_url: "...",
  variant: {
    size: "L",
    color: "Black",
    sku: "TSH-L-BLK"
  }
}
```

---

## ✅ Verification Checklist

- [ ] Product detail page loads when clicking "View Details"
- [ ] Size dropdown shows 3+ sizes
- [ ] Selecting size updates available colors
- [ ] Color dropdown updates when size changes
- [ ] Price displays correctly
- [ ] Availability status shows (green or red)
- [ ] Quantity can be changed with +/- buttons
- [ ] Add to Cart button only enabled when size+color selected
- [ ] Toast shows "Added X to cart!" message
- [ ] Cart icon count updates
- [ ] Item in cart shows correct size and color
- [ ] Can add same product with different sizes
- [ ] Out of stock variants show red badge
- [ ] Out of stock variants disable "Add to Cart" button

---

## 🔗 Navigation Flow

```
Home
  ↓
/products (Product Listing)
  ↓
  [View Details] → /products/[id] (Product Detail Page)
              ↓
         Select Variant
              ↓
         Add to Cart
              ↓
         Cart Icon Updates
              ↓
         [Click Cart Icon]
              ↓
         /cart (Shopping Cart)
              ↓
         [Proceed to Checkout]
              ↓
         /checkout (Checkout Page)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "View Details" button not showing | Refresh page, check ProductCardEnhanced component |
| Product detail page blank | Check browser console (F12) for errors, ensure API running |
| Size/color dropdowns empty | Check variants API: `/api/products/[id]/variants` |
| Can't select color after size | Wait 1 sec, refresh or try different size |
| "Add to Cart" button disabled | Ensure size AND color selected, product in stock |
| Cart not updating | Check localStorage, browser console, CartContext |
| Price not updating with variant | Check variant has `price` field in database |

---

## 📱 Mobile Testing

Product detail page is **fully responsive**:
- **Mobile (320px):** Single column, large touch buttons
- **Tablet (768px):** Two columns, optimized spacing
- **Desktop (1920px):** Full layout with whitespace

Test on different screen sizes in DevTools:
1. F12 → Responsive Design Mode (Ctrl+Shift+M)
2. Select device (iPhone 12, iPad, Desktop)
3. Test all variant selection and cart functionality

---

## 🎯 Expected Behavior Summary

| State | Button Status | Can Add |
|-------|---|---|
| No variant selected | Disabled (grayed) | ❌ No |
| Size selected, no color | Disabled (grayed) | ❌ No |
| Size & color selected, in stock | Enabled (red/pink) | ✅ Yes |
| Size & color selected, out of stock | Disabled (grayed) | ❌ No |

**Success Toast:** Green notification "✓ Added X to cart!" appears for 3 seconds

---

**Last Updated:** March 2026  
**Component:** `/app/(pages)/products/[id]/page.tsx`  
**Related Files:** ProductCardEnhanced, CartContext, useProducts hook
