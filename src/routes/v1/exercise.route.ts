import express from 'express'
import upload from '@/middlewares/upload'
import exerciseController from '@/controllers/exercise.controller'

const router = express.Router()

router.post('/chat', upload.single('image'), exerciseController.chatWithAI)

export default router
