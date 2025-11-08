import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import UserModel from './User'

interface AuditLogAttributes {
  id: string
  userId: string
  action: string
  tableName: string
  recordId: string
  oldData?: string
  newData?: string
  timestamp: Date
}

interface AuditLogCreationAttributes
  extends Optional<AuditLogAttributes, 'id' | 'oldData' | 'newData' | 'timestamp'> {}

export class AuditLogModel
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string
  declare userId: string
  declare action: string
  declare tableName: string
  declare recordId: string
  declare oldData?: string
  declare newData?: string
  declare timestamp: Date
}

const sequelize = getSequelize()

AuditLogModel.init(
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
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recordId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    oldData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    newData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['tableName'],
      },
      {
        fields: ['recordId'],
      },
      {
        fields: ['timestamp'],
      },
    ],
  }
)

// Define associations
AuditLogModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
})

UserModel.hasMany(AuditLogModel, {
  foreignKey: 'userId',
  as: 'auditLogs',
})

export default AuditLogModel
