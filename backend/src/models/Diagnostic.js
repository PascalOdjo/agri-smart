import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Diagnostic = sequelize.define('Diagnostic', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    diseaseName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: true
    },
    solution: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ecoAlternative: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cause: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    prevention: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    culturalPractices: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'diagnostics'
})

export default Diagnostic
