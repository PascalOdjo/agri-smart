import { Op } from 'sequelize'
import { Crop, Notification } from '../models/index.js'
import { publishNotification } from './notificationHub.js'

function dateKey(date) {
    return date.toISOString().slice(0, 10)
}

export async function createCropNotification({ userId, cropId, title, message, type = 'crop_reminder' }) {
    const notification = await Notification.create({ userId, cropId, type, title, message })
    const data = notification.toJSON()
    publishNotification(data)
    return data
}

export async function createDueCropNotifications() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const limit = new Date(today)
    limit.setDate(limit.getDate() + 7)

    const crops = await Crop.findAll({
        where: {
            [Op.or]: [
                { plantingDate: { [Op.between]: [dateKey(today), dateKey(limit)] } },
                { expectedHarvestDate: { [Op.between]: [dateKey(today), dateKey(limit)] } }
            ]
        }
    })

    for (const crop of crops) {
        const dateType = crop.plantingDate && crop.plantingDate >= dateKey(today) && crop.plantingDate <= dateKey(limit)
            ? 'planting'
            : 'harvest'
        const dueDate = dateType === 'planting' ? crop.plantingDate : crop.expectedHarvestDate
        const notificationType = `crop_${dateType}_${dueDate}`
        const exists = await Notification.findOne({ where: { userId: crop.userId, cropId: crop.id, type: notificationType } })

        if (!exists) {
            await createCropNotification({
                userId: crop.userId,
                cropId: crop.id,
                type: notificationType,
                title: dateType === 'planting' ? `Semis de ${crop.name}` : `Récolte de ${crop.name}`,
                message: dateType === 'planting'
                    ? `La date de semis de votre culture est prévue le ${dueDate}.`
                    : `La récolte de votre culture est prévue le ${dueDate}.`
            })
        }
    }
}