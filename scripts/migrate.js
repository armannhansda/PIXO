/**
 * Database Migration Script (Node.js version)
 * Executes SQL migrations without requiring interactive input
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Create Postgres client
    const postgres = require('postgres');
    
    // Use individual env vars for local development
    const sql = postgres({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'blogplatform',
      ssl: process.env.DB_SSL === 'true',
      prepare: false,
      onnotice: () => {} // Suppress notices
    });

    const migrationsDir = path.join(__dirname, '..', 'src', 'lib', 'db', 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('✅ No migrations to run');
      await sql.end();
      process.exit(0);
    }

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

      console.log(`📝 Running migration: ${file}`);
      
      // Split by statement-breakpoint and execute each statement
      const statements = migrationSql
        .split('--> statement-breakpoint')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
          console.log(`   ✓ Statement executed`);
        } catch (error) {
          // Log errors but continue if it's just about existing objects
          if (error.message?.includes('already exists') || error.code === '42P07') {
            console.log(`   ⚠️  Object already exists, skipping`);
          } else {
            console.error(`   ✗ Error:`, error.message);
            throw error;
          }
        }
      }
    }

    await sql.end();
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message || error);
    process.exit(1);
  }
}

migrate();
