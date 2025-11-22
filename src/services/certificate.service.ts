import prisma from '@/client'

const generateCertificateNumber = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `CERT-${timestamp}-${random}`
}

export const createCertificate = async (userId: number, courseId: number) => {
  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } }
  })

  if (existing) {
    return existing
  }

  // Generate unique certificate number
  let certificateNumber = generateCertificateNumber()
  // Ensure uniqueness
  let attempts = 0
  while (await prisma.certificate.findUnique({ where: { certificateNumber } }) && attempts < 10) {
    certificateNumber = generateCertificateNumber()
    attempts++
  }

  // Create certificate
  return prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacher: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })
}

export const getUserCertificates = async (userId: number) => {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacher: true,
          img: true,
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  })
}

export const getCertificateById = async (certificateId: number, userId: number) => {
  return prisma.certificate.findFirst({
    where: {
      id: certificateId,
      userId
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacher: true,
          description: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })
}

export const updateCertificateUrls = async (certificateId: number, pdfUrl?: string, imageUrl?: string) => {
  return prisma.certificate.update({
    where: { id: certificateId },
    data: {
      pdfUrl: pdfUrl || undefined,
      imageUrl: imageUrl || undefined,
    }
  })
}

