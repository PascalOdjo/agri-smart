import express from 'express'
import {
    saveDiagnostic,
    getUserDiagnostics,
    getDiagnosticById,
    analyzeImage,
    analyzeText
} from '../controllers/diagnosticController.js'

const router = express.Router()

router.post('/analyze/image', analyzeImage)
router.post('/analyze/text', analyzeText)

router.post('/', saveDiagnostic)
router.get('/', getUserDiagnostics)
router.get('/:id', getDiagnosticById)

export default router
