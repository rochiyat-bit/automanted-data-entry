import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { InvoiceModel, DocumentModel } from '@/lib/db/models'

/**
 * GET /api/invoices - List invoices with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const { count, rows: invoices } = await InvoiceModel.findAndCountAll({
      limit,
      offset,
      order: [['date', 'DESC']],
      include: [
        {
          model: DocumentModel,
          as: 'document',
          attributes: ['id', 'filename', 'filePath', 'uploadedAt'],
        },
      ],
    })

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error('List invoices error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invoices',
      },
      { status: 500 }
    )
  }
}
