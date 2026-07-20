import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/index.js'

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization header'
            })
        }

        const token = authHeader.slice(7)

        try {
            const decoded = jwt.verify(token, jwtConfig.secret)
            req.user = decoded
            next()
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                })
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            })
        }
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        })
    }
}

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            })
        }

        next()
    }
}

export const generateToken = (userId, email, role) => {
    return jwt.sign(
        {
            id: userId,
            email,
            role
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
    )
}
