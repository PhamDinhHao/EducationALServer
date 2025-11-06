import { Request, Response } from 'express'
import * as blogCommentService from '@/services/blogComment.service'

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const getBlogComments = async (req: Request, res: Response) => {
  const blogId = parseInt(req.params.blogId)
  if (isNaN(blogId)) return res.status(400).json({ message: 'ID không hợp lệ' })

  try {
    const comments = await blogCommentService.getBlogCommentsByBlog(blogId)
    res.json(comments)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}

/**
 * Tạo comment cha hoặc reply (2 cấp)
 * Nếu req.body.parentId có giá trị → là reply
 */
export const postBlogComment = async (req: Request, res: Response) => {
  const blogId = parseInt(req.params.blogId)
  const { userId, content, parentId } = req.body

  if (!userId || !content) {
    return res.status(400).json({ message: 'Thiếu thông tin bình luận' })
  }

  try {
    let comment
    if (parentId) {
      // tạo reply
      comment = await blogCommentService.createBlogCommentReply(blogId, parentId, userId, content)
    } else {
      // tạo comment cha
      comment = await blogCommentService.createBlogComment(blogId, userId, content)
    }

    res.status(201).json(comment)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}
