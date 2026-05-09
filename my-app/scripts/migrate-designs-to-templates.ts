/**
 * Migration script to convert existing community-shared designs to templates
 * Run this ONCE to populate the templates table with existing shared designs
 * 
 * Usage: node scripts/migrate-designs-to-templates.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const pg = require('pg');

async function migrateDesignsToTemplates() {
  let sequelize = null;
  try {
    console.log('🔄 Starting migration: Converting shared community designs to templates...\n');

    const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
    if (!dbUrl) throw new Error('No DB URL found. Check .env.local or .env');

    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Use raw queries to find and migrate designs
    const designRows = await sequelize.query(
      'SELECT id, user_id, title, description, artwork_file_url, export_format, tags, metadata, approval_status, created_at FROM designs WHERE is_community = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Found ${designRows.length} community-shared designs\n`);

    if (designRows.length === 0) {
      console.log('✅ No community designs to migrate');
      await sequelize.close();
      process.exit(0);
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const design of designRows) {
      try {
        // Check if template already exists for this design
        const existingRows = await sequelize.query(
          `SELECT id FROM templates WHERE metadata->'design_id' = :designId`,
          {
            replacements: { designId: design.id },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (existingRows.length > 0) {
          console.log(`⏭️  Skipped: ${design.title} (already migrated)`);
          skippedCount++;
          continue;
        }

        // Extract category from tags or default to 'apparel'
        let category = 'apparel';
        if (design.metadata && design.metadata.category) {
          category = design.metadata.category;
        } else if (design.tags && Array.isArray(design.tags)) {
          const validCategories = ['apparel', 'accessories', 'home_living', 'tech', 'gifts'];
          const tagCategory = design.tags.find(tag => 
            validCategories.includes(typeof tag === 'string' ? tag.toLowerCase() : '')
          );
          if (tagCategory) category = tagCategory.toLowerCase();
        }

        // Create template from design
        const templateId = uuidv4();
        const metadata = {
          design_id: design.id,
          image_url: design.artwork_file_url,
          export_format: design.export_format || 'png',
          original_created_at: design.created_at,
          canvas_data: design.metadata?.canvas_data || null,
        };

        await sequelize.query(
          `INSERT INTO templates (id, name, description, category, usage_count, is_community, created_by_user_id, approval_status, metadata, created_at, updated_at)
           VALUES (:id, :name, :description, :category, :usage_count, :is_community, :created_by_user_id, :approval_status, :metadata, :created_at, :updated_at)`,
          {
            replacements: {
              id: templateId,
              name: design.title || 'Untitled Design',
              description: design.description || '',
              category,
              usage_count: 0,
              is_community: true,
              created_by_user_id: design.user_id,
              approval_status: design.approval_status || 'pending',
              metadata: JSON.stringify(metadata),
              created_at: design.created_at,
              updated_at: new Date(),
            },
          }
        );

        console.log(`✅ Migrated: "${design.title}" → Template ID: ${templateId}`);
        migratedCount++;
      } catch (error) {
        console.log(`❌ Error migrating ${design.title}: ${error.message}`);
      }
    }

    console.log(`\n📈 Migration complete!`);
    console.log(`   ✅ Migrated: ${migratedCount} designs`);
    console.log(`   ⏭️  Skipped: ${skippedCount} designs`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review templates on /templates page`);
    console.log(`   2. Admin approves pending templates at /admin/templates`);
    console.log(`   3. Approved templates appear in templates browser\n`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    try {
      if (sequelize) await sequelize.close();
    } catch (e) {
      // ignore close errors
    }
    process.exit(1);
  }
}

migrateDesignsToTemplates();
