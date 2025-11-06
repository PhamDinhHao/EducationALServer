import express from 'express'
import * as blogCommentController from '@/controllers/blogComment.controller'

const router = express.Router()

router.get('/blogs/:blogId/comments', blogCommentController.getBlogComments)
router.post('/blogs/:blogId/comments', blogCommentController.postBlogComment)

export default router
