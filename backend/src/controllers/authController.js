import jwt from 'jsonwebtoken'
import { generateToken } from '../middleware/auth.js'
import { hashPassword, comparePassword, generateResetToken } from '../utils/password.js'
import { AppError, handleAsync } from '../utils/errors.js'
import { User, PasswordReset } from '../models/index.js'
import { jwtConfig } from '../config/index.js'

const createSessionToken = (user) => {
    return generateToken(user.id, user.email, user.role)
}

export const register = handleAsync(async (req, res) => {
    const { email, password, fullName, role } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
        throw new AppError('Email already registered', 400)
    }

    const passwordHash = await hashPassword(password)
    const newUser = await User.create({
        email,
        passwordHash,
        fullName,
        role: role || 'client'
    })

    const token = createSessionToken(newUser)

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            region: newUser.region
        }
    })
})

export const login = handleAsync(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
        throw new AppError('Invalid email or password', 401)
    }

    const passwordMatches = await comparePassword(password, user.passwordHash)
    if (!passwordMatches) {
        throw new AppError('Invalid email or password', 401)
    }

    const token = createSessionToken(user)
    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            region: user.region
        }
    })
})

export const logout = handleAsync(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
})

export const refreshToken = handleAsync(async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Missing authorization header', 401)
    }

    const oldToken = authHeader.slice(7)
    let decoded
    try {
        // Allow expired tokens so clients can renew an otherwise valid session
        decoded = jwt.verify(oldToken, jwtConfig.secret, { ignoreExpiration: true })
    } catch (error) {
        throw new AppError('Invalid or expired token', 401)
    }

    const user = await User.findByPk(decoded.id)
    if (!user) {
        throw new AppError('User not found', 401)
    }

    const token = createSessionToken(user)
    res.status(200).json({
        success: true,
        message: 'Token refreshed',
        token
    })
})

export const requestPasswordReset = handleAsync(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user) {
        return res.status(200).json({
            success: true,
            message: 'If the email is registered, you will receive a reset link.'
        })
    }

    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await PasswordReset.create({
        userId: user.id,
        token,
        expiresAt
    })

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`
    console.log('Password reset URL:', resetUrl)

    res.status(200).json({
        success: true,
        message: 'Password reset instructions have been sent if the email exists.',
        resetUrl
    })
})

export const confirmPasswordReset = handleAsync(async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const resetRecord = await PasswordReset.findOne({
        where: {
            token,
            used: false
        }
    })

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
        throw new AppError('Invalid or expired reset token', 400)
    }

    const user = await User.findByPk(resetRecord.userId)
    if (!user) {
        throw new AppError('User not found', 404)
    }

    user.passwordHash = await hashPassword(password)
    await user.save()
    resetRecord.used = true
    await resetRecord.save()

    res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
    })
})
