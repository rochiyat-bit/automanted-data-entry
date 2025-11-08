/**
 * Export all models and associations
 */

import UserModel from './User'
import DocumentModel from './Document'
import InvoiceModel from './Invoice'
import ReceiptModel from './Receipt'
import IDCardModel from './IDCard'
import BusinessCardModel from './BusinessCard'
import AuditLogModel from './AuditLog'

// Export all models
export {
  UserModel,
  DocumentModel,
  InvoiceModel,
  ReceiptModel,
  IDCardModel,
  BusinessCardModel,
  AuditLogModel,
}

// Export all models as a collection
export const models = {
  User: UserModel,
  Document: DocumentModel,
  Invoice: InvoiceModel,
  Receipt: ReceiptModel,
  IDCard: IDCardModel,
  BusinessCard: BusinessCardModel,
  AuditLog: AuditLogModel,
}

export default models
