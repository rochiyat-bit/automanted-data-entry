#!/usr/bin/env node

/**
 * Database migration script
 * Usage: npm run db:migrate
 */

const { syncDatabase, testConnection, closeConnection } = require('./sequelize')

async function migrate() {
  console.log('🚀 Starting database migration...\n')

  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      console.error('❌ Migration failed: Could not connect to database')
      process.exit(1)
    }

    // Import all models to register associations
    require('./models')

    // Sync database (creates tables if they don't exist)
    console.log('📦 Syncing database schema...')
    await syncDatabase({ alter: true })

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await closeConnection()
  }
}

migrate()
