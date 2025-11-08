import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import { DocumentStatus, DocumentType } from '@/types'
import UserModel from './User'

interface DocumentAttributes {
  id: string
  userId: string
  filename: string
  filePath: string
  fileType: string
  documentType?: DocumentType
  status: DocumentStatus
  uploadedAt?: Date
  processedAt?: Date
}

interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, 'id' | 'uploadedAt' | 'processedAt' | 'documentType'> {}

export class DocumentModel
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  declare id: string
  declare userId: string
  declare filename: string
  declare filePath: string
  declare fileType: string
  declare documentType?: DocumentType
  declare status: DocumentStatus
  declare uploadedAt: Date
  declare processedAt?: Date
}

const sequelize = getSequelize()

DocumentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.ENUM(...Object.values(DocumentType)),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DocumentStatus)),
      allowNull: false,
      defaultValue: DocumentStatus.UPLOADED,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: false,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['documentType'],
      },
    ],
  }
)

// Define associations
DocumentModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
})

UserModel.hasMany(DocumentModel, {
  foreignKey: 'userId',
  as: 'documents',
})

export default DocumentModel
