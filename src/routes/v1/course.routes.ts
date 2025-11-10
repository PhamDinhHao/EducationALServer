import { Router } from 'express'
import * as courseController from '../../controllers/course.controller'
import { upload } from '@/configs/multer'

const router = Router()

router.get('/top-enrolled', courseController.getTopEnrolledCourses);
router.get('/query', courseController.queryCourses);
router.get('/category/:categoryId', courseController.getCoursesByCategoryId);
router.post('/upload-image', upload.single('image'), courseController.uploadCourseImage)
router.get('/:id', courseController.getCourseById)
router.get('/', courseController.listCourses)
router.post('/', courseController.createCourse)
router.put('/:id', courseController.updateCourse)
router.delete('/:id', courseController.deleteCourse)

export default router


