import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    farmerId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    totalPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'orders'
})

export default Order
