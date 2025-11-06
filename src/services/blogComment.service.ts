import prisma from '@/client'

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const getBlogCommentsByBlog = async (blogId: number) => {
  return prisma.blogComment.findMany({
    where: { blogId, parentId: null }, // chỉ lấy comment cha
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' } // replies sắp xếp tăng dần
      }
    }
  })
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
