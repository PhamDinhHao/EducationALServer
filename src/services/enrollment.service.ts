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
  return prisma.courseEnrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { enrolledAt: 'desc' }
  })
}


