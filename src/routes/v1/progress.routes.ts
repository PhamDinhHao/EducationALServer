import { Router } from 'express'
import * as progressController from '../../controllers/progress.controller'
import auth from '@/middlewares/auth'

const router = Router()

router.put('/', progressController.upsertProgress)
router.get('/users/:userId/lessons/:lessonId', progressController.getLessonProgressForUser)
router.get('/users/:userId', progressController.listProgressByCourseForUser)
router.get('/', auth('manageUsers'), progressController.getAllProgress)

export default router


