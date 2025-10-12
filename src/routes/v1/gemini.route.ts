import express from 'express'
import auth from '@/middlewares/auth'
import validate from '@/middlewares/validate'
import { geminiValidation } from '@/validations'
import { geminiController } from '@/controllers'
import upload from '@/middlewares/upload'

const router = express.Router()

// Upload file + matrix
router.post(
  '/generate',
  upload.single('file'), // multer xử lý file
  validate(geminiValidation.generateExam),
  geminiController.generateExam
)

export default router
