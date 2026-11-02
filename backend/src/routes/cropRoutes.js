import express from 'express'
import { authorize } from '../middleware/auth.js'
import { createCrop, deleteCrop, getCrops, updateCrop } from '../controllers/cropController.js'

const router = express.Router()

router.get('/', getCrops)
router.post('/', authorize(['farmer', 'admin']), createCrop)
router.put('/:id', authorize(['farmer', 'admin']), updateCrop)
router.delete('/:id', authorize(['farmer', 'admin']), deleteCrop)

export default router