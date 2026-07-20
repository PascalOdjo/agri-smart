import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Farm = sequelize.define('Farm', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    farmName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    commune: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gpsLat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    gpsLng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    farmSize: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    mainCrops: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    productionGoal: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    equipment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    weatherStation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'farms'
})

export default Farm
