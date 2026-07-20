import express from 'express'
import { authorize } from '../middleware/auth.js'
import {
    createOrder,
    listUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js'

const router = express.Router()

router.get('/', listUserOrders)
router.post('/', authorize(['client']), createOrder)
router.get('/:id', getOrderById)
router.put('/:id/status', authorize(['farmer']), updateOrderStatus)
router.put('/:id/cancel', authorize(['client']), cancelOrder)

export default router
