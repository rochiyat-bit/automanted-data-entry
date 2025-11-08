import { DataTypes, Model, Optional } from 'sequelize'
import { getSequelize } from '../sequelize'
import { UserRole } from '@/types'

interface UserAttributes {
  id: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string
  declare email: string
  declare passwordHash: string
  declare role: UserRole
  declare createdAt: Date
  declare updatedAt: Date
}

const sequelize = getSequelize()

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.OPERATOR,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
  }
)

export default UserModel
