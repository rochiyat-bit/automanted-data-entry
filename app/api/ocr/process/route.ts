import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { DocumentModel } from '@/lib/db/models'
import { processDocument } from '@/lib/processing/document-processor'

/**
 * POST /api/ocr/process - Trigger OCR processing for a document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Verify document exists
    const document = await DocumentModel.findByPk(documentId)
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    // Trigger processing (this could be a queue job in production)
    await processDocument(documentId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Document processing completed',
      data: { documentId },
    })
  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process document',
      },
      { status: 500 }
    )
  }
}
