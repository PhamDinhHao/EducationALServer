import prisma from '@/client'

export const listCourses = async () => {
  return prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { courseType: true }
  })
}

export const getCourseById = async (id: number) => {
  return prisma.course.findUnique({
    where: { id },
    include: { courseType: true, lessons: { orderBy: { order: 'asc' } } }
  })
}

export const createCourse = async (input: {
  title: string
  description: string
  img?: string | null
  url?: string | null
  teacher: string
  students?: number
  duration?: string | null
  courseTypeId: number
}) => {
  return prisma.course.create({ data: input })
}

export const updateCourse = async (
  id: number,
  input: Partial<{
    title: string
    description: string
    img?: string | null
    url?: string | null
    teacher: string
    students: number
    duration?: string | null
    courseTypeId: number
  }>
) => {
  return prisma.course.update({ where: { id }, data: input })
}

export const deleteCourse = async (id: number) => {
  return prisma.course.delete({ where: { id } })
}


