import prisma from '@/client'

/**
 */
export const queryBlogComments = async (
  options: { limit?: number; page?: number; sortBy?: string; sortType?: 'asc' | 'desc' },
  filter: { blogId?: number; userId?: number; parentId?: number; createdAt?: Date }
) => {
  const page = Number(options.page ?? 1)
  const limit = Number(options.limit ?? 12)
  const sortBy = options.sortBy ?? 'createdAt'
  const sortType = options.sortType ?? 'desc'

  const comments = await prisma.blogComment.findMany({
    include: { user: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType },
    where: {
      ...(filter.blogId ? { blogId: filter.blogId } : {})
    }
  })

  const total = await prisma.blogComment.count({
    where: {
      ...(filter.blogId ? { blogId: filter.blogId } : {})
    }
  })

  const totalPages = Math.ceil(total / limit)

  return {
    data: comments,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  }
}

/**
 * Tạo comment cha
 */
export const createBlogComment = async (blogId: number, userId: number, content: string) => {
  return prisma.blogComment.create({
    data: {
      blogId,
      userId,
      content,
      parentId: null, // comment cha
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

/**
 * Tạo reply (comment con)
 */
export const createBlogCommentReply = async (
  blogId: number,
  parentId: number, // id của comment cha
  userId: number,
  content: string
) => {
  return prisma.blogComment.create({
    data: {
      blogId,
      userId,
      content,
      parentId, // gán parentId = comment cha
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}
