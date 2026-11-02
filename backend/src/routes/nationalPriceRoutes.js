import express from 'express'
import { authorize } from '../middleware/auth.js'
import { createNationalPrice, deleteNationalPrice, listNationalPrices, updateNationalPrice } from '../controllers/nationalPriceController.js'

const router = express.Router()

router.get('/', listNationalPrices)
router.post('/', authorize(['admin']), createNationalPrice)
router.put('/:id', authorize(['admin']), updateNationalPrice)
router.delete('/:id', authorize(['admin']), deleteNationalPrice)

export default router