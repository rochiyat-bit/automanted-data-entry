import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'
import { AIExtractionResult, DocumentType } from '@/types'

/**
 * AI service type
 */
type AIService = 'openai' | 'anthropic'

/**
 * Get active AI service
 */
function getAIService(): AIService {
  if (config.ai.openaiApiKey) return 'openai'
  if (config.ai.anthropicApiKey) return 'anthropic'
  throw new Error('No AI service configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY')
}

/**
 * Document extraction prompts
 */
const EXTRACTION_PROMPTS = {
  invoice: `Extract the following information from this invoice text and return as JSON:
- invoiceNumber: string
- vendorName: string
- date: ISO date string
- totalAmount: number
- currency: string (3-letter code)
- items: array of {description: string, quantity: number, unitPrice: number, amount: number}

Return ONLY valid JSON with these exact fields. If a field is not found, use null.`,

  receipt: `Extract the following information from this receipt text and return as JSON:
- merchantName: string
- date: ISO date string
- totalAmount: number
- taxAmount: number
- items: array of {name: string, quantity: number, price: number}

Return ONLY valid JSON with these exact fields. If a field is not found, use null.`,

  id_card: `Extract the following information from this ID card text and return as JSON:
- fullName: string
- idNumber: string
- dateOfBirth: ISO date string
- address: string

Return ONLY valid JSON with these exact fields. If a field is not found, use null.`,

  business_card: `Extract the following information from this business card text and return as JSON:
- name: string
- company: string
- email: string
- phone: string
- address: string
- website: string (optional)

Return ONLY valid JSON with these exact fields. If a field is not found, use null.`,
}

/**
 * Extract structured data using OpenAI
 */
async function extractWithOpenAI(
  text: string,
  documentType: DocumentType
): Promise<AIExtractionResult> {
  const openai = new OpenAI({ apiKey: config.ai.openaiApiKey })

  const prompt = EXTRACTION_PROMPTS[documentType]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a document data extraction assistant. Extract structured data from documents and return valid JSON only.',
      },
      {
        role: 'user',
        content: `${prompt}\n\nDocument text:\n${text}`,
      },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  const extractedData = JSON.parse(content)

  return {
    documentType,
    extractedData,
    confidence: 0.85, // OpenAI doesn't provide confidence scores
    rawText: text,
  }
}

/**
 * Extract structured data using Anthropic Claude
 */
async function extractWithAnthropic(
  text: string,
  documentType: DocumentType
): Promise<AIExtractionResult> {
  const anthropic = new Anthropic({ apiKey: config.ai.anthropicApiKey })

  const prompt = EXTRACTION_PROMPTS[documentType]

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nDocument text:\n${text}`,
      },
    ],
    temperature: 0.1,
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response')
  }

  const extractedData = JSON.parse(jsonMatch[0])

  return {
    documentType,
    extractedData,
    confidence: 0.85,
    rawText: text,
  }
}

/**
 * Detect document type from text
 */
export function detectDocumentType(text: string): DocumentType {
  const lowerText = text.toLowerCase()

  // Invoice detection
  if (
    (lowerText.includes('invoice') || lowerText.includes('bill')) &&
    (lowerText.includes('total') || lowerText.includes('amount'))
  ) {
    return DocumentType.INVOICE
  }

  // Receipt detection
  if (
    (lowerText.includes('receipt') || lowerText.includes('merchant')) &&
    lowerText.includes('total')
  ) {
    return DocumentType.RECEIPT
  }

  // ID Card detection
  if (
    (lowerText.includes('identification') ||
      lowerText.includes('id card') ||
      lowerText.includes('driver') ||
      lowerText.includes('passport')) &&
    (lowerText.includes('date of birth') || lowerText.includes('dob'))
  ) {
    return DocumentType.ID_CARD
  }

  // Business Card detection
  if (
    (lowerText.includes('@') || lowerText.includes('email')) &&
    (lowerText.includes('phone') || /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text))
  ) {
    return DocumentType.BUSINESS_CARD
  }

  // Default to invoice if uncertain
  return DocumentType.INVOICE
}

/**
 * Extract structured data from OCR text using AI
 */
export async function extractStructuredData(
  text: string,
  documentType?: DocumentType
): Promise<AIExtractionResult> {
  try {
    // Auto-detect document type if not provided
    const detectedType = documentType || detectDocumentType(text)

    const aiService = getAIService()

    if (aiService === 'openai') {
      return await extractWithOpenAI(text, detectedType)
    } else {
      return await extractWithAnthropic(text, detectedType)
    }
  } catch (error) {
    console.error('AI extraction error:', error)
    throw new Error('Failed to extract structured data from document')
  }
}

export default {
  extractStructuredData,
  detectDocumentType,
}
