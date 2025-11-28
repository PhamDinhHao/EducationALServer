import { Router } from 'express'
import * as lessonController from '../../controllers/lesson.controller'
import lessonValidation from '@/validations/lesson.validation'
import { upload } from '@/configs/multer'
import validate from '@/middlewares/validate'

const router = Router()
router.post(
  '/generate',
  upload.single('file'),
  (req, res, next) => {
    if (req.body.periods) req.body.periods = Number(req.body.periods)
    next()
  },
  validate({ body: lessonValidation.generateLesson }),
  lessonController.generateLesson
)
router.get('/', lessonController.listAllLessons)
router.get('/course/:id', lessonController.getLessonsByCourse)
router.get('/:id', lessonController.getLessonById)
router.post('/', lessonController.createLesson)
router.put('/:id', lessonController.updateLesson)
router.delete('/:id', lessonController.deleteLesson)

export default router
