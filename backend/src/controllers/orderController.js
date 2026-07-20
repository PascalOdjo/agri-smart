import { handleAsync, AppError } from '../utils/errors.js'
import { Order, Product, User } from '../models/index.js'

export const listUserOrders = handleAsync(async (req, res) => {
    const query = {}
    if (req.user.role === 'client') {
        query.clientId = req.user.id
    } else if (req.user.role === 'farmer') {
        query.farmerId = req.user.id
    }

    const orders = await Order.findAll({
        where: query,
        include: [
            { model: Product, as: 'product' },
            { model: User, as: 'client', attributes: ['id', 'fullName', 'email'] },
            { model: User, as: 'farmer', attributes: ['id', 'fullName', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    })

    res.status(200).json({
        success: true,
        orders
    })
})

export const createOrder = handleAsync(async (req, res) => {
    const { productId, quantity } = req.body
    const product = await Product.findByPk(productId)
    if (!product) {
        throw new AppError('Product not found', 404)
    }

    const orderQuantity = Number(quantity)
    if (!orderQuantity || orderQuantity <= 0) {
        throw new AppError('Quantity must be a positive number', 400)
    }

    const order = await Order.create({
        clientId: req.user.id,
        farmerId: product.farmerId,
        productId: product.id,
        quantity: orderQuantity,
        totalPrice: Number(product.price) * orderQuantity
    })

    res.status(201).json({
        success: true,
        message: 'Order created',
        order
    })
})

export const getOrderById = handleAsync(async (req, res) => {
    const { id } = req.params
    const order = await Order.findByPk(id, {
        include: [
            { model: Product, as: 'product' },
            { model: User, as: 'client', attributes: ['id', 'fullName', 'email'] },
            { model: User, as: 'farmer', attributes: ['id', 'fullName', 'email'] }
        ]
    })

    if (!order) {
        throw new AppError('Order not found', 404)
    }

    const isOwner =
        order.clientId === req.user.id || order.farmerId === req.user.id || req.user.role === 'admin'
    if (!isOwner) {
        throw new AppError('Unauthorized to view this order', 403)
    }

    res.status(200).json({
        success: true,
        order
    })
})

export const updateOrderStatus = handleAsync(async (req, res) => {
    const { id } = req.params
    const { status, trackingNumber } = req.body
    const order = await Order.findByPk(id)

    if (!order) {
        throw new AppError('Order not found', 404)
    }

    if (order.farmerId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized to update order status', 403)
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status value', 400)
    }

    order.status = status
    if (trackingNumber !== undefined) {
        order.trackingNumber = trackingNumber
    }
    await order.save()

    res.status(200).json({
        success: true,
        message: 'Order status updated',
        order
    })
})

export const cancelOrder = handleAsync(async (req, res) => {
    const { id } = req.params
    const order = await Order.findByPk(id)

    if (!order) {
        throw new AppError('Order not found', 404)
    }

    if (order.clientId !== req.user.id) {
        throw new AppError('Unauthorized to cancel this order', 403)
    }

    if (order.status !== 'pending') {
        throw new AppError('Only pending orders can be cancelled', 400)
    }

    order.status = 'cancelled'
    await order.save()

    res.status(200).json({
        success: true,
        message: 'Order cancelled',
        order
    })
})
