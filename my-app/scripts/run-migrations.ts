import { Sequelize } from 'sequelize';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const dbUrl = process.env.DB_URL || 'postgresql://avnadmin:AVNS_u-j6u2rxRfa8Q2GtB-Y@pg-38603677-rayyanasghar9-f141.g.aivencloud.com:21331/genprintai';

  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres' as any,
    dialectModule: pg,
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected!\n');

    // Read and execute migrations
    const migrations = [
      'database_migration_ecommerce.sql',
      'database_migration_order_history.sql',
    ];

    for (const migrationFile of migrations) {
      const filePath = path.join(process.cwd(), migrationFile);
      console.log(`\n📝 Running migration: ${migrationFile}`);
      console.log('━'.repeat(60));

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${migrationFile}`);
        continue;
      }

      const migrationSql = fs.readFileSync(filePath, 'utf-8');
      
      try {
        await sequelize.query(migrationSql, { raw: true });
        console.log(`✅ Migration completed: ${migrationFile}\n`);
      } catch (error: any) {
        console.error(`❌ Migration failed: ${error.message}`);
        // Continue to next migration
      }
    }

    console.log('\n✨ All migrations completed!');
    await sequelize.close();
  } catch (error: any) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

runMigrations().catch(console.error);
