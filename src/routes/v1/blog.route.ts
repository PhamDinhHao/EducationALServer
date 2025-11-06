import { Router } from 'express'
import * as blogController from '@/controllers/blog.controller'

const router = Router()

router.get('/', blogController.listAllBlogs)
router.get('/:id', blogController.getBlogById)
router.post('/', blogController.createBlog)
router.put('/:id', blogController.updateBlog)
router.delete('/:id', blogController.deleteBlog)

export default router
