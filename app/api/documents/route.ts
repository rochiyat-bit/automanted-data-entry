import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { DocumentModel, UserModel } from '@/lib/db/models'
import { hasRole } from '@/lib/auth'
import { UserRole } from '@/types'

/**
 * GET /api/documents - List documents with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const documentType = searchParams.get('documentType')
    const sortBy = searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'

    // Build query
    const where: any = {}

    // Non-admin users can only see their own documents
    if (!hasRole(session.user.role, UserRole.ADMIN)) {
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    if (documentType) {
      where.documentType = documentType
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Fetch documents
    const { count, rows: documents } = await DocumentModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'email'],
        },
      ],
    })

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error('List documents error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch documents',
      },
      { status: 500 }
    )
  }
}
