# CartItem Model Registration Fix

## Issue
The `CartItem` model was created but not being initialized in the database because it wasn't registered in the model initialization files.

## Root Cause
Sequelize models need to be:
1. Imported in the model initialization files
2. Added to the models object
3. Have associations defined (if any)

The CartItem model was missing from all three places.

## Files Modified

### 1. [`src/models/model-init.ts`](file:///e:/Projects/GenprintAI/my-app/src/models/model-init.ts)
- ✅ Added `import CartItemModel from "@/src/models/cart_item.model";`
- ✅ Added `CartItem: CartItemModel(sequelize)` to models object

### 2. [`src/db/associations.ts`](file:///e:/Projects/GenprintAI/my-app/src/db/associations.ts)
- ✅ Added `CartItem` to destructured models
- ✅ Added associations:
  - `User.hasMany(CartItem)` / `CartItem.belongsTo(User)`
  - `Product.hasMany(CartItem)` / `CartItem.belongsTo(Product)`
  - `Design.hasMany(CartItem)` / `CartItem.belongsTo(Design)`

### 3. [`src/db/db.ts`](file:///e:/Projects/GenprintAI/my-app/src/db/db.ts)
- ✅ Added `import CartItemModel from "../models/cart_item.model";`
- ✅ Added `CartItem: CartItemModel(seq)` to models cache

## Result
The `cart_items` table will now be created automatically when the application starts, with the following structure:

```sql
CREATE TABLE cart_items (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  design_id VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  variant JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## Verification
After restarting the dev server, check the database to confirm the `cart_items` table exists:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'cart_items';
```

## Note
The CartItem model is **optional** for the e-commerce implementation. The shopping cart currently uses client-side localStorage. Server-side cart persistence can be implemented later if needed for features like:
- Cart sync across devices
- Abandoned cart recovery
- Cart analytics
