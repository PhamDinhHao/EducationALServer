import { Router } from 'express'
import * as enrollmentController from '../../controllers/enrollment.controller'
import auth from '@/middlewares/auth'

const router = Router()

router.get('/', auth('manageUsers'), enrollmentController.listAllEnrollments)
router.post('/', auth(), enrollmentController.enroll)
router.delete('/', auth(), enrollmentController.unenroll)
router.get('/me', auth(), enrollmentController.getMyEnrollments)
router.get('/check/:courseId', auth(), enrollmentController.checkEnrollment)
router.get('/users/:userId', enrollmentController.listUserEnrollments)

export default router


