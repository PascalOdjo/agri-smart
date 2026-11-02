import express from 'express'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/index.js'
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js'
import { subscribeToNotifications } from '../utils/notificationHub.js'

const router = express.Router()

router.get('/', getNotifications)
router.patch('/:id/read', markNotificationRead)

router.get('/stream', (req, res) => {
    try {
        const token = req.query.token
        if (!token) return res.status(401).end()
        const user = jwt.verify(token, jwtConfig.secret)

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        })
        res.write(': connected\n\n')
        const unsubscribe = subscribeToNotifications(user.id, res)
        const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000)

        req.on('close', () => {
            clearInterval(heartbeat)
            unsubscribe()
        })
    } catch {
        res.status(401).end()
    }
})

export default router