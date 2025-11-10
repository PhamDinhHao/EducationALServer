import { Server } from 'http'
import app from './app'
import prisma from './client'
import config from '@configs/config'
import logger from '@configs/logger'
import { initializeDefaultAdmin } from '@utils/initAdmin'

let server: Server

const PORT = process.env.PORT || config.port || 3000
// blogs.forEach(async (blog) => {
//   await prisma.blog.create({ data: { ...blog, tags: { connectOrCreate: blog.tags?.map((t) => ({ where: { name: t }, create: { name: t } })) } } })
// })

prisma.$connect().then(async () => {
  logger.info('Connected to SQL Database')

  // Initialize default admin user if no admin exists
  await initializeDefaultAdmin()

  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
