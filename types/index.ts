/**
 * User roles for RBAC
 */
export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

/**
 * Document processing status
 */
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  VERIFIED = 'verified',
}

/**
 * Document types
 */
export enum DocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  ID_CARD = 'id_card',
  BUSINESS_CARD = 'business_card',
}

/**
 * User entity
 */
export interface User {
  id: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/**
 * Document entity
 */
export interface Document {
  id: string
  userId: string
  filename: string
  filePath: string
  fileType: string
  documentType?: DocumentType
  status: DocumentStatus
  uploadedAt: Date
  processedAt?: Date
}

/**
 * Invoice entity
 */
export interface Invoice {
  id: string
  documentId: string
  invoiceNumber: string
  vendorName: string
  date: Date
  totalAmount: number
  currency: string
  items?: InvoiceItem[]
  extractedAt: Date
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

/**
 * Receipt entity
 */
export interface Receipt {
  id: string
  documentId: string
  merchantName: string
  date: Date
  totalAmount: number
  taxAmount: number
  items: ReceiptItem[]
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

/**
 * Receipt item
 */
export interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

/**
 * ID Card entity
 */
export interface IDCard {
  id: string
  documentId: string
  fullName: string
  idNumber: string
  dateOfBirth: Date
  address: string
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

/**
 * Business Card entity
 */
export interface BusinessCard {
  id: string
  documentId: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  website?: string
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

/**
 * Audit Log entity
 */
export interface AuditLog {
  id: string
  userId: string
  action: string
  tableName: string
  recordId: string
  oldData?: Record<string, any>
  newData?: Record<string, any>
  timestamp: Date
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalDocuments: number
  processedDocuments: number
  pendingDocuments: number
  failedDocuments: number
  successRate: number
  documentsByType: Record<DocumentType, number>
  recentActivity: AuditLog[]
}

/**
 * OCR processing result
 */
export interface OCRResult {
  text: string
  confidence: number
  language: string
}

/**
 * AI extraction result
 */
export interface AIExtractionResult {
  documentType: DocumentType
  extractedData: Record<string, any>
  confidence: number
  rawText: string
}
