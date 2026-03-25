# Quick Setup Guide - Product Category Filtering

## What's Changed

Your product filtering system has been upgraded from hardcoded categories to a full hierarchical category system based on Printful's official catalog structure.

## Files Created/Modified

### New Files:
- `src/models/category.model.ts` - Category database model
- `src/services/category.service.ts` - Category business logic
- `app/api/categories/route.ts` - Category API endpoints
- `app/api/printful/sync-categories/route.ts` - Category sync endpoint
- `hooks/useCategories.ts` - React hook for category fetching
- `scripts/sync-printful-categories.ts` - Script to sync all categories
- `CATEGORY_FILTERING.md` - Comprehensive documentation

### Modified Files:
- `src/models/product.model.ts` - Added `category_id` field
- `components/ProductBrowser/ProductBrowser.tsx` - Updated to use hierarchical categories

## Setup Steps (Quick Start)

### Step 1: Sync Categories
Run the database migrations (if not automatic):
```bash
npm run db:migrate
```

### Step 2: Import Printful Categories
Run the sync script:
```bash
cd my-app
npx ts-node scripts/sync-printful-categories.ts
```

Or make a POST request:
```bash
curl -X POST http://localhost:3000/api/printful/sync-categories \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [...your-categories-data...]
  }'
```

### Step 3: Verify
Check that categories were synced:
```bash
curl http://localhost:3000/api/categories?hierarchy=true
```

## Features

✅ **Hierarchical Categories** - Full Printful category structure with parent-child relationships
✅ **Expandable Tree UI** - Users can expand/collapse category groups in the product browser
✅ **Dynamic Loading** - Categories fetched from API, not hardcoded
✅ **Smart Filtering** - Filter products by any category level
✅ **Backward Compatible** - Existing product queries still work

## Testing the Feature

### Option 1: Via API
```bash
# Get all categories (flat)
curl http://localhost:3000/api/categories

# Get hierarchical structure
curl http://localhost:3000/api/categories?hierarchy=true

# Get children of Men's clothing (ID: 1)
curl http://localhost:3000/api/categories?parentId=1
```

### Option 2: In Browser
1. Navigate to the Products page
2. Click "Filters" to expand the filter panel
3. You should see the hierarchical category tree
4. Click categories to expand them
5. Select a category to filter products

## Database Considerations

The system uses:
- **categories** table - Stores all category data with hierarchy info
- **products** table - New `category_id` field added (nullable for backward compatibility)

### Recommended Indexes (for performance):
```sql
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_products_category_id ON products(category_id);
```

## Next Steps

1. **Update Product Sync Service** - Modify where products are imported to use `category_id`:
   ```typescript
   category_id: printfulProduct.main_category_id,
   ```

2. **Test Category Filtering** - Create/sync some products and test filtering

3. **Add Category Pages** - Create dedicated category browse pages with breadcrumbs

4. **Optimize Queries** - Add the recommended indexes to the database

## Troubleshooting

**Q: Categories not showing in product browser?**
A: Make sure you've run the sync script and the API returns categories at `/api/categories?hierarchy=true`

**Q: Product filtering not working?**
A: Ensure products have `category_id` set. Check the product service is using the new field.

**Q: Hierarchy not displaying correctly?**
A: Verify categories have the correct `parent_id` values. Can check with:
```sql
SELECT id, parent_id, title, level FROM categories ORDER BY level, catalog_position;
```

## Documentation

For detailed information, see [CATEGORY_FILTERING.md](./CATEGORY_FILTERING.md)
