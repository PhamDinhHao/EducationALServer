import { Role } from '@prisma/client'
import prisma from '@/client'
import logger from '@configs/logger'
import { encryptPassword } from '@utils/encryption'


export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN
      }
    })

    if (existingAdmin) {
      logger.info('Admin user already exists, skipping default admin creation')
      return
    }


    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!'
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Administrator'

    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail
      }
    })

    if (existingUser) {
      logger.warn(`Email ${adminEmail} already exists but is not an admin. Skipping default admin creation.`)
      return
    }

    const hashedPassword = await encryptPassword(adminPassword)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: Role.ADMIN,
        isEmailVerified: true
      }
    })

    logger.info(`Default admin user created successfully:`)
    logger.info(`  Email: ${adminEmail}`)
    logger.info(`  Password: ${adminPassword}`)
    logger.info(`  ID: ${admin.id}`)
    logger.warn('⚠️  IMPORTANT: Please change the default admin password after first login!')
  } catch (error) {
    logger.error('Error initializing default admin:', error)
  }
}

