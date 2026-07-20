import { handleAsync, AppError } from '../utils/errors.js'
import { Product, User } from '../models/index.js'

export const listProducts = handleAsync(async (req, res) => {
    const { page = 1, limit = 20, search, farmerId } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const where = {}

    if (search) {
        where.title = { [Product.sequelize.Op.like]: `%${search}%` }
    }

    if (farmerId) {
        where.farmerId = farmerId
    }

    const products = await Product.findAndCountAll({
        where,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'email'] }],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
    })

    res.status(200).json({
        success: true,
        products: products.rows,
        meta: {
            total: products.count,
            page: Number(page),
            limit: Number(limit)
        }
    })
})

export const createProduct = handleAsync(async (req, res) => {
    const { title, description, price, unit, stock, imageUrl } = req.body

    const product = await Product.create({
        farmerId: req.user.id,
        title,
        description,
        price,
        unit,
        stock,
        imageUrl
    })

    res.status(201).json({
        success: true,
        message: 'Product created',
        product
    })
})

export const getProductById = handleAsync(async (req, res) => {
    const { id } = req.params
    const product = await Product.findByPk(id, {
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'email'] }]
    })

    if (!product) {
        throw new AppError('Product not found', 404)
    }

    res.status(200).json({
        success: true,
        product
    })
})

export const updateProduct = handleAsync(async (req, res) => {
    const { id } = req.params
    const { title, description, price, unit, stock, imageUrl } = req.body
    const product = await Product.findByPk(id)

    if (!product) {
        throw new AppError('Product not found', 404)
    }

    if (product.farmerId !== req.user.id) {
        throw new AppError('Unauthorized to update this product', 403)
    }

    product.title = title ?? product.title
    product.description = description ?? product.description
    product.price = price ?? product.price
    product.unit = unit ?? product.unit
    product.stock = stock ?? product.stock
    product.imageUrl = imageUrl ?? product.imageUrl
    await product.save()

    res.status(200).json({
        success: true,
        message: 'Product updated',
        product
    })
})

export const deleteProduct = handleAsync(async (req, res) => {
    const { id } = req.params
    const product = await Product.findByPk(id)

    if (!product) {
        throw new AppError('Product not found', 404)
    }

    if (product.farmerId !== req.user.id) {
        throw new AppError('Unauthorized to delete this product', 403)
    }

    await product.destroy()

    res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
})
