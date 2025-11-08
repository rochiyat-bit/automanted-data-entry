#!/usr/bin/env node

/**
 * Database seeding script
 * Usage: npm run db:seed
 */

const bcrypt = require('bcryptjs')
const { getSequelize, testConnection, closeConnection } = require('./sequelize')

async function seed() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Test connection
    const connected = await testConnection()
    if (!connected) {
      console.error('❌ Seeding failed: Could not connect to database')
      process.exit(1)
    }

    // Import models
    const { UserModel } = require('./models')

    // Create admin user
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await UserModel.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        email: 'admin@example.com',
        passwordHash: adminPassword,
        role: 'admin',
      },
    })

    if (admin[1]) {
      console.log('✅ Admin user created: admin@example.com / admin123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Create operator user
    console.log('👤 Creating operator user...')
    const operatorPassword = await bcrypt.hash('operator123', 10)
    const operator = await UserModel.findOrCreate({
      where: { email: 'operator@example.com' },
      defaults: {
        email: 'operator@example.com',
        passwordHash: operatorPassword,
        role: 'operator',
      },
    })

    if (operator[1]) {
      console.log('✅ Operator user created: operator@example.com / operator123')
    } else {
      console.log('ℹ️  Operator user already exists')
    }

    // Create viewer user
    console.log('👤 Creating viewer user...')
    const viewerPassword = await bcrypt.hash('viewer123', 10)
    const viewer = await UserModel.findOrCreate({
      where: { email: 'viewer@example.com' },
      defaults: {
        email: 'viewer@example.com',
        passwordHash: viewerPassword,
        role: 'viewer',
      },
    })

    if (viewer[1]) {
      console.log('✅ Viewer user created: viewer@example.com / viewer123')
    } else {
      console.log('ℹ️  Viewer user already exists')
    }

    console.log('\n✅ Seeding completed successfully!')
    console.log('\n📝 Test Credentials:')
    console.log('   Admin:    admin@example.com / admin123')
    console.log('   Operator: operator@example.com / operator123')
    console.log('   Viewer:   viewer@example.com / viewer123')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await closeConnection()
  }
}

seed()
