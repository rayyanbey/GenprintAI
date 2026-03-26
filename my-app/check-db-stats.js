const { getModels } = require('./lib/db-dynamic');

async function checkStats() {
  try {
    const models = await getModels();
    const products = await models.Product.count();
    const productsWithCategory = await models.Product.count({ 
      where: { category_id: { [models.Sequelize.Op.ne]: null } } 
    });
    const categories = await models.Category.count();
    const variants = await models.ProductVariant.count();
    
    console.log('📊 Database Stats:');
    console.log('Total Products:', products);
    console.log('Products with category_id:', productsWithCategory);
    console.log('Products without category_id (NULL):', products - productsWithCategory);
    console.log('Total Categories:', categories);
    console.log('Total ProductVariants:', variants);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStats();
