import { Sequelize } from 'sequelize'
import { config } from '../config'

/**
 * Sequelize instance for database connection
 */
let sequelize: Sequelize | null = null

/**
 * Get or create Sequelize instance (singleton pattern)
 */
export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize(config.database.url, {
      dialect: 'postgres',
      logging: config.app.isDevelopment ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    })
  }
  return sequelize
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getSequelize()
    await db.authenticate()
    console.log('✅ Database connection established successfully')
    return true
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    return false
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (sequelize) {
    await sequelize.close()
    sequelize = null
    console.log('Database connection closed')
  }
}

/**
 * Sync all models with database (development only)
 */
export async function syncDatabase(options?: { force?: boolean; alter?: boolean }): Promise<void> {
  const db = getSequelize()
  await db.sync(options)
  console.log('✅ Database synchronized')
}

export default getSequelize
