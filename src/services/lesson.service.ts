import prisma from '@/client'

export const getLessonsByCourse = async (courseId: number) => {
  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' }
  })
}

export const getLessonById = async (id: number) => {
  return prisma.lesson.findUnique({ where: { id } })
}

export const createLesson = async (input: {
  title: string
  description: string
  duration: number
  src: string
  order: number
  courseId: number
}) => {
  return prisma.lesson.create({ data: input })
}

export const updateLesson = async (
  id: number,
  input: Partial<{
    title: string
    description: string
    duration: number
    src: string
    order: number
  }>
) => {
  return prisma.lesson.update({ where: { id }, data: input })
}

export const deleteLesson = async (id: number) => {
  return prisma.lesson.delete({ where: { id } })
}


