import { Router } from 'express'
import * as enrollmentController from '../../controllers/enrollment.controller'
import auth from '@/middlewares/auth'

const router = Router()

router.get('/', auth('manageUsers'), enrollmentController.listAllEnrollments)
router.post('/', enrollmentController.enroll)
router.delete('/', enrollmentController.unenroll)
router.get('/me', auth(), enrollmentController.getMyEnrollments)
router.get('/users/:userId', enrollmentController.listUserEnrollments)

export default router


