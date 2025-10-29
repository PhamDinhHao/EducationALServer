import { Router } from 'express'
import * as enrollmentController from '../../controllers/enrollment.controller'

const router = Router()

router.post('/', enrollmentController.enroll)
router.delete('/', enrollmentController.unenroll)
router.get('/users/:userId', enrollmentController.listUserEnrollments)

export default router


