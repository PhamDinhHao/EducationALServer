import express from 'express'
import validate from '@/middlewares/validate'
import lessonValidation from '@/validations/lesson.validation'
import upload from '@/middlewares/upload'
import { generateLesson } from '@/controllers/lesson.controller'

const router = express.Router()

router.post(
  '/generate',
  upload.single('file'),
  (req, res, next) => {
    if (req.body.periods) req.body.periods = Number(req.body.periods)
    next()
  },
  validate({ body: lessonValidation.generateLesson }),
  generateLesson
)

export default router
