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

export const getTopEnrolledCourses = async (limit: number = 8) => {
  const topCourses = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
    orderBy: { _count: { courseId: 'desc' } },
    take: limit,
  });

  const courseIds = topCourses.map((item) => item.courseId);
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    include: { courseType: true },
  });

  return courses.map((c) => ({
    ...c,
    enrollCount: topCourses.find((t) => t.courseId === c.id)?._count.courseId || 0,
  })).sort((a, b) => b.enrollCount - a.enrollCount);
}

export const getCoursesByCategoryId = async (categoryId: number) => {
  return prisma.course.findMany({
    where: { courseTypeId: categoryId },
    orderBy: { createdAt: 'desc' },
    include: { courseType: true }
  })
}


