import express from 'express'
import {
    saveDiagnostic,
    getUserDiagnostics,
    getDiagnosticById
} from '../controllers/diagnosticController.js'

const router = express.Router()

router.post('/', saveDiagnostic)
router.get('/', getUserDiagnostics)
router.get('/:id', getDiagnosticById)

export default router
