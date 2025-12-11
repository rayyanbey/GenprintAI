-- E-Commerce Database Migration Script
-- Run this script to add all necessary fields for e-commerce functionality

-- ============================================
-- ORDERS TABLE UPDATES
-- ============================================

-- Add tracking and payment fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS carrier VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP,
ADD COLUMN IF NOT EXISTS printful_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_printful_order_id ON orders(printful_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

-- ============================================
-- CART ITEMS TABLE (OPTIONAL)
-- ============================================

-- Create cart_items table for server-side cart persistence
CREATE TABLE IF NOT EXISTS cart_items (
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

-- Add indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- Verify orders table columns
SELECT 'Orders table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Verify cart_items table exists
SELECT 'Cart items table:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'cart_items';

-- Verify indexes
SELECT 'Orders table indexes:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders';

SELECT 'Migration completed successfully!' as status;
