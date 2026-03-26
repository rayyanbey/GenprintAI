#!/usr/bin/env node

/**
 * Resync products from Printful with proper category mapping
 * Fixes category filtering issue by using intelligent category assignment
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

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

const BASE_URL = 'http://localhost:3000';

async function resyncProducts(limit = 50) {
  console.log('\n🔄 Resyncing products with proper category mapping...\n');
  
  try {
    // Call the sync endpoint with proper auth header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-sync-key',
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/admin/sync-products?limit=${limit}`,
      {},
      { headers }
    );
    
    if (response.data.success) {
      console.log('✅ Sync completed successfully!\n');
      console.log(`📊 Statistics:`);
      console.log(`   - Products synced: ${response.data.synced}`);
      console.log(`   - Product variants: ${response.data.variants}`);
      console.log('\n💡 Category mapping has been applied intelligently.');
      console.log('   Products are now properly categorized for filtering.\n');
      console.log('🧪 Test the category filter on the frontend:\n');
      console.log('   1. Visit http://localhost:3000/products');
      console.log('   2. Click on a category in the sidebar');
      console.log('   3. Products should now appear with proper filtering\n');
      return true;
    } else {
      console.error('❌ Sync failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during resync:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    return false;
  }
}

// Run with default limit of 50 products
resyncProducts(50).then(success => {
  process.exit(success ? 0 : 1);
});
