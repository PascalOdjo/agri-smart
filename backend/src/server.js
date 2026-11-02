import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

import { sequelize } from './config/database.js'
import errorHandler from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import diagnosticRoutes from './routes/diagnosticRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import formationRoutes from './routes/formationRoutes.js'
import farmRoutes from './routes/farmRoutes.js'
import cropRoutes from './routes/cropRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { createDueCropNotifications } from './utils/cropNotifications.js'
import nationalPriceRoutes from './routes/nationalPriceRoutes.js'
import './models/index.js'

// Load environment variables
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// ========== Middleware ==========

// Security headers
app.use(helmet())

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman) or from allowed origins/ngrok
        if (!origin || allowedOrigins.includes(origin) || origin.includes('ngrok')) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    optionsSuccessStatus: 200
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Static files for uploads
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')))

// Request logging middleware (simple)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
})

// ========== Routes ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running', timestamp: new Date().toISOString() })
})

// Auth routes (public)
app.use('/api/auth', authRoutes)

// Protected routes (require authentication)
app.use('/api/users', authenticate, userRoutes)
app.use('/api/products', authenticate, productRoutes)
app.use('/api/orders', authenticate, orderRoutes)
app.use('/api/diagnostics', authenticate, diagnosticRoutes)
app.use('/api/upload', authenticate, uploadRoutes)
app.use('/api/formations', authenticate, formationRoutes)
app.use('/api', authenticate, farmRoutes)
app.use('/api/crops', authenticate, cropRoutes)
app.use('/api/notifications', authenticate, notificationRoutes)
app.use('/api/national_prices', authenticate, nationalPriceRoutes)

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// ========== Database & Server Initialization ==========

async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate()
        console.log('✅ Database connection established')

        // Create missing tables in development; use migrations in production.
        // ALTER can duplicate MySQL indexes on repeated Sequelize syncs.
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({
                alter: process.env.DB_SYNC_ALTER === 'true'
            })
            console.log('✅ Database models synced')
        }

        try {
            await sequelize.query('ALTER TABLE `national_prices` ADD COLUMN IF NOT EXISTS `region` VARCHAR(100) NULL')
        } catch (error) {
            console.warn('⚠️ Impossible de synchroniser la colonne region des produits nationaux:', error.message)
        }

        await createDueCropNotifications()
        setInterval(() => createDueCropNotifications().catch((error) => console.error('Notification scheduler error:', error)), 60000)

        // Start server
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`)
            console.log(`📍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
            console.log(`🗄️  Database: ${process.env.DB_NAME || 'agri_smart'}`)
            console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
        })
    } catch (error) {
        console.error('❌ Failed to start server:')
        console.error(error)
        process.exit(1)
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server')
    await sequelize.close()
    process.exit(0)
})

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server')
    await sequelize.close()
    process.exit(0)
})

// Start the server
startServer()

export default app
