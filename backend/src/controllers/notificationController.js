import { Notification } from '../models/index.js'
import { createDueCropNotifications } from '../utils/cropNotifications.js'

function toApiNotification(notification) {
    const data = notification.toJSON ? notification.toJSON() : notification
    return { ...data, user_id: data.userId, crop_id: data.cropId, read_at: data.readAt }
}

export async function getNotifications(req, res, next) {
    try {
        await createDueCropNotifications()
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 30
        })
        res.json({ notifications: notifications.map(toApiNotification) })
    } catch (error) {
        next(error)
    }
}

export async function markNotificationRead(req, res, next) {
    try {
        const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } })
        if (!notification) return res.status(404).json({ error: 'Notification introuvable' })
        await notification.update({ readAt: new Date() })
        res.json({ notification: toApiNotification(notification) })
    } catch (error) {
        next(error)
    }
}