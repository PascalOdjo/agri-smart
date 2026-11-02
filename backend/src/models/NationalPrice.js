import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const NationalPrice = sequelize.define('NationalPrice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productCategory: {
        type: DataTypes.STRING,
        allowNull: false
    },
    referencePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'kg'
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    effectiveDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'national_prices'
})

export default NationalPrice