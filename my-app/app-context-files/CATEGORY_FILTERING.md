# Product Category Filtering Implementation

This document outlines the implementation of hierarchical category-based product filtering in the GenprintAI application.

## Overview

Product filtering now supports the full Printful category hierarchy instead of hardcoded categories. The system includes:

- **Hierarchical categories** with parent-child relationships
- **Dynamic category tree** in the product browser
- **API endpoints** for category management
- **Database persistence** of category data
- **Category synchronization** from Printful

## Architecture

### Database Models

#### Category Model (`src/models/category.model.ts`)
Stores the product category hierarchy with the following fields:
- `id` (INTEGER, PRIMARY KEY) - Printful category ID
- `parent_id` (INTEGER) - Parent category ID (0 for root categories)
- `title` (STRING) - Category name
- `image_url` (TEXT) - Category image URL
- `catalog_position` (INTEGER) - Display order within parent
- `size` (STRING) - Category size (e.g., 'small')
- `path` (STRING) - Hierarchical path for efficient queries (e.g., "0/1/6/24")
- `level` (INTEGER) - Depth in hierarchy (0 for root, 1 for children, etc.)

#### Product Model Updates (`src/models/product.model.ts`)
Added new field:
- `category_id` (INTEGER) - References category ID
- `category` (STRING) - Deprecated, kept for backward compatibility

### Services

#### Category Service (`src/services/category.service.ts`)
Main service for category operations:
- `syncCategories(categoriesData)` - Import categories from Printful data
- `getCategoryHierarchy()` - Get hierarchical tree structure
- `getAllCategories()` - Get flat list of all categories
- `getCategoryWithParents(categoryId)` - Get category with parent chain
- `getCategoryChildren(parentId)` - Get all descendants of a category

### API Endpoints

#### GET `/api/categories`
Fetch categories with optional filtering
- Query params:
  - `hierarchy=true` - Get hierarchical structure (default: false)
  - `parentId={id}` - Get children of specific category

**Example responses:**

```bash
# Get flat list
curl http://localhost:3000/api/categories

# Get hierarchical structure
curl http://localhost:3000/api/categories?hierarchy=true

# Get children of Men's clothing (ID: 1)
curl http://localhost:3000/api/categories?parentId=1
```

#### POST `/api/categories`
Sync categories from Printful data
- Body: `{ "categories": [...] }`

#### POST `/api/printful/sync-categories`
Sync all Printful categories
- Body: Array of category objects from Printful

**Example:**
```bash
curl -X POST http://localhost:3000/api/printful/sync-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [
      {
        "id": 1,
        "parent_id": 0,
        "title": "Men'"'"'s clothing",
        "image_url": "...",
        "catalog_position": 1,
        "size": "small"
      }
    ]
  }'
```

### Frontend Hooks

#### useCategories Hook (`hooks/useCategories.ts`)
React hook for fetching categories:

```typescript
// Get flat list
const { categories, loading, error } = useCategories();

// Get hierarchical structure
const { hierarchy, loading, error } = useCategories(true);

// Get children of specific category
const { categories } = useCategories(false, parentId);
```

### Component Updates

#### ProductBrowser Component (`components/ProductBrowser/ProductBrowser.tsx`)
Updated to use hierarchical categories:
- Displays full Printful category tree
- Expandable/collapsible category groups
- Dynamic category loading via `useCategories` hook
- Maintains search and price filters alongside category

**Features:**
- Category tree with expand/collapse
- Visual indication of selected category
- "All Products" option
- Smooth integration with existing filters

## Setup Instructions

### 1. Create Database Tables

The category table will be created automatically via Sequelize migrations. If not, run:

```bash
npm run db:migrate
```

### 2. Sync Categories

Run the sync script to import all Printful categories:

```bash
# Using the provided script
npx ts-node scripts/sync-printful-categories.ts

# Or manually via API
curl -X POST http://localhost:3000/api/printful/sync-categories \
  -H "Content-Type: application/json" \
  -d '{ "categories": [your-categories-data] }'
```

### 3. Update Products

When syncing products, use `category_id` instead of `category`:

```typescript
// In product sync service
const [product, created] = await Product.upsert({
  id: `printful_${printfulProduct.id}`,
  category_id: printfulProduct.main_category_id,
  // ... other fields
});
```

## Database Query Examples

### Get all root categories
```sql
SELECT * FROM categories WHERE parent_id = 0 ORDER BY catalog_position ASC;
```

### Get all descendants of a category
```sql
SELECT * FROM categories WHERE path LIKE '%/1/%' ORDER BY catalog_position ASC;
```

### Get category with breadcrumb
```sql
SELECT c.*, p.title as parent_title
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.id = 24;
```

## Frontend Usage

### Basic Product Filtering
```typescript
import { useCategories } from '@/hooks/useCategories';
import ProductBrowser from '@/components/ProductBrowser/ProductBrowser';

export default function Shop() {
  // Categories are fetched and managed within ProductBrowser
  return <ProductBrowser />;
}
```

### Manual Category Fetch
```typescript
'use client';

import { useCategories } from '@/hooks/useCategories';

export default function CategorySelector() {
  const { hierarchy, loading } = useCategories(true);

  if (loading) return <div>Loading...</div>;

  return (
    <CategoryTree categories={hierarchy} />
  );
}
```

## Migration Path

### For Existing Products
1. Map existing string categories to Printful category IDs
2. Run migration to update `category_id` field
3. Products can still be queried by old `category` field (backward compatible)

### Category Mapping
```typescript
// Example mapping
const CATEGORY_MAP = {
  'apparel': [1, 2, 3],        // Men's, Women's, Kids'
  'accessories': [4, 93],       // Accessories, Hats
  'home_living': [5],           // Home & living
};
```

## Performance Considerations

### Indexes
Add these indexes for optimal performance:
```sql
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_products_category_id ON products(category_id);
```

### Caching
Consider caching category hierarchy in:
- Browser (IndexedDB or localStorage)
- Server-side (Redis)
- ISR/SSG for category pages

## Troubleshooting

### Categories not appearing
1. Verify database table exists: `SELECT COUNT(*) FROM categories;`
2. Check sync was successful: `SELECT COUNT(*) FROM categories;` should be > 0
3. Verify API endpoint: `curl http://localhost:3000/api/categories`

### Product filtering not working
1. Ensure products have `category_id` set
2. Check API `filtering: { category: categoryId }`
3. Verify product service is using `category_id` field

### Hierarchy not loading
1. Check `useCategories` hook is called with `useHierarchy=true`
2. Verify categories have correct `parent_id` values
3. Check browser console for fetch errors

## Future Enhancements

- [ ] Category breadcrumb navigation
- [ ] Category descriptions and metadata
- [ ] Category-specific product rules/variations
- [ ] Advanced filtering by multiple categories
- [ ] Category analytics and popularity tracking
- [ ] Search optimization with category context
