import { handleAsync, AppError } from '../utils/errors.js'
import { User } from '../models/index.js'

export const getCurrentUser = handleAsync(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'fullName', 'role', 'region', 'createdAt', 'updatedAt']
    })

    if (!user) {
        throw new AppError('User not found', 404)
    }

    res.status(200).json({
        success: true,
        user
    })
})

export const getAllUsers = handleAsync(async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'email', 'fullName', 'role', 'region', 'createdAt', 'updatedAt']
    })

    // Map fields to match what the frontend expects (e.g. full_name instead of fullName)
    const formattedUsers = users.map(u => {
        const userObj = u.toJSON()
        return {
            ...userObj,
            full_name: userObj.fullName,
            status: 'active',
            phone: 'Non spécifié'
        }
    })

    res.status(200).json({
        success: true,
        users: formattedUsers
    })
})

export const updateProfile = handleAsync(async (req, res) => {
    const { fullName, region } = req.body
    const user = await User.findByPk(req.user.id)

    if (!user) {
        throw new AppError('User not found', 404)
    }

    user.fullName = fullName ?? user.fullName
    user.region = region ?? user.region
    await user.save()

    res.status(200).json({
        success: true,
        message: 'Profile updated',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            region: user.region
        }
    })
})

export const getUserById = handleAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findByPk(id, {
        attributes: ['id', 'email', 'fullName', 'role', 'region', 'createdAt', 'updatedAt']
    })

    if (!user) {
        throw new AppError('User not found', 404)
    }

    res.status(200).json({
        success: true,
        user
    })
})
