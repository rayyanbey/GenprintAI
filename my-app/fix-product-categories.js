#!/usr/bin/env node

/**
 * Fix category IDs for all existing products
 * Maps products to the actual root categories that exist in the database
 */

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

// Import database
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL || './printful.db',
  logging: false,
});

/**
 * Map products to ROOT categories that actually exist in the database
 * Database categories: 1=Men's, 2=Women's, 3=Kids', 93=Hats, 4=Accessories, 5=Home&Living
 */
function getProductCategoryId(product) {
  const name = (product.name || product.title || '').toLowerCase();
  const type = (product.type_name || '').toLowerCase();
  const model = (product.model || '').toLowerCase();
  
  // Hats (category 93)
  if (name.includes('hat') || name.includes('cap') || name.includes('beanie') || name.includes('visor')) {
    return 93; // Hats
  }
  
  // Accessories (category 4)
  if (name.includes('bag') || name.includes('tote') || name.includes('backpack') || 
      name.includes('handbag') || name.includes('fanny pack') || name.includes('waist bag') ||
      name.includes('duffle') || name.includes('drawstring') || name.includes('patch') ||
      name.includes('mask') || name.includes('pin') || name.includes('hair') ||
      name.includes('phone case') || name.includes('earphone') || name.includes('airpod') ||
      name.includes('laptop case') || name.includes('mouse pad') || name.includes('scarf') ||
      name.includes('glove') || name.includes('belt') || name.includes('watch')) {
    return 4; // Accessories
  }
  
  // Home & Living (category 5)
  if (name.includes('poster') || name.includes('print') || name.includes('canvas') ||
      name.includes('framed') || name.includes('mug') || name.includes('cup') ||
      name.includes('tumbler') || name.includes('thermos') || name.includes('water bottle') ||
      name.includes('coaster') || name.includes('towel') || name.includes('blanket') ||
      name.includes('pillow') || name.includes('apron') || name.includes('sticker') ||
      name.includes('notebook') || name.includes('postcard') || name.includes('flag') ||
      name.includes('tapestry') || name.includes('cushion')) {
    return 5; // Home & living
  }
  
  // Men's clothing (category 1)
  if (name.includes('men') || type.includes("men's") || model.includes("men's") ||
      name.includes('shirt') || name.includes('t-shirt') || name.includes('hoodie') ||
      name.includes('sweatshirt') || name.includes('tank') || name.includes('pants') ||
      name.includes('shorts') || name.includes('jacket') || name.includes('vest') ||
      name.includes('sweatpants') || name.includes('joggers') || name.includes('leggings')) {
    return 1; // Men's clothing
  }
  
  // Women's clothing (category 2)
  if (name.includes('women') || type.includes("women's") || model.includes("women's") ||
      name.includes('dress') || name.includes('crop top') || name.includes('sports bra') ||
      name.includes('skirt') || name.includes('swimwear') || name.includes('swim')) {
    return 2; // Women's clothing
  }
  
  // Kids' & youth clothing (category 3)
  if (name.includes('kids') || name.includes('youth') || name.includes('children') ||
      type.includes("kids") || model.includes("kids")) {
    return 3; // Kids' & youth clothing
  }
  
  // Default to Men's clothing if nothing matches
  return 1;
}

async function fixCategories() {
  console.log('\n🔧 Fixing product category IDs...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Define Product model
    const Product = sequelize.define('Product', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      printful_id: DataTypes.INTEGER,
      type_name: DataTypes.STRING,
      model: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      is_discontinued: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    }, {
      tableName: 'Products',
      timestamps: false,
    });
    
    // Fetch all products
    const products = await Product.findAll({
      where: { is_discontinued: false },
      raw: true,
    });
    
    console.log(`📦 Found ${products.length} products to update\n`);
    
    let updated = 0;
    let categoryStats = {
      1: 0, // Men's
      2: 0, // Women's
      3: 0, // Kids'
      4: 0, // Accessories
      5: 0, // Home & Living
      93: 0, // Hats
    };
    
    // Update each product
    for (const product of products) {
      const newCategoryId = getProductCategoryId(product);
      
      if (newCategoryId !== product.category_id) {
        await Product.update(
          { category_id: newCategoryId },
          { where: { id: product.id } }
        );
        
        console.log(`✏️  ${product.name}`);
        console.log(`   Old: ${product.category_id} → New: ${newCategoryId}`);
        
        updated++;
        categoryStats[newCategoryId]++;
      }
    }
    
    console.log(`\n✅ Updated ${updated} products\n`);
    
    console.log('📊 Category Distribution:');
    const categoryNames = {
      1: "Men's clothing",
      2: "Women's clothing",
      3: "Kids' & youth",
      4: 'Accessories',
      5: 'Home & Living',
      93: 'Hats',
    };
    
    Object.entries(categoryStats).forEach(([id, count]) => {
      if (count > 0) {
        console.log(`   ${categoryNames[id]} (${id}): ${count} products`);
      }
    });
    
    console.log('\n✅ Category fix complete!');
    console.log('💡 Filtering should now work correctly.\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing categories:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixCategories();
