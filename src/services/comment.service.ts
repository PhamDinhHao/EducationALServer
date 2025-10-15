import prisma from '@/client'

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const getCommentsByLesson = async (lessonId: number) => {
  return prisma.comment.findMany({
    where: { lessonId, parentId: null }, // chỉ lấy comment cha
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' }, // replies sắp xếp tăng dần
      }
    },
  });
};

/**
 * Tạo comment cha
 */
export const createComment = async (lessonId: number, author: string, content: string) => {
  return prisma.comment.create({
    data: {
      lessonId,
      author,
      content,
      parentId: null // comment cha
    },
  });
};

/**
 * Tạo reply (comment con)
 */
export const createReply = async (
  lessonId: number,
  parentId: number, // id của comment cha
  author: string,
  content: string
) => {
  return prisma.comment.create({
    data: {
      lessonId,
      author,
      content,
      parentId, // gán parentId = comment cha
    },
  });
};
