import * as fs from 'fs';
import * as path from 'path';
import { sql } from './index.js';

async function migrate() {
  try {
    console.log('🚀 Starting database migration...\n');

    const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('✅ No migrations to run');
      process.exit(0);
    }

    const sqlClient = sql();

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
          await sqlClient.unsafe(statement);
          console.log(`   ✓ Statement executed`);
        } catch (error: any) {
          // Ignore errors if table already exists
          if (error.message?.includes('already exists')) {
            console.log(`   ⚠️  Table already exists, skipping`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
