/**
 * Repopulate database from Printful APIs
 * Syncs categories and products
 */
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !key.startsWith('#')) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const PRINTFUL_API = 'https://api.printful.com';
const PRINTFUL_KEY = process.env.PRINTFUL;

// Hardcoded Printful categories (from Printful catalog)
const PRINTFUL_CATEGORIES = [
  { id: 1, parent_id: 0, title: "Men's clothing", catalog_position: 1, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/fb/fbf0cf796a5603666e85713ece1708a1_t?v=1764596927" },
  { id: 2, parent_id: 0, title: "Women's clothing", catalog_position: 2, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/04/04140d7cd1565012645092fc8f1d8632_t?v=1764596927" },
  { id: 3, parent_id: 0, title: "Kids' & youth clothing", catalog_position: 3, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/96/96e91feb26f0b28ba821534bb0d5478b_t?v=1764596927" },
  { id: 4, parent_id: 0, title: "Accessories", catalog_position: 5, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/b1/b1e86be07423274b27b55561ddc6eee9_t?v=1764596927" },
  { id: 5, parent_id: 0, title: "Home & living", catalog_position: 6, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/77/7776d01e716d80e3ffbdebbf3db6b198_t?v=1764596927" },
  { id: 93, parent_id: 0, title: "Hats", catalog_position: 4, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/0c/0c38c3b13be79b5f8e1f2f1dccf62115_t?v=1764596927" },
  { id: 116, parent_id: 0, title: "Collections", catalog_position: 7, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/9e/9ed797fbbdac07a98f6fdfa06a9f6c8f_t?v=1764596928" },
  { id: 159, parent_id: 0, title: "Brands", catalog_position: 7, size: "small", image_url: "https://files.cdn.printful.com/o/upload/catalog_category/0d/0d1c7f7afcc42147f88ee607bcaf9ff6_t?v=1764596928" },
];

async function syncCategories(categoriesData) {
  console.log(`📤 Syncing ${categoriesData.length} categories...`);
  try {
    const response = await axios.post(`${BASE_URL}/api/printful/sync-categories`, {
      categories: categoriesData,
    });
    console.log('✅ Categories synced:', response.data.message);
    return true;
  } catch (error) {
    console.error('Error syncing categories:', error.message);
    return false;
  }
}

async function getProducts(limit = 100, offset = 0) {
  try {
    const response = await axios.get(`${PRINTFUL_API}/products`, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_KEY}`,
      },
      params: { limit, offset },
    });
    return response.data.result || [];
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

async function syncProductsBatch(limit = 50) {
  console.log(`📥 Fetching ${limit} products from Printful...`);
  
  try {
    const products = await getProducts(limit, 0);
    
    if (products.length === 0) {
      console.log('⚠ No products found on Printful');
      return false;
    }

    console.log(`📤 Syncing ${products.length} products...`);
    
    // Use dev sync key for development
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-sync-key',
    };
    
    const response = await axios.post(`${BASE_URL}/api/admin/sync-products?limit=${limit}`, {}, { headers });
    
    if (response.data.success) {
      console.log(`✅ Products synced:`, response.data.message);
      console.log(`   - Synced: ${response.data.synced}`);
      console.log(`   - Variants: ${response.data.variants}`);
      return true;
    } else {
      console.error('Sync failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('Error syncing products:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting Printful sync...\n');

  if (!PRINTFUL_KEY) {
    console.error('❌ PRINTFUL API key not found in .env');
    process.exit(1);
  }

  // Step 1: Sync categories (using hardcoded Printful categories)
  console.log('Step 1️⃣  - Syncing Categories');
  console.log('─'.repeat(50));
  
  await syncCategories(PRINTFUL_CATEGORIES);

  console.log('\n');

  // Step 2: Sync products
  console.log('Step 2️⃣  - Syncing Products');
  console.log('─'.repeat(50));
  const success = await syncProductsBatch(50);

  if (success) {
    console.log('\n✅ Database repopulation complete!');
    console.log('\nYou can now:');
    console.log('  1. Visit http://localhost:3000/products');
    console.log('  2. Check /api/categories for category hierarchy');
    console.log('  3. Browse products by category');
  } else {
    console.log('\n⚠ Some sync operations may have failed');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
