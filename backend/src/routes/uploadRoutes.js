import express from 'express'
import { uploadMiddleware } from '../middleware/upload.js'
import { uploadFile } from '../controllers/uploadController.js'

const router = express.Router()

router.post('/', uploadMiddleware, uploadFile)

export default router
