import express from 'express'
import { validateRegistration, validateLogin } from '../middleware/validation.js'
import {
    register,
    login,
    logout,
    refreshToken,
    requestPasswordReset,
    confirmPasswordReset
} from '../controllers/authController.js'

const router = express.Router()

router.post('/register', validateRegistration, register)
router.post('/login', validateLogin, login)
router.post('/logout', logout)
router.post('/refresh', refreshToken)
router.post('/request-password-reset', requestPasswordReset)
router.put('/reset-password/:token', confirmPasswordReset)

export default router
