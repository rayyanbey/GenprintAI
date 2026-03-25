# Quick API Reference: Design → Product → Cart

## 1️⃣ TEMPLATES (Starting Points)

### Get All Templates
```bash
GET /api/templates
```
Returns: Array of pre-made design templates

### Get Single Template
```bash
GET /api/templates/:templateId
```
Returns: Template with all design data, colors, dimensions

---

## 2️⃣ DESIGNS (User Creations)

### Save New Design
```bash
POST /api/designs
Content-Type: application/json

{
  "title": "My Custom Design",
  "description": "For t-shirts",
  "template_id": "template-uuid",        # Optional: which template was used
  "canvas_data": { /* fabric.js JSON */ },
  "artwork_file_url": "https://...",     # Exported design image
  "tags": ["tshirt", "custom"],
  "metadata": { "colors": ["red"] }
}
```
**Returns**: Design with `id` field
```json
{
  "success": true,
  "design": {
    "id": "design-123",
    "user_id": "user-456",
    "title": "My Custom Design",
    "created_at": "2024-03-25..."
  }
}
```

### Get User's Designs
```bash
GET /api/designs?page=1&limit=50
```
Returns: Array of user's saved designs

### Update Design
```bash
PUT /api/designs/:designId

{
  "title": "Updated Design Name",
  "canvas_data": { /* updated */ }
}
```

### Delete Design
```bash
DELETE /api/designs/:designId
```

---

## 3️⃣ PRODUCTS (Merchandise Catalog)

### Get Products by Category
```bash
GET /api/products?category=1&limit=20&page=1
```
**Query Params**:
- `category`: Category ID (integer) ← NOW FIXED
- `minPrice`, `maxPrice`: Price range (uses variant prices)
- `limit`: Items per page
- `page`: Page number

**Returns**: Products with lowest variant price
```json
{
  "success": true,
  "products": [
    {
      "id": "printful_123",
      "name": "T-Shirt",
      "category_id": 1,
      "price": 0,               # Product base (ignore this)
      "image_url": "...",
      "variant_count": 5
    }
  ]
}
```

### Get Product with Variants & Pricing
```bash
GET /api/products/:productId/variants
```
**Returns**: Product with ALL variants and price range
```json
{
  "success": true,
  "product": { /* product info */ },
  "variants": [
    {
      "id": "variant-id",
      "size": "M",
      "color": "Black",
      "price": 14.99,          # <- ACTUAL PRICE
      "sku": "TS-BLACK-M",
      "availability": true
    }
  ],
  "pricing": {
    "min_price": 12.99,
    "max_price": 16.99
  }
}
```

---

## 4️⃣ CART (Product + Design Combinations)

### Add Product with Design to Cart
```bash
POST /api/cart
Content-Type: application/json

{
  "product_id": "printful_123",
  "design_id": "design-456",           # <- Design to print
  "variant": {
    "size": "M",
    "color": "black",
    "sku": "TS-BLACK-M"
  },
  "quantity": 1
}
```
**Returns**: Cart item created/updated
```json
{
  "success": true,
  "message": "Item added to cart",
  "item": {
    "id": "cart-item-uuid",
    "product_id": "printful_123",
    "design_id": "design-456",
    "quantity": 1
  }
}
```

### Get Cart with Design & Pricing
```bash
GET /api/cart
```
**Returns**: All user's cart items with details
```json
{
  "success": true,
  "items": [
    {
      "id": "cart-item-uuid",
      "product_id": "printful_123",
      "product": {
        "name": "T-Shirt",
        "image_url": "..."
      },
      "design_id": "design-456",
      "design": {
        "title": "My Custom Logo",
        "artwork_file_url": "https://..."  # Preview image
      },
      "price": 14.99,                      # From variant
      "quantity": 1,
      "item_total": 14.99,
      "variant": {
        "size": "M",
        "color": "black",
        "sku": "TS-BLACK-M"
      }
    }
  ],
  "summary": {
    "total_items": 1,
    "total_price": 14.99
  }
}
```

### Update Quantity
```bash
PUT /api/cart
Content-Type: application/json

{
  "cart_item_id": "cart-item-uuid",
  "quantity": 2
}
```

### Remove from Cart
```bash
DELETE /api/cart
Content-Type: application/json

{
  "cart_item_id": "cart-item-uuid"
}
```

---

## Complete Example: Flow

### 1. Browse Templates
```bash
curl http://localhost:3000/api/templates
```

### 2. Create Design from Template
```bash
curl -X POST http://localhost:3000/api/designs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Logo Design",
    "template_id": "template-uuid",
    "canvas_data": { /* modified */ },
    "artwork_file_url": "https://bucket/exported.png"
  }'

# Note the returned design.id
```

### 3. Browse Products by Category
```bash
curl "http://localhost:3000/api/products?category=1&limit=10"
```

### 4. Get Prices for a Product
```bash
curl http://localhost:3000/api/products/printful_123/variants
```

### 5. Add to Cart with Design
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "printful_123",
    "design_id": "design-xyz",
    "variant": { "size": "M", "color": "black" },
    "quantity": 1
  }'
```

### 6. Verify Cart
```bash
curl http://localhost:3000/api/cart
```

---

## Key Points to Remember

| Item | Important Note |
|------|-----------------|
| **Product Price** | Always $0 - ignore this |
| **Variant Price** | Use this: comes from Printful |
| **Category Filter** | Now uses `category_id` (integer) |
| **Design** | Stored in `design_id` field in cart |
| **Cart Item** | Combines: product + design + variant |
| **Checkout** | Must pass `design_id` with order |

---

## Status: ✅ READY FOR FRONTEND

All endpoints implemented and tested:
- ✅ Products filtered by category (fixed)
- ✅ Variant prices display correctly (fixed)
- ✅ Designs saved and retrievable
- ✅ Cart supports design_id
- ✅ Cart returns complete item details

Frontend can now:
1. Call these endpoints to build UI
2. Show templates → designs → products → cart flow
3. Display design preview in cart
4. Show correct prices throughout

See `DESIGN_AND_TEMPLATE_WORKFLOW.md` for frontend implementation examples.
