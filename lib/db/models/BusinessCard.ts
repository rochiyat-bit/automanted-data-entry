import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import DocumentModel from './Document'

interface BusinessCardAttributes {
  id: string
  documentId: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  website?: string
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

interface BusinessCardCreationAttributes
  extends Optional<BusinessCardAttributes, 'id' | 'website' | 'verifiedBy' | 'verifiedAt'> {}

export class BusinessCardModel
  extends Model<BusinessCardAttributes, BusinessCardCreationAttributes>
  implements BusinessCardAttributes
{
  declare id: string
  declare documentId: string
  declare name: string
  declare company: string
  declare email: string
  declare phone: string
  declare address: string
  declare website?: string
  declare confidenceScore: number
  declare verifiedBy?: string
  declare verifiedAt?: Date
}

const sequelize = getSequelize()

BusinessCardModel.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'business_cards',
    timestamps: false,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['company'],
      },
    ],
  }
)

// Define associations
BusinessCardModel.belongsTo(DocumentModel, {
  foreignKey: 'documentId',
  as: 'document',
})

DocumentModel.hasOne(BusinessCardModel, {
  foreignKey: 'documentId',
  as: 'businessCard',
})

export default BusinessCardModel
