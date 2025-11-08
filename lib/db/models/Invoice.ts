import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import DocumentModel from './Document'

interface InvoiceAttributes {
  id: string
  documentId: string
  invoiceNumber: string
  vendorName: string
  date: Date
  totalAmount: number
  currency: string
  itemsJson?: string
  extractedAt: Date
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

interface InvoiceCreationAttributes
  extends Optional<InvoiceAttributes, 'id' | 'extractedAt' | 'verifiedBy' | 'verifiedAt' | 'itemsJson'> {}

export class InvoiceModel
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  declare id: string
  declare documentId: string
  declare invoiceNumber: string
  declare vendorName: string
  declare date: Date
  declare totalAmount: number
  declare currency: string
  declare itemsJson?: string
  declare extractedAt: Date
  declare confidenceScore: number
  declare verifiedBy?: string
  declare verifiedAt?: Date
}

const sequelize = getSequelize()

InvoiceModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'documents',
        key: 'id',
      },
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    itemsJson: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    extractedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    confidenceScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'invoices',
    timestamps: false,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['invoiceNumber'],
      },
      {
        fields: ['vendorName'],
      },
    ],
  }
)

// Define associations
InvoiceModel.belongsTo(DocumentModel, {
  foreignKey: 'documentId',
  as: 'document',
})

DocumentModel.hasOne(InvoiceModel, {
  foreignKey: 'documentId',
  as: 'invoice',
})

export default InvoiceModel
