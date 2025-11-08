import { z } from 'zod'
import { DocumentType, UserRole } from '@/types'

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  file: z.any(),
  documentType: z.nativeEnum(DocumentType).optional(),
})

/**
 * Document update schema
 */
export const documentUpdateSchema = z.object({
  status: z.string().optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
})

/**
 * Invoice schema
 */
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  vendorName: z.string().min(1),
  date: z.string().datetime().or(z.date()),
  totalAmount: z.number().positive(),
  currency: z.string().length(3),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        amount: z.number().positive(),
      })
    )
    .optional(),
})

/**
 * Receipt schema
 */
export const receiptSchema = z.object({
  merchantName: z.string().min(1),
  date: z.string().datetime().or(z.date()),
  totalAmount: z.number().positive(),
  taxAmount: z.number().nonnegative(),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
})

/**
 * ID Card schema
 */
export const idCardSchema = z.object({
  fullName: z.string().min(1),
  idNumber: z.string().min(1),
  dateOfBirth: z.string().datetime().or(z.date()),
  address: z.string().min(1),
})

/**
 * Business Card schema
 */
export const businessCardSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  website: z.string().url().optional(),
})

/**
 * User creation schema
 */
export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).optional(),
})

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * Query pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export default {
  fileUploadSchema,
  documentUpdateSchema,
  invoiceSchema,
  receiptSchema,
  idCardSchema,
  businessCardSchema,
  userCreateSchema,
  loginSchema,
  paginationSchema,
}
