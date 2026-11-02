import { Crop } from '../models/index.js'
import { createCropNotification } from '../utils/cropNotifications.js'

const cropFields = {
    user_id: 'userId',
    farm_id: 'farmId',
    planting_date: 'plantingDate',
    expected_harvest_date: 'expectedHarvestDate',
    surface_area: 'surfaceArea'
}

function toModelData(data, userId) {
    const modelData = { userId }

    Object.entries(data).forEach(([key, value]) => {
        const modelKey = cropFields[key] || key
        if (modelKey in Crop.getAttributes() && key !== 'user_id') {
            modelData[modelKey] = value
        }
    })

    return modelData
}

function toApiCrop(crop) {
    const data = crop.toJSON()
    return {
        ...data,
        user_id: data.userId,
        farm_id: data.farmId,
        planting_date: data.plantingDate,
        expected_harvest_date: data.expectedHarvestDate,
        surface_area: data.surfaceArea === null ? null : Number(data.surfaceArea)
    }
}

export async function getCrops(req, res, next) {
    try {
        const userId = req.query.userId || req.user.id
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès interdit' })
        }

        const crops = await Crop.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
        res.json({ crops: crops.map(toApiCrop) })
    } catch (error) {
        next(error)
    }
}

export async function createCrop(req, res, next) {
    try {
        if (!req.body.name?.trim()) {
            return res.status(400).json({ error: 'Le nom de la culture est obligatoire' })
        }

        const crop = await Crop.create(toModelData(req.body, req.user.id))
        await createCropNotification({
            userId: req.user.id,
            cropId: crop.id,
            type: 'crop_created',
            title: `Culture ${crop.name} ajoutée`,
            message: `Le suivi de votre culture ${crop.name} est maintenant actif.`
        })
        res.status(201).json({ crop: toApiCrop(crop) })
    } catch (error) {
        next(error)
    }
}

export async function updateCrop(req, res, next) {
    try {
        const crop = await Crop.findByPk(req.params.id)
        if (!crop) return res.status(404).json({ error: 'Culture introuvable' })
        if (crop.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' })

        await crop.update(toModelData(req.body, crop.userId))
        res.json({ crop: toApiCrop(crop) })
    } catch (error) {
        next(error)
    }
}

export async function deleteCrop(req, res, next) {
    try {
        const crop = await Crop.findByPk(req.params.id)
        if (!crop) return res.status(404).json({ error: 'Culture introuvable' })
        if (crop.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' })

        await crop.destroy()
        res.json({ message: 'Culture supprimée' })
    } catch (error) {
        next(error)
    }
}