import { handleAsync, AppError } from '../utils/errors.js'

export const uploadFile = handleAsync(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400)
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${req.file.filename}`

    res.status(200).json({
        success: true,
        message: 'File uploaded',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: fileUrl
        }
    })
})
