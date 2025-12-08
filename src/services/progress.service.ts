import prisma from '@/client'

export const upsertProgress = async (
  userId: number,
  lessonId: number,
  progress: number,
  completedAt?: Date | null
) => {
  const clamp = (n: number) => Math.max(0, Math.min(100, n))
  const newProgress = clamp(progress)

  // Check existing progress to prevent downgrading
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  })

  if (existing) {
    // If already 100%, keep it 100%
    if (existing.progress >= 100) {
      if (newProgress < 100) return existing
    }
    // If new progress is lower than existing, ignore update (unless it's a significant reset which we generally don't want automatically)
    if (newProgress <= existing.progress) {
      return existing
    }
  }

  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { progress: newProgress, completedAt: completedAt ?? null, lastViewedAt: new Date() },
    create: { userId, lessonId, progress: newProgress, completedAt: completedAt ?? null, lastViewedAt: new Date() }
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


