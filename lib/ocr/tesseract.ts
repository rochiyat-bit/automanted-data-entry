import Tesseract, { createWorker } from 'tesseract.js'
import { config } from '../config'
import { OCRResult } from '@/types'

/**
 * Tesseract OCR worker pool for better performance
 */
class TesseractPool {
  private workers: Tesseract.Worker[] = []
  private readonly poolSize = 2
  private readonly language = config.ocr.tesseractLang

  async initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = await createWorker(this.language)
      this.workers.push(worker)
    }
    console.log(`✅ Tesseract pool initialized with ${this.poolSize} workers`)
  }

  async getWorker(): Promise<Tesseract.Worker> {
    if (this.workers.length === 0) {
      await this.initialize()
    }
    // Simple round-robin
    const worker = this.workers.shift()!
    this.workers.push(worker)
    return worker
  }

  async terminate() {
    await Promise.all(this.workers.map(w => w.terminate()))
    this.workers = []
  }
}

const tesseractPool = new TesseractPool()

/**
 * Extract text from image using Tesseract.js
 */
export async function extractTextFromImage(imagePath: string): Promise<OCRResult> {
  try {
    const worker = await tesseractPool.getWorker()

    const {
      data: { text, confidence },
    } = await worker.recognize(imagePath)

    return {
      text: text.trim(),
      confidence: confidence / 100, // Convert to 0-1 scale
      language: config.ocr.tesseractLang,
    }
  } catch (error) {
    console.error('Tesseract OCR error:', error)
    throw new Error('Failed to extract text from image')
  }
}

/**
 * Extract text from PDF (convert pages to images first)
 */
export async function extractTextFromPDF(pdfPath: string): Promise<OCRResult> {
  // For PDF processing, we'll need to convert PDF pages to images
  // This is a placeholder - actual implementation would use pdf-parse or similar
  // For now, we'll return a basic structure
  try {
    const pdfParse = await import('pdf-parse')
    const fs = await import('fs')
    const dataBuffer = fs.readFileSync(pdfPath)

    const data = await pdfParse.default(dataBuffer)

    return {
      text: data.text.trim(),
      confidence: 0.9, // PDF text extraction is usually reliable
      language: config.ocr.tesseractLang,
    }
  } catch (error) {
    console.error('PDF OCR error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Extract text from document (auto-detect type)
 */
export async function extractTextFromDocument(filePath: string, fileType: string): Promise<OCRResult> {
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(filePath)
  } else if (fileType.startsWith('image/')) {
    return extractTextFromImage(filePath)
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export default {
  extractTextFromImage,
  extractTextFromPDF,
  extractTextFromDocument,
}
