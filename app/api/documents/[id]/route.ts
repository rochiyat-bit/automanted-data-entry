import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import {
  DocumentModel,
  InvoiceModel,
  ReceiptModel,
  IDCardModel,
  BusinessCardModel,
} from '@/lib/db/models'
import { UserRole } from '@/types'
import { unlink } from 'fs/promises'

/**
 * GET /api/documents/[id] - Get document details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const document = await DocumentModel.findByPk(params.id, {
      include: [
        { model: InvoiceModel, as: 'invoice' },
        { model: ReceiptModel, as: 'receipt' },
        { model: IDCardModel, as: 'idCard' },
        { model: BusinessCardModel, as: 'businessCard' },
      ],
    })

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    // Check access permissions
    if (
      document.userId !== session.user.id &&
      !hasRole(session.user.role, UserRole.ADMIN)
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch document',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/documents/[id] - Update document
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const document = await DocumentModel.findByPk(params.id)

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    // Check access permissions
    if (
      document.userId !== session.user.id &&
      !hasRole(session.user.role, UserRole.OPERATOR)
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update document
    await document.update(body)

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document updated successfully',
    })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update document',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/documents/[id] - Delete document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const document = await DocumentModel.findByPk(params.id)

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    // Check access permissions
    if (
      document.userId !== session.user.id &&
      !hasRole(session.user.role, UserRole.ADMIN)
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Delete file from disk
    try {
      await unlink(document.filePath)
    } catch (error) {
      console.error('Failed to delete file:', error)
    }

    // Delete document record
    await document.destroy()

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete document',
      },
      { status: 500 }
    )
  }
}
