# Design & Template Workflow Guide

## Overview
This guide explains how to:
1. Create and save designs
2. Use templates as design starting points
3. Apply designs to products
4. Add designed products to cart

## Current Architecture

### Models Supporting This Flow
- **Design**: Stores user-created designs with canvas data, artwork URLs, and metadata
- **Template**: Pre-made design templates for quick starting points
- **CartItem**: Contains product + design combination with `design_id` field
- **Product/ProductVariant**: Products from Printful with pricing information

---

## Part 1: Using Templates

### What Are Templates?
Templates are pre-designed starting points that users can clone and customize. Currently seeded templates include:
- Classic Logo (apparel)
- Full Print (apparel)
- Pocket Print (apparel)
- Back Print (apparel)
- Hat Logo (accessories)
- Bag Design (accessories)
- Mug Front (home_living)
- Photo Pillow (home_living)
- Blanket Print (home_living)

### API Endpoints for Templates
```bash
# Get all templates
GET /api/templates

# Get single template
GET /api/templates/:id

# Create new template (admin)
POST /api/templates
```

### How Templates Are Used in Frontend

1. **Browse Templates**
```typescript
// Get all templates
const response = await fetch('/api/templates');
const templates = await response.json();
```

2. **Select & Customize Template**
   - User selects a template from the catalog
   - Template data (canvas_data, dimensions, colors) loads into the design studio
   - User customizes (colors, text, images, placement)
   - User clicks "Save as New Design"

3. **Save Template as New Design**
```typescript
// After customizing template in design studio
const newDesign = await fetch('/api/designs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Custom T-Shirt Design',
    description: 'Custom design based on Classic Logo template',
    template_id: templateId,  // Reference to the template used
    canvas_data: updatedCanvasData,  // User's modifications
    artwork_file_url: exportedImageUrl,  // Exported design as image
    export_format: 'png',
    tags: ['tshirt', 'custom'],
    metadata: { colors: ['red', 'white'], technique: 'embroidery' }
  })
});

const design = newDesign.json();
console.log('Design saved:', design.id);
```

---

## Part 2: Saving Designs

### API: POST /api/designs
```json
{
  "title": "My Awesome Design",
  "description": "A custom design for merchandise",
  "template_id": "template-uuid",  // Optional - reference to template used
  "canvas_data": { /* fabric.js canvas data */ },
  "artwork_file_url": "https://bucket/designs/design-123.png",
  "export_format": "png",
  "tags": ["apparel", "custom"],
  "metadata": {
    "colors": ["#FF0000", "#FFFFFF"],
    "technique": "screen-print"
  }
}
```

### What Gets Stored in Design
- **title**: Design name (user-visible)
- **description**: About the design
- **template_id**: Which template this was based on
- **canvas_data**: The full editable canvas data (JSON)
- **artwork_file_url**: Image export of the design
- **tags & metadata**: Search/organization data

### Response
```json
{
  "success": true,
  "design": {
    "id": "design-uuid",
    "user_id": "user-123",
    "title": "My Awesome Design",
    "version_number": 1,
    "created_at": "2024-03-25T10:30:00Z"
  }
}
```

---

## Part 3: Applying Design to Product + Adding to Cart

### The Complete Flow

#### Step 1: Get Products
```typescript
// Fetch products with prices (products must have category_id set)
const response = await fetch('/api/products?category=1&limit=20');
const productsData = await response.json();

// Each product has:
// {
//   id: "printful_123",
//   name: "T-Shirt",
//   category_id: 1,
//   price: 0,  // Base product price (see pricing section below)
//   image_url: "...",
//   variant_count: 5
// }
```

#### Step 2: Get Product Variants with Prices
```typescript
// Product variants have actual pricing from Printful
const variantResponse = await fetch(`/api/products/${productId}/variants`);
const variantsData = await variantResponse.json();

// Each variant includes:
// {
//   id: "printful_123_variant_456",
//   name: "Small Red",
//   size: "S",
//   color: "red",
//   price: 14.99,  // <- Actual retail price from Printful
//   availability: true,
//   sku: "TS-RED-S"
// }
```

#### Step 3: Select Design
```typescript
// User selects a design from their saved designs
const designsResponse = await fetch('/api/designs?limit=50');
const designs = await designsResponse.json();

// User picks one design for this product
const selectedDesignId = designs[0].id;
const selectedDesign = designs[0];
// {
//   id: "design-uuid",
//   title: "My Awesome Design",
//   artwork_file_url: "https://...",
//   template_id: "template-123"
// }
```

#### Step 4: Select Variant
```typescript
// User selects which variant (size/color)
const selectedVariant = {
  size: 'M',
  color: 'black',
  sku: 'TS-BLACK-M'
};
```

#### Step 5: Add to Cart with Design
```typescript
// Add product with design and variant to cart
import { useCart } from '@/contexts/CartContext';

const { addItem } = useCart();

addItem({
  id: `${productId}_${selectedVariant.sku}_${selectedDesignId}`,
  product_id: productId,
  name: `${product.name} (${selectedVariant.color}, ${selectedVariant.size})`,
  price: selectedVariant.price,  // <- Use variant price, not product price
  quantity: 1,
  image_url: product.image_url,
  design_id: selectedDesignId,  // <- THIS IS THE KEY: Attach design
  variant: selectedVariant
});
```

#### Step 6: Checkout with Design
```typescript
// When checking out, cart items include design info
const cartItems = cart.items;
// [
//   {
//     product_id: "printful_123",
//     design_id: "design-uuid",
//     quantity: 1,
//     price: 14.99,
//     variant: { size: "M", color: "black" }
//   }
// ]

// POST to checkout - pass design_id for each item
const checkoutResponse = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cartItems.map(item => ({
      product_id: item.product_id,
      design_id: item.design_id,  // <- Send design with product
      variant: item.variant,
      quantity: item.quantity
    })),
    payment_method_id: stripePaymentMethodId
  })
});
```

---

## Part 4: POD (Print-on-Demand) Integration

### How Printful Integration Works

When a design + product is ordered:

1. **Create Printful Order** (app/api/printful/create-order/route.ts)
   - Takes the design artwork (image file)
   - Creates print file from the design
   - Associates with product & variant
   - Sends to Printful API

2. **Design Artwork Requirements**
   ```typescript
   {
     file_type: 'embroidery' | 'screen_print' | 'dtg',  // Technique
     url: 'https://bucket/designs/design-123.png',       // Design image
     position: 'front',  // Where to print
     size: '6in x 6in'   // Print size
   }
   ```

3. **Printful Processes**
   - Validates print file
   - Sets up production
   - Ships to customer

---

## Part 5: Pricing Issue - Why Products Show $0

### Root Cause
Products are stored with base price of $0. Actual prices are in **variants**.

### Solution: Always Use Variant Prices

When displaying products:
```typescript
// ❌ WRONG - Shows $0
const product = {
  name: "T-Shirt",
  price: 0  // Product base price
};

// ✅ CORRECT - Shows actual price
const variant = {
  name: "T-Shirt Small Red",
  price: 14.99  // Variant retail price from Printful
};
```

### API to Get Product with Prices
```typescript
// Option 1: Get product details with variants
GET /api/products/:productId

// Returns: Product with embedded variant data

// Option 2: Get only variants
GET /api/products/:productId/variants

// Returns: Array of variants with prices
```

### Fix: Update Product Listing to Show Variant Prices
```typescript
// When displaying products in catalog, show variant price info
const product = await fetch(`/api/products/${productId}`);
const productData = await product.json();

// Find lowest price variant
const lowestPriceVariant = productData.variants.reduce(
  (min, v) => v.price < min.price ? v : min
);

console.log(`Starting at $${lowestPriceVariant.price}`);
```

### Sync Products with Variants
If products don't have variant prices:

```bash
# Run product sync with variant prices
POST /api/products/sync -H "Authorization: Bearer dev-sync-key-12345"
```

---

## Complete Frontend Example

```typescript
// DesignToProductFlow.tsx

'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export function DesignToProductFlow() {
  const { addItem } = useCart();
  
  const [designs, setDesigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Load user's designs
  const loadDesigns = async () => {
    const res = await fetch('/api/designs');
    const data = await res.json();
    setDesigns(data.designs);
  };

  // Load products
  const loadProducts = async () => {
    const res = await fetch('/api/products?limit=20');
    const data = await res.json();
    setProducts(data.products);
  };

  // Load variants for selected product
  const loadVariants = async (productId) => {
    const res = await fetch(`/api/products/${productId}/variants`);
    const data = await res.json();
    setSelectedProduct({ ...selectedProduct, variants: data.variants });
  };

  // Add to cart with design
  const handleAddToCart = () => {
    if (!selectedDesign || !selectedProduct || !selectedVariant) {
      alert('Please select a design, product, and variant');
      return;
    }

    addItem({
      id: `${selectedProduct.id}_${selectedVariant.sku}_${selectedDesign.id}`,
      product_id: selectedProduct.id,
      name: `${selectedProduct.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,  // Use variant price
      quantity: 1,
      image_url: selectedProduct.image_url,
      design_id: selectedDesign.id,  // <- Attach design
      variant: selectedVariant
    });

    alert('Added to cart!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">1. Select Your Design</h2>
        <button onClick={loadDesigns} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Load My Designs
        </button>
        <div className="grid grid-cols-3 gap-4">
          {designs.map(design => (
            <div
              key={design.id}
              onClick={() => setSelectedDesign(design)}
              className={`p-4 border-2 rounded cursor-pointer ${
                selectedDesign?.id === design.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h3 className="font-semibold">{design.title}</h3>
              <p className="text-sm text-gray-600">{design.description}</p>
              {design.artwork_file_url && (
                <img src={design.artwork_file_url} alt={design.title} className="mt-2 h-20 object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDesign && (
        <div>
          <h2 className="text-2xl font-bold mb-4">2. Choose Product & Size</h2>
          <button onClick={loadProducts} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
            Load Products
          </button>
          <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  loadVariants(product.id);
                }}
                className={`p-4 border-2 rounded cursor-pointer ${
                  selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category_id}</p>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="mt-2 h-20 object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProduct && selectedProduct.variants && (
        <div>
          <h2 className="text-2xl font-bold mb-4">3. Select Size & Color</h2>
          <div className="space-y-3">
            {selectedProduct.variants.map(variant => (
              <div
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`p-4 border-2 rounded cursor-pointer flex justify-between items-center ${
                  selectedVariant?.id === variant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div>
                  <p className="font-semibold">{variant.size} - {variant.color}</p>
                  <p className="text-sm text-gray-600">{variant.sku}</p>
                </div>
                <p className="text-lg font-bold">${variant.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDesign && selectedProduct && selectedVariant && (
        <button
          onClick={handleAddToCart}
          className="w-full px-6 py-3 bg-green-500 text-white text-lg font-bold rounded hover:bg-green-600"
        >
          Add to Cart - ${selectedVariant.price.toFixed(2)}
        </button>
      )}
    </div>
  );
}
```

---

## Summary of Key Points

1. **Designs** are saved user creations with canvas data and artwork exports
2. **Templates** are starting points that can be customized and saved as designs
3. **Cart supports design_id** - each cart item can have an associated design
4. **Products show $0** - always use variant prices instead
5. **Checkout passes design_id** to create Printful orders with print files
6. **Printful needs variants synced** for prices to show correctly

## Next Steps

1. Ensure products are synced with variants via `/api/products/sync`
2. Update product display components to show variant prices
3. Update cart components to show design preview with product
4. Implement design preview in mockup viewer before checkout
5. Store design file URL in order for reference/reprinting
