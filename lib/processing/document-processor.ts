import { extractTextFromDocument } from '../ocr/tesseract'
import { extractStructuredData } from '../ai/extract-data'
import {
  DocumentModel,
  InvoiceModel,
  ReceiptModel,
  IDCardModel,
  BusinessCardModel,
  AuditLogModel,
} from '../db/models'
import { DocumentStatus, DocumentType } from '@/types'

/**
 * Process a document: OCR + AI extraction + database save
 */
export async function processDocument(documentId: string, userId: string): Promise<void> {
  try {
    // Get document from database
    const document = await DocumentModel.findByPk(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // Update status to processing
    await document.update({ status: DocumentStatus.PROCESSING })

    // Step 1: OCR - Extract text from document
    console.log(`📄 Processing document: ${document.filename}`)
    const ocrResult = await extractTextFromDocument(document.filePath, document.fileType)

    if (!ocrResult.text || ocrResult.text.length < 10) {
      throw new Error('Failed to extract meaningful text from document')
    }

    console.log(`✅ OCR completed. Confidence: ${ocrResult.confidence}`)

    // Step 2: AI - Extract structured data
    console.log('🤖 Extracting structured data with AI...')
    const aiResult = await extractStructuredData(ocrResult.text)

    console.log(`✅ AI extraction completed. Type: ${aiResult.documentType}`)

    // Step 3: Save extracted data to appropriate table
    await saveExtractedData(documentId, aiResult.documentType, aiResult.extractedData, aiResult.confidence)

    // Update document type and status
    await document.update({
      documentType: aiResult.documentType,
      status: DocumentStatus.PROCESSED,
      processedAt: new Date(),
    })

    // Create audit log
    await AuditLogModel.create({
      userId,
      action: 'PROCESS_DOCUMENT',
      tableName: 'documents',
      recordId: documentId,
      newData: JSON.stringify({
        documentType: aiResult.documentType,
        confidence: aiResult.confidence,
      }),
    })

    console.log(`✅ Document processed successfully: ${document.filename}`)
  } catch (error) {
    console.error('Document processing error:', error)

    // Update status to failed
    await DocumentModel.update(
      { status: DocumentStatus.FAILED },
      { where: { id: documentId } }
    )

    // Log error
    await AuditLogModel.create({
      userId,
      action: 'PROCESS_DOCUMENT_FAILED',
      tableName: 'documents',
      recordId: documentId,
      newData: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    })

    throw error
  }
}

/**
 * Save extracted data to appropriate database table
 */
async function saveExtractedData(
  documentId: string,
  documentType: DocumentType,
  data: any,
  confidence: number
): Promise<void> {
  switch (documentType) {
    case DocumentType.INVOICE:
      await InvoiceModel.create({
        documentId,
        invoiceNumber: data.invoiceNumber || 'N/A',
        vendorName: data.vendorName || 'Unknown',
        date: data.date ? new Date(data.date) : new Date(),
        totalAmount: data.totalAmount || 0,
        currency: data.currency || 'USD',
        itemsJson: data.items ? JSON.stringify(data.items) : null,
        confidenceScore: confidence,
      })
      break

    case DocumentType.RECEIPT:
      await ReceiptModel.create({
        documentId,
        merchantName: data.merchantName || 'Unknown',
        date: data.date ? new Date(data.date) : new Date(),
        totalAmount: data.totalAmount || 0,
        taxAmount: data.taxAmount || 0,
        itemsJson: JSON.stringify(data.items || []),
        confidenceScore: confidence,
      })
      break

    case DocumentType.ID_CARD:
      await IDCardModel.create({
        documentId,
        fullName: data.fullName || 'Unknown',
        idNumber: data.idNumber || 'N/A',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
        address: data.address || 'Unknown',
        confidenceScore: confidence,
      })
      break

    case DocumentType.BUSINESS_CARD:
      await BusinessCardModel.create({
        documentId,
        name: data.name || 'Unknown',
        company: data.company || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        website: data.website,
        confidenceScore: confidence,
      })
      break

    default:
      throw new Error(`Unsupported document type: ${documentType}`)
  }
}

/**
 * Batch process multiple documents
 */
export async function batchProcessDocuments(documentIds: string[], userId: string): Promise<void> {
  for (const documentId of documentIds) {
    try {
      await processDocument(documentId, userId)
    } catch (error) {
      console.error(`Failed to process document ${documentId}:`, error)
      // Continue with next document
    }
  }
}

export default {
  processDocument,
  batchProcessDocuments,
}
