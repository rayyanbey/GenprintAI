require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');

async function sync() {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) throw new Error('No DB URL');

  const sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    dialectModule: pg,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  });

  // Simple raw queries to alter table without full model definitions (since we just need to add columns)
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';`);
    await sequelize.query(`ALTER TABLE designs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';`);
    await sequelize.query(`ALTER TABLE designs ADD COLUMN IF NOT EXISTS is_community BOOLEAN DEFAULT false;`);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    process.exit(0);
  }
}

sync();
