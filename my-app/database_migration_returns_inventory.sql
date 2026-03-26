-- E-Commerce Final Migration: Orders, Returns, Inventory
-- Run this script to update your PostgreSQL database

-- =====================================================
-- ORDERS TABLE: Add return/refund fields
-- =====================================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- =====================================================
-- PRODUCT_VARIANTS TABLE: Add inventory fields
-- =====================================================
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS stock_level INTEGER;

-- =====================================================
-- RETURN_REQUESTS TABLE: New table for return tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS return_requests (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  reason_details TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  approved_at TIMESTAMP,
  approved_by VARCHAR(255),
  refund_amount DECIMAL(10, 2),
  refund_status VARCHAR(50),
  stripe_refund_id VARCHAR(255),
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for return_requests
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_requested_at ON return_requests(requested_at DESC);

-- =====================================================
-- Create indexes for inventory tracking
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_product_variants_availability ON product_variants(availability);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock_level ON product_variants(stock_level);

-- =====================================================
-- Verify changes
-- =====================================================
SELECT 'Orders table changes:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'admin_notes'
ORDER BY ordinal_position;

SELECT 'Product variants inventory fields:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND column_name IN ('low_stock_threshold', 'stock_level')
ORDER BY ordinal_position;

SELECT 'Return requests table exists:' as info;
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'return_requests') as return_requests_exists;

SELECT 'Migration completed successfully!' as status;
