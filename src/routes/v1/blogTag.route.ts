import { Router } from 'express'
import * as blogTagController from '../../controllers/blogTag.controller'
const router = Router()

router.get('/', blogTagController.listAllBlogTags)
router.get('/:id', blogTagController.getBlogTagById)
router.post('/', blogTagController.createBlogTag)
router.put('/:id', blogTagController.updateBlogTag)
router.delete('/:id', blogTagController.deleteBlogTag)

export default router
