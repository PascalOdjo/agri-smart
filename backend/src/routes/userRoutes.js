import express from 'express'
import { authorize } from '../middleware/auth.js'
import {
    getCurrentUser,
    updateProfile,
    getUserById,
    getAllUsers
} from '../controllers/userController.js'

const router = express.Router()

router.get('/', authorize(['admin']), getAllUsers)
router.get('/me', getCurrentUser)
router.put('/me', updateProfile)
router.get('/:id', authorize(['admin']), getUserById)

export default router
