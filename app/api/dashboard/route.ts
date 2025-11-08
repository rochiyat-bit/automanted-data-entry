import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import {
  DocumentModel,
  InvoiceModel,
  ReceiptModel,
  IDCardModel,
  BusinessCardModel,
  AuditLogModel,
} from '@/lib/db/models'
import { DocumentStatus, DocumentType, UserRole } from '@/types'
import { Op } from 'sequelize'

/**
 * GET /api/dashboard - Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Build query based on user role
    const where: any = {}
    if (!hasRole(session.user.role, UserRole.ADMIN)) {
      where.userId = session.user.id
    }

    // Total documents
    const totalDocuments = await DocumentModel.count({ where })

    // Documents by status
    const processedDocuments = await DocumentModel.count({
      where: { ...where, status: DocumentStatus.PROCESSED },
    })

    const pendingDocuments = await DocumentModel.count({
      where: {
        ...where,
        status: {
          [Op.in]: [DocumentStatus.UPLOADED, DocumentStatus.PROCESSING],
        },
      },
    })

    const failedDocuments = await DocumentModel.count({
      where: { ...where, status: DocumentStatus.FAILED },
    })

    // Success rate
    const successRate = totalDocuments > 0 ? (processedDocuments / totalDocuments) * 100 : 0

    // Documents by type
    const documentsByType = {
      [DocumentType.INVOICE]: await InvoiceModel.count({
        include: [
          {
            model: DocumentModel,
            as: 'document',
            where,
            attributes: [],
          },
        ],
      }),
      [DocumentType.RECEIPT]: await ReceiptModel.count({
        include: [
          {
            model: DocumentModel,
            as: 'document',
            where,
            attributes: [],
          },
        ],
      }),
      [DocumentType.ID_CARD]: await IDCardModel.count({
        include: [
          {
            model: DocumentModel,
            as: 'document',
            where,
            attributes: [],
          },
        ],
      }),
      [DocumentType.BUSINESS_CARD]: await BusinessCardModel.count({
        include: [
          {
            model: DocumentModel,
            as: 'document',
            where,
            attributes: [],
          },
        ],
      }),
    }

    // Recent activity (last 10 audit logs)
    const recentActivity = await AuditLogModel.findAll({
      where: hasRole(session.user.role, UserRole.ADMIN) ? {} : { userId: session.user.id },
      limit: 10,
      order: [['timestamp', 'DESC']],
    })

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments,
        processedDocuments,
        pendingDocuments,
        failedDocuments,
        successRate: Math.round(successRate * 10) / 10,
        documentsByType,
        recentActivity,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
      },
      { status: 500 }
    )
  }
}
