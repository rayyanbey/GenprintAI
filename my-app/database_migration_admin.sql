-- Migration to add admin dashboard fields to users and designs

-- Add role and status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- By default, make the first user an admin (or you can set manually)
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- Add approval_status and is_community to designs
-- PostgreSQL ENUM creation workaround string instead of strict ENUM to avoid migration issues
ALTER TABLE designs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE designs ADD COLUMN IF NOT EXISTS is_community BOOLEAN DEFAULT false;
