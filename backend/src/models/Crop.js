import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Crop = sequelize.define('Crop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    plantingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    expectedHarvestDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    surfaceArea: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('planifié', 'planté', 'en croissance', 'récolté'),
        allowNull: false,
        defaultValue: 'planifié'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'crops'
})

export default Crop