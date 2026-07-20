import dotenv from 'dotenv'

dotenv.config()

export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: process.env.JWT_EXPIRE || '7d'
}

export const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME || 'agri_smart'
}

export const appConfig = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
}

export const uploadConfig = {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
}
