import { Router } from 'express'
import * as lessonController from '../../controllers/lesson.controller'

const router = Router()

router.get('/', lessonController.listAllLessons)
router.get('/course/:id', lessonController.getLessonsByCourse)
router.get('/:id', lessonController.getLessonById)
router.post('/', lessonController.createLesson)
router.put('/:id', lessonController.updateLesson)
router.delete('/:id', lessonController.deleteLesson)

export default router
