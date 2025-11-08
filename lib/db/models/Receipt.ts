import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import DocumentModel from './Document'

interface ReceiptAttributes {
  id: string
  documentId: string
  merchantName: string
  date: Date
  totalAmount: number
  taxAmount: number
  itemsJson: string
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

interface ReceiptCreationAttributes
  extends Optional<ReceiptAttributes, 'id' | 'verifiedBy' | 'verifiedAt'> {}

export class ReceiptModel
  extends Model<ReceiptAttributes, ReceiptCreationAttributes>
  implements ReceiptAttributes
{
  declare id: string
  declare documentId: string
  declare merchantName: string
  declare date: Date
  declare totalAmount: number
  declare taxAmount: number
  declare itemsJson: string
  declare confidenceScore: number
  declare verifiedBy?: string
  declare verifiedAt?: Date
}

const sequelize = getSequelize()

ReceiptModel.init(
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
    merchantName: {
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
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    itemsJson: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'receipts',
    timestamps: false,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['merchantName'],
      },
    ],
  }
)

// Define associations
ReceiptModel.belongsTo(DocumentModel, {
  foreignKey: 'documentId',
  as: 'document',
})

DocumentModel.hasOne(ReceiptModel, {
  foreignKey: 'documentId',
  as: 'receipt',
})

export default ReceiptModel
