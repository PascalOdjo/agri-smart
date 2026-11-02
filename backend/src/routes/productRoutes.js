import express from 'express'
import { authorize } from '../middleware/auth.js'
import {
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
} from '../controllers/productController.js'

const router = express.Router()

router.get('/', listProducts)
router.post('/', authorize(['farmer']), createProduct)
router.get('/:id', getProductById)
router.put('/:id', authorize(['farmer', 'admin']), updateProduct)
router.delete('/:id', authorize(['farmer', 'admin']), deleteProduct)

export default router
