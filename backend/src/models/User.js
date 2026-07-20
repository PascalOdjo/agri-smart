import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('client', 'farmer', 'admin'),
        allowNull: false,
        defaultValue: 'client'
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users'
})

export default User
