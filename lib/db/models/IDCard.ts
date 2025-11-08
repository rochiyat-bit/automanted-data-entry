import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import DocumentModel from './Document'

interface IDCardAttributes {
  id: string
  documentId: string
  fullName: string
  idNumber: string
  dateOfBirth: Date
  address: string
  confidenceScore: number
  verifiedBy?: string
  verifiedAt?: Date
}

interface IDCardCreationAttributes extends Optional<IDCardAttributes, 'id' | 'verifiedBy' | 'verifiedAt'> {}

export class IDCardModel extends Model<IDCardAttributes, IDCardCreationAttributes> implements IDCardAttributes {
  declare id: string
  declare documentId: string
  declare fullName: string
  declare idNumber: string
  declare dateOfBirth: Date
  declare address: string
  declare confidenceScore: number
  declare verifiedBy?: string
  declare verifiedAt?: Date
}

const sequelize = getSequelize()

IDCardModel.init(
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
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    address: {
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
    tableName: 'id_cards',
    timestamps: false,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['idNumber'],
      },
    ],
  }
)

// Define associations
IDCardModel.belongsTo(DocumentModel, {
  foreignKey: 'documentId',
  as: 'document',
})

DocumentModel.hasOne(IDCardModel, {
  foreignKey: 'documentId',
  as: 'idCard',
})

export default IDCardModel
