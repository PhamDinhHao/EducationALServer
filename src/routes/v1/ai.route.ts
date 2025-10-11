import express from 'express'
import { aiController } from '@/controllers'

const router = express.Router()

router.post('/generate', aiController.generateWithMessages)
router.post('/generate-text', aiController.generateText)

export default router


