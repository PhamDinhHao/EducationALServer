import { Router } from 'express'
import * as courseTypeController from '../../controllers/courseType.controller'

const router = Router()

router.get('/top', courseTypeController.getTopCategories)
router.get('/', courseTypeController.listCourseTypes)
router.get('/:id', courseTypeController.getCourseTypeById)
router.post('/', courseTypeController.createCourseType)
router.put('/:id', courseTypeController.updateCourseType)
router.delete('/:id', courseTypeController.deleteCourseType)

export default router


