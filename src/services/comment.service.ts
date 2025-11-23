import prisma from '@/client'

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const getCommentsByLesson = async (lessonId: number) => {
  return prisma.comment.findMany({
    where: { lessonId, parentId: null }, // chỉ lấy comment cha
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      },
      replies: {
        orderBy: { createdAt: 'asc' }, // replies sắp xếp tăng dần
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }
    },
  });
};


export const getAllComments = async () => {
  return prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          courseId: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};


export const getCommentCount = async () => {
  return prisma.comment.count();
};


export const createComment = async (lessonId: number, author: string, content: string, userId?: number) => {
  return prisma.comment.create({
    data: {
      lessonId,
      author,
      content,
      parentId: null,
      userId: userId || null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    }
  });
};

export const createReply = async (
  lessonId: number,
  parentId: number,
  author: string,
  content: string,
  userId?: number
) => {
  return prisma.comment.create({
    data: {
      lessonId,
      author,
      content,
      parentId,
      userId: userId || null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    }
  });
};
