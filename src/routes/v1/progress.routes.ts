import { Router } from 'express'
import * as progressController from '../../controllers/progress.controller'
import auth from '@/middlewares/auth'

const router = Router()

router.put('/', auth(), progressController.upsertProgress)
router.get('/me', auth(), progressController.getMyProgressByCourse)
router.get('/me/lessons/:lessonId', auth(), progressController.getMyLessonProgress)
router.get('/users/:userId/lessons/:lessonId', progressController.getLessonProgressForUser)
router.get('/users/:userId', progressController.listProgressByCourseForUser)
router.get('/', auth('manageUsers'), progressController.getAllProgress)

export default router


