import express from 'express'
import { authorize } from '../middleware/auth.js'
import { createFarm, deleteFarm, getUserFarms, updateFarm } from '../controllers/farmController.js'

const router = express.Router()

router.get('/users/:userId/farms', getUserFarms)
router.post('/farms', authorize(['farmer', 'admin']), createFarm)
router.put('/farms/:id', authorize(['farmer', 'admin']), updateFarm)
router.delete('/farms/:id', authorize(['farmer', 'admin']), deleteFarm)

export default router