import prisma from '@/client'

export const upsertProgress = async (
  userId: number,
  lessonId: number,
  progress: number,
  completedAt?: Date | null
) => {
  const clamp = (n: number) => Math.max(0, Math.min(100, n))
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { progress: clamp(progress), completedAt: completedAt ?? null, lastViewedAt: new Date() },
    create: { userId, lessonId, progress: clamp(progress), completedAt: completedAt ?? null, lastViewedAt: new Date() }
  })
}

export const getLessonProgressForUser = async (userId: number, lessonId: number) => {
  return prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  })
}

export const listProgressByCourseForUser = async (userId: number, courseId: number) => {
  const lessons = await prisma.lesson.findMany({ where: { courseId }, select: { id: true, order: true } })
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessons.map((l) => l.id) } }
  })
  const map = new Map(progress.map((p) => [p.lessonId, p]))
  return lessons
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ lessonId: l.id, order: l.order, progress: map.get(l.id)?.progress ?? 0, completedAt: map.get(l.id)?.completedAt ?? null }))
}

export const getAllProgressForUser = async (userId: number) => {
  return prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          course: true
        }
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const getAllProgress = async () => {
  return prisma.lessonProgress.findMany({
    include: {
      lesson: {
        include: {
          course: true
        }
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}


