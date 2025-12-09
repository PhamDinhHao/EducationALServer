import { Request, Response } from 'express'
import * as blogCommentService from '@/services/blogComment.service'

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const listAllBlogComments = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = req.query
    const blogId = parseInt(req.params.blogId)

    let sortBy = query.sortBy ?? 'createdAt'
    let sortType: 'asc' | 'desc' = 'desc'

    if (typeof sortBy === 'string' && sortBy.includes(':')) {
      const [field, direction] = sortBy.split(':')
      sortBy = field
      sortType = direction === 'asc' ? 'asc' : 'desc'
    }

    const options = {
      sortBy,
      sortType,
      limit: Number(query.limit ?? 12),
      page: Number(query.page ?? 1)
    }

    const filter = {
      blogId,
      userId: parseInt(query.userId ?? '0'),
      parentId: parseInt(query.parentId ?? '0'),
      createdAt: new Date(query.createdAt ?? new Date())
    }
    if (isNaN(filter.blogId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' })
    }
    const comments = await blogCommentService.queryBlogComments(options, filter)
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
 */
export const postBlogComment = async (req: Request, res: Response) => {
  const blogId = parseInt(req.params.blogId)
  const { user_id, content, parent_id } = req.body
  if (!user_id || !content) {
    return res.status(400).json({ message: 'Thiếu thông tin bình luận' })
  }

  try {
    let comment
    if (parent_id) {
      comment = await blogCommentService.createBlogCommentReply(blogId, parent_id, user_id, content)
    } else {
      comment = await blogCommentService.createBlogComment(blogId, user_id, content)
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

/**
 * Lấy tất cả comment (cho Admin)
 */
export const getAllBlogComments = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = req.query

    let sortBy = query.sortBy ?? 'createdAt'
    let sortType: 'asc' | 'desc' = 'desc'

    if (typeof sortBy === 'string' && sortBy.includes(':')) {
      const [field, direction] = sortBy.split(':')
      sortBy = field
      sortType = direction === 'asc' ? 'asc' : 'desc'
    }

    const options = {
      sortBy,
      sortType,
      limit: Number(query.limit ?? 12),
      page: Number(query.page ?? 1)
    }

    const filter = {
      blogId: query.blogId ? parseInt(query.blogId) : undefined,
      userId: query.userId ? parseInt(query.userId) : undefined,
      parentId: query.parentId ? parseInt(query.parentId) : undefined,
      createdAt: query.createdAt ? new Date(query.createdAt) : undefined
    }

    const comments = await blogCommentService.queryBlogComments(options, filter)
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
 * Xóa comment
 */
export const deleteBlogComment = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    await blogCommentService.deleteBlogComment(id)
    res.status(204).send()
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Lỗi không xác định' })
    }
  }
}
