import { Router } from 'express'
import * as progressController from '../../controllers/progress.controller'

const router = Router()

router.put('/', progressController.upsertProgress)
router.get('/users/:userId/lessons/:lessonId', progressController.getLessonProgressForUser)
router.get('/users/:userId', progressController.listProgressByCourseForUser)

export default router


