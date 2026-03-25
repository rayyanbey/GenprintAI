# Category System Architecture

## Data Flow Diagram

```
Printful API
    |
    ↓
Printful Categories JSON (306 categories, hierarchical)
    |
    ↓
/api/printful/sync-categories (POST endpoint)
    |
    ↓
syncCategories() (service)
    |
    ├─ Calculate hierarchy level
    ├─ Build category path
    └─ Upsert to database
    |
    ↓
Database: categories table
    |
    ├─ Root categories (parent_id = 0)
    │   ├─ Men's clothing (1)
    │   ├─ Women's clothing (2)
    │   ├─ Kids & youth (3)
    │   ├─ Accessories (4)
    │   ├─ Home & living (5)
    │   ├─ Hats (93)
    │   ├─ Collections (116)
    │   └─ Brands (159)
    │
    └─ Child categories (parent_id > 0)
        ├─ T-shirts (24, parent: 1)
        ├─ Hoodies (28, parent: 1)
        ├─ Tank tops (30, parent: 2)
        └─ ... (300+ more)
```

## Component Interactions

```
ProductBrowser Component
    |
    ├─ useCategories(true) hook
    |   |
    |   ├─ fetch /api/categories?hierarchy=true
    |   |
    |   └─ Receive: Category[]
    |
    ├─ CategoryTreeItem (recursive)
    |   |
    |   ├─ Display category name
    |   ├─ Expand/collapse button if has children
    |   └─ Render children recursively
    |
    └─ useProducts(filters) hook
        |
        ├─ OnCategorySelect → setCategory(id)
        |
        └─ fetch /api/products?category={id}
            |
            └─ Return filtered products
```

## Database Schema

```sql
-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY,                    -- Printful category ID
    parent_id INT DEFAULT 0,               -- Parent category ID (0 = root)
    title VARCHAR(255) NOT NULL,           -- Category name
    image_url TEXT,                        -- Category image
    catalog_position INT,                  -- Display order
    size VARCHAR(50),                      -- Size indicator
    path VARCHAR(255),                     -- Hierarchical path (e.g., "0/1/6/24")
    level INT DEFAULT 0,                   -- Depth in hierarchy
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    KEY idx_parent_id (parent_id),
    KEY idx_path (path)
);

-- Product table (updated)
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    -- ... existing fields ...
    category_id INT,                       -- New: References categories.id
    category VARCHAR(255),                 -- Deprecated: Keep for compatibility
    FOREIGN KEY (category_id) REFERENCES categories(id),
    KEY idx_category_id (category_id)
);
```

## API Endpoints

```
GET /api/categories
├─ Returns flat list of all categories
└─ Query: ?hierarchy=true (returns tree), ?parentId=N (returns children)

POST /api/categories
└─ Sync categories data

GET/POST /api/printful/sync-categories
└─ Sync categories from Printful

GET /api/products
├─ Query: ?category=N (filter by category)
├─ Query: ?minPrice, ?maxPrice (price range)
├─ Query: ?search=term (text search)
└─ Query: ?page, ?limit (pagination)
```

## Category Hierarchy Example

```
Men's clothing (1)
├─ All shirts (6)
│  ├─ T-shirts (24)
│  ├─ Long sleeve shirts (26)
│  ├─ 3/4 sleeve shirts (25)
│  ├─ Tank tops (23)
│  ├─ All-over shirts (27)
│  ├─ Polo shirts (108)
│  └─ Embroidered shirts (85)
├─ All hoodies & sweatshirts (7)
│  ├─ Hoodies (28)
│  └─ Sweatshirts (29)
├─ Jackets & vests (95)
├─ All bottoms (106)
│  ├─ Pants (241)
│  ├─ Shorts (58)
│  ├─ Underwear (125)
│  ├─ Sweatpants & joggers (98)
│  └─ Leggings (90)
├─ Knitwear (290)
└─ Swimwear (235)

Women's clothing (2)
├─ All shirts (8)
│  ├─ T-shirts (32)
│  ├─ Tank tops (30)
│  ├─ Crop tops (31)
│  ├─ Long sleeve shirts (34)
│  ├─ 3/4 sleeve shirts (33)
│  ├─ All-over shirts (35)
│  ├─ Embroidered shirts (89)
│  └─ ...
├─ All hoodies & sweatshirts (9)
│  ├─ Hoodies (36)
│  └─ Sweatshirts (37)
├─ All Bottoms (107)
│  ├─ Pants (240)
│  ├─ Shorts (51)
│  ├─ Leggings (10)
│  ├─ Skirts (60)
│  ├─ Sweatpants & joggers (99)
│  └─ ...
├─ Dresses (11)
├─ Jackets & vests (96)
├─ Knitwear (289)
├─ Sleepwear (299)
├─ Swimwear (79)
├─ Sports bras (86)
└─ ...

Accessories (4)
├─ Bags (16)
│  ├─ Tote bags (48)
│  ├─ Drawstring bags (49)
│  ├─ Backpacks (81)
│  ├─ Fanny packs (101)
│  ├─ Duffle bags (129)
│  ├─ Handbags (270)
│  └─ ...
├─ Hats (93) [linked to parent 93]
│  ├─ Trucker hats (40)
│  ├─ Snapbacks (41)
│  ├─ Dad hats (42)
│  ├─ 5-panel hats (43)
│  ├─ Mesh hats (44)
│  ├─ Beanies (45)
│  ├─ Bucket hats (46)
│  └─ Visors (47)
├─ Face masks (126)
├─ Tech accessories (243)
│  ├─ Phone cases (244)
│  ├─ Earphone cases (245)
│  ├─ Laptop cases (250)
│  └─ Mouse pads (251)
├─ Patches (215)
├─ Pins (268)
├─ Hair accessories (217)
├─ Footwear (205)
│  ├─ Flip flops (206)
│  ├─ Shoes (220)
│  └─ Socks (221)
└─ Sports accessories (271)

... and more parent categories
```

## Request/Response Examples

### Sync Categories
**Request:**
```bash
POST /api/printful/sync-categories
Content-Type: application/json

{
  "categories": [
    {
      "id": 1,
      "parent_id": 0,
      "title": "Men's clothing",
      "image_url": "https://...",
      "catalog_position": 1,
      "size": "small"
    },
    {
      "id": 6,
      "parent_id": 1,
      "title": "All shirts",
      "image_url": "https://...",
      "catalog_position": 1,
      "size": "small"
    }
    // ... 304 more categories
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 306 categories",
  "count": 306
}
```

### Get Categories (Hierarchical)
**Request:**
```bash
GET /api/categories?hierarchy=true
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "parent_id": 0,
      "title": "Men's clothing",
      "image_url": "https://...",
      "level": 0,
      "children": [
        {
          "id": 6,
          "parent_id": 1,
          "title": "All shirts",
          "level": 1,
          "children": [
            {
              "id": 24,
              "parent_id": 6,
              "title": "T-shirts",
              "level": 2,
              "children": []
            },
            // ... more children
          ]
        },
        // ... more children
      ]
    }
    // ... more root categories
  ]
}
```

### Filter Products by Category
**Request:**
```bash
GET /api/products?category=6&page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "printful_123456",
      "name": "Classic T-shirt",
      "category_id": 6,
      "price": 19.99,
      "image_url": "https://...",
      // ... more fields
    }
    // ... more products
  ],
  "pagination": {
    "page": 1,
    "totalPages": 10,
    "totalCount": 120
  }
}
```

## Performance Notes

- **Category tree caching**: Frontend caches the full hierarchy after first load
- **Path-based queries**: Use the `path` field for efficient sub-tree queries
- **Index strategy**: `parent_id` and `path` indexes for fast lookups
- **Pagination**: Product filtering includes pagination (default 12 per page)

## Error Handling

```
Errors returned in format:
{
  "success": false,
  "error": "Error message here"
}

Common errors:
- 400: Invalid request parameters
- 500: Database or server error
```
