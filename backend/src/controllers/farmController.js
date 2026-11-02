import { Farm, Crop } from '../models/index.js'
import { sequelize } from '../config/database.js'
import { createCropNotification } from '../utils/cropNotifications.js'

const farmFields = {
    farm_name: 'farmName',
    gps_lat: 'gpsLat',
    gps_lng: 'gpsLng',
    farm_size: 'farmSize',
    main_crops: 'mainCrops',
    production_goal: 'productionGoal',
    weather_station: 'weatherStation'
}

function toModelData(data, userId) {
    const modelData = { userId }

    Object.entries(data).forEach(([key, value]) => {
        const modelKey = farmFields[key] || key
        if (modelKey in Farm.getAttributes() && key !== 'user_id') {
            modelData[modelKey] = value
        }
    })

    return modelData
}

function toApiFarm(farm) {
    const data = farm.toJSON()
    return {
        ...data,
        farm_name: data.farmName,
        user_id: data.userId,
        gps_lat: data.gpsLat === null ? null : Number(data.gpsLat),
        gps_lng: data.gpsLng === null ? null : Number(data.gpsLng),
        farm_size: data.farmSize === null ? null : Number(data.farmSize),
        main_crops: data.mainCrops,
        production_goal: data.productionGoal,
        weather_station: data.weatherStation
    }
}

export async function getUserFarms(req, res, next) {
    try {
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès interdit' })
        }

        const farms = await Farm.findAll({ where: { userId: req.params.userId }, order: [['createdAt', 'DESC']] })
        res.json({ farms: farms.map(toApiFarm) })
    } catch (error) {
        next(error)
    }
}

export async function createFarm(req, res, next) {
    try {
        if (!req.body.farm_name?.trim()) {
            return res.status(400).json({ error: 'Le nom de la ferme est obligatoire' })
        }

        const cropNames = (req.body.main_crops || '')
            .split(/[,;\n]/)
            .map((name) => name.trim())
            .filter(Boolean)

        const result = await sequelize.transaction(async (transaction) => {
            const farm = await Farm.create(toModelData(req.body, req.user.id), { transaction })
            const crops = await Crop.bulkCreate(
                cropNames.map((name) => ({
                    userId: req.user.id,
                    farmId: farm.id,
                    name,
                    status: 'planifié'
                })),
                { transaction }
            )

            for (const crop of crops) {
                await createCropNotification({
                    userId: req.user.id,
                    cropId: crop.id,
                    type: 'crop_created',
                    title: `Culture ${crop.name} ajoutée`,
                    message: `La culture ${crop.name} de la ferme ${req.body.farm_name} est maintenant suivie.`
                })
            }

            return { farm, crops }
        })

        res.status(201).json({
            farm: toApiFarm(result.farm),
            crops: result.crops.map((crop) => crop.toJSON())
        })
    } catch (error) {
        next(error)
    }
}

export async function updateFarm(req, res, next) {
    try {
        const farm = await Farm.findByPk(req.params.id)
        if (!farm) return res.status(404).json({ error: 'Ferme introuvable' })
        if (farm.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' })

        await farm.update(toModelData(req.body, farm.userId))
        res.json({ farm: toApiFarm(farm) })
    } catch (error) {
        next(error)
    }
}

export async function deleteFarm(req, res, next) {
    try {
        const farm = await Farm.findByPk(req.params.id)
        if (!farm) return res.status(404).json({ error: 'Ferme introuvable' })
        if (farm.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Accès interdit' })

        await farm.destroy()
        res.json({ message: 'Ferme supprimée' })
    } catch (error) {
        next(error)
    }
}