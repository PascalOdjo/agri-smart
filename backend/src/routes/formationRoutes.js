import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
    let formations = []

    if (process.env.FORMATION_VIDEOS_JSON) {
        try {
            formations = JSON.parse(process.env.FORMATION_VIDEOS_JSON)
        } catch {
            return res.status(500).json({ error: 'FORMATION_VIDEOS_JSON est invalide' })
        }
    }

    res.json({ formations })
})

export default router