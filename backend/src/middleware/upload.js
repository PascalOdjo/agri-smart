import multer from 'multer'
import path from 'path'
import { uploadConfig } from '../config/index.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadPath = path.resolve(__dirname, '../../uploads')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const extension = path.extname(file.originalname)
        const safeName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, '_')
        cb(null, `${safeName}-${uniqueSuffix}${extension}`)
    }
})

const fileFilter = (req, file, cb) => {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (acceptedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Unsupported file type. Allowed: jpeg, png, webp, pdf'), false)
    }
}

export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: uploadConfig.maxFileSize
    },
    fileFilter
}).single('file')
