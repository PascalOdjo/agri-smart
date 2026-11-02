import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    cropId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'crop_reminder'
    },
    title: {
        type: DataTypes.STRING(180),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'notifications'
})

export default Notification