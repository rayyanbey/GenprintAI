-- Migration for Order History Feature
-- Run this script to update your PostgreSQL database

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add new columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS product_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Make design_id nullable if it isn't already
ALTER TABLE orders 
ALTER COLUMN design_id DROP NOT NULL;

-- Update default status to 'confirmed' if needed
ALTER TABLE orders 
ALTER COLUMN status SET DEFAULT 'confirmed';

-- Add default for order_date if not exists
ALTER TABLE orders 
ALTER COLUMN order_date SET DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);

-- Verify the changes
SELECT 'Products table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

SELECT 'Orders table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT 'Migration completed successfully!' as status;
