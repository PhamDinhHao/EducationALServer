import express from 'express'
import * as blogController from '@/controllers/blog.controller'
import { upload } from '@/configs/multer'
import auth from '@/middlewares/auth'

const router = express.Router()

router.get('/related-posts/:id', blogController.getRelatedBlogs)
router.get('/recent-posts', blogController.getRecentBlogs)
router.get('/', blogController.listAllBlogs)
router.get('/:id', blogController.getBlogById)
router.post('/', auth(), upload.single('image'), blogController.createBlog)
router.put('/:id', auth(), upload.single('image'), blogController.updateBlog)
router.delete('/:id', blogController.deleteBlog)
router.post('/:id/like', auth(), blogController.heartBlog)
router.post('/upload-image', auth(), upload.single('image'), blogController.uploadBlogImage)
export default router
