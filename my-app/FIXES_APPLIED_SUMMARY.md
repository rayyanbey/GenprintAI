# Product Filtering & Design Integration - Fixes Applied

## Issues Fixed

### 1. ✅ Product Filtering by Category
**Problem**: Filtering returned no results because code filtered by deprecated `category` (string) field instead of `category_id` (integer).

**Files Modified**: `src/services/product.service.ts`

**Changes**:
- Updated `searchProducts()` to filter by `category_id` (integer from Printful)
- Convert category parameter to number: `parseInt(category)`
- Updated all product responses to return `category_id` instead of deprecated `category`
- Updated Printful sync to store `main_category_id` directly in `category_id` field

**Testing**:
```bash
# Filter products by category ID
curl "http://localhost:3000/api/products?category=1&limit=10"

# Should now return products with that category_id instead of empty results
```

---

### 2. ✅ Design & Template Integration Workflow
**Problem**: Users didn't know how to save designs and apply them to products.

**New Documentation**: `DESIGN_AND_TEMPLATE_WORKFLOW.md`
- Complete flow for saving and applying designs
- Template usage guide
- Design-to-product workflow with pricing
- Frontend example code

---

### 3. ✅ POD Pricing Issue - Products Showing $0
**Problem**: Product base price is $0, actual prices are in variants.

**Solution**: 
- Never use product base price
- Always fetch and use variant prices (retail_price from Printful)
- Created new endpoint: `GET /api/products/:productId/variants`

**New Endpoint**:
```bash
GET /api/products/:productId/variants

Response:
{
  "success": true,
  "product": { /* product info */ },
  "variants": [
    {
      "id": "...",
      "name": "Small Red",
      "size": "S",
      "color": "red",
      "price": 14.99,        # <- Actual price from Printful
      "sku": "TS-RED-S",
      "availability": true
    }
  ],
  "pricing": {
    "min_price": 12.99,
    "max_price": 16.99,
    "available_count": 15,
    "total_count": 20
  }
}
```

---

### 4. ✅ Database Cart Endpoint with Design Support
**Problem**: Cart only existed in localStorage, no database persistence or design tracking.

**New Endpoint**: `app/api/cart/route.ts` with full CRUD operations

**Features**:
- GET: Retrieve user's cart with product details, design info, and pricing
- POST: Add item with design_id, variant, quantity
- PUT: Update quantities
- DELETE: Remove items
- Automatic duplicate detection (same product + variant + design = merge)
- Proper pricing from variants

**Example Usage**:
```typescript
// Add product with design to cart
const response = await fetch('/api/cart', {
  method: 'POST',
  body: JSON.stringify({
    product_id: 'printful_123',
    design_id: 'design-uuid',      // <- Design attached
    variant: {                       // <- Specific size/color
      size: 'M',
      color: 'black',
      sku: 'TS-BLACK-M'
    },
    quantity: 1
  })
});

// Get cart with all details
const cart = await fetch('/api/cart').then(r => r.json());
// Returns: items with product details, design artwork, and correct pricing
```

---

### 5. ✅ Product Variants Endpoint with Pricing
**New Endpoint**: `GET /api/products/:productId/variants`

**Returns**:
- All variants with size, color, price
- Price range (min/max)
- Availability status
- SKU for ordering

**Use Cases**:
```typescript
// Show available sizes/colors with prices
const variants = await fetch(`/api/products/${productId}/variants`).then(r => r.json());

variants.variants.forEach(v => {
  console.log(`${v.size} - ${v.color}: $${v.price}`);
});

// Show "Starting at $X" in catalog
console.log(`Starting at $${variants.pricing.min_price}`);
```

---

## Database Model Relationships

### CartItem Model Support for Designs
The `CartItem` model already supports:
```typescript
{
  id: string,
  user_id: string,
  product_id: string,
  design_id: string,           // <- NOW FULLY USED
  quantity: integer,
  variant: JSON,               // <- Size, color, SKU data
  created_at: timestamp
}
```

---

## How Everything Works Together

### Complete User Flow: Design → Product → Cart

1. **User Creates Design**
   - Start with template OR blank canvas
   - Customize (colors, text, images)
   - Saves via `POST /api/designs`

2. **User Adds Design to Product**
   - Browse products: `GET /api/products?category=1`
   - Check prices: `GET /api/products/:id/variants`
   - Select variant (size/color)
   - Add to cart with design:
     ```json
     {
       "product_id": "printful_123",
       "design_id": "design-uuid",
       "variant": { "size": "M", "color": "black" }
     }
     ```

3. **Cart Tracks Design + Product + Price**
   - Stores: product_id + design_id + variant + quantity
   - Displays: product image + design artwork preview + price
   - Calculates: (variant.price × quantity)

4. **Checkout Creates Printful Order**
   - Takes design artwork file
   - Associates with product & variant
   - Sends complete order to Printful with print details
   - Printful prints and ships

---

## Testing Commands

### 1. Check Product Filtering Works
```bash
# Get products from category 1 (should return items, not empty)
curl "http://localhost:3000/api/products?category=1&limit=5"
```

### 2. Check Product Has Variants with Prices
```bash
# Get a product, then check its variants
curl "http://localhost:3000/api/products/printful_123/variants"

# Should show prices like 14.99, not 0
```

### 3. Test Design Saving
```bash
curl -X POST http://localhost:3000/api/designs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Design",
    "template_id": "template-id",
    "canvas_data": { /* fabric.js data */ }
  }'
```

### 4. Test Adding to Cart with Design
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "printful_123",
    "design_id": "design-uuid",
    "variant": {
      "size": "M",
      "color": "black",
      "sku": "TS-BLACK-M"
    },
    "quantity": 1
  }'

# Then get cart to see it with design info
curl http://localhost:3000/api/cart
```

---

## Database Sync Checklist

To ensure everything works:

1. **Sync Products with Variants & Pricing**
   ```bash
   curl -X POST http://localhost:3000/api/products/sync \
     -H "Authorization: Bearer dev-sync-key-12345" \
     -H "Content-Type: application/json" \
     -d '{ "limit": 100 }'
   ```
   This endpoint:
   - Syncs products from Printful
   - Stores category_id (not deprecated category)
   - Fetches and stores all variants with prices

2. **Verify Variants Have Prices**
   ```sql
   -- Check that product_variants table has prices populated
   SELECT COUNT(*) as total, COUNT(price) as with_price 
   FROM product_variants;
   
   -- Should be same number (all have prices)
   ```

---

## Key Code Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `src/services/product.service.ts` | Filter by `category_id` instead of `category` | Category filtering works |
| `app/api/cart/route.ts` | New database-backed cart CRUD | Design + product persistence |
| `app/api/products/:id/variants/route.ts` | New endpoint with pricing | Frontend can show actual prices |
| Product sync scripts | Store `category_id` not `category` | Filtering uses correct field |

---

## What's Ready Now

✅ Products filter by category correctly
✅ Designs can be saved and retrieved
✅ Designs can be attached to cart items
✅ Cart persists in database with design info
✅ Product prices come from variants (not base $0)
✅ Checkout receives design_id for Printful orders

---

## Next: Manual Testing

1. Start dev server: `npm run dev`
2. Follow QUICK_START_TESTING.md for initial setup
3. Test complete flow:
   - Create design from template
   - Save design
   - Browse products by category
   - Check variant prices
   - Add to cart with design
   - Verify cart has design + product + price

See `DESIGN_AND_TEMPLATE_WORKFLOW.md` for detailed frontend implementation.
