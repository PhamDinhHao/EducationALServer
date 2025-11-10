import prisma from '@/client'

export const enroll = async (userId: number, courseId: number) => {
  return prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: 'ACTIVE' },
    create: { userId, courseId, status: 'ACTIVE' }
  })
}

export const unenroll = async (userId: number, courseId: number) => {
  return prisma.courseEnrollment.delete({
    where: { userId_courseId: { userId, courseId } }
  })
}

export const listUserEnrollments = async (userId: number) => {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    include: { course: true, user: true },
    orderBy: { enrolledAt: 'desc' }
  })

  if (enrollments.length === 0) {
    return enrollments
  }

  const courseIds = [...new Set(enrollments.map((enrollment) => enrollment.courseId))]

  const enrollmentCounts = await prisma.courseEnrollment.groupBy({
    by: ['courseId'],
    _count: { courseId: true },
    where: { courseId: { in: courseIds } }
  })

  return enrollments.map((enrollment) => {
    const enrollCount = enrollmentCounts.find((ec) => ec.courseId === enrollment.courseId)?._count.courseId || 0
    return {
      ...enrollment,
      course: {
        ...enrollment.course,
        enrollCount: enrollCount,
        students: enrollCount || enrollment.course.students || 0,
      }
    }
  })
}

export const getAllEnrollments = async () => {
  return prisma.courseEnrollment.findMany({
    include: { 
      course: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  })
}

export const checkEnrollment = async (userId: number, courseId: number) => {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, status: true, enrolledAt: true }
  })
  return enrollment ? { isEnrolled: true, enrollment } : { isEnrolled: false, enrollment: null }
}


