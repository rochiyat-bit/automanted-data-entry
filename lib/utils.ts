import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const ext = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${sanitizeFilename(nameWithoutExt)}_${timestamp}_${random}.${ext}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}
