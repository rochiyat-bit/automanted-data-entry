/**
 * Application configuration with environment variable validation
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('automated_data_entry'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // OCR
  GOOGLE_VISION_API_KEY: z.string().optional(),
  TESSERACT_LANG: z.string().default('eng'),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_DIR: z.string().default('./public/uploads'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),

  // App Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // Rate Limiting
  RATE_LIMIT_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('15'),

  // Security
  BCRYPT_ROUNDS: z.string().default('10'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation error:')
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    // Return defaults for development
    return envSchema.parse({})
  }
}

const env = validateEnv()

export const config = {
  database: {
    url:
      env.DATABASE_URL ||
      `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  auth: {
    secret: env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
    url: env.NEXTAUTH_URL || `http://localhost:${env.PORT}`,
  },
  ocr: {
    googleVisionApiKey: env.GOOGLE_VISION_API_KEY,
    tesseractLang: env.TESSERACT_LANG,
  },
  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    anthropicApiKey: env.ANTHROPIC_API_KEY,
  },
  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE),
    uploadDir: env.UPLOAD_DIR,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  app: {
    env: env.NODE_ENV,
    port: parseInt(env.PORT),
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  rateLimit: {
    requests: parseInt(env.RATE_LIMIT_REQUESTS),
    window: parseInt(env.RATE_LIMIT_WINDOW),
  },
  security: {
    bcryptRounds: parseInt(env.BCRYPT_ROUNDS),
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const

export type Config = typeof config
