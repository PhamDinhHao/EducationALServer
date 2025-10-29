import express from 'express'

import userRoute from './user.route'
import authRoute from './auth.route'
import assetRoute from './asset.route'
import templateRoute from './template.route'
import sentenceRoute from './sentence.route'
import geminiRoute from './gemini.route'
import planRoute from './plan.route'
import exerciseRoute from './exercise.route'

import aiRoute from './ai.route'
import commentRoute from './comment.routes'
import lessonRoute from './lesson.routes'
import courseRoute from './course.routes'
import courseTypeRoute from './courseType.routes'
import enrollmentRoute from './enrollment.routes'
import progressRoute from './progress.routes'

const router = express.Router()

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route is working!' })
})

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/templates',
    route: templateRoute
  },
  {
    path: '/assets',
    route: assetRoute
  },
  {
    path: '/sentences',
    route: sentenceRoute
  },
  {
    path: '/gemini',
    route: geminiRoute
  },
  {
    path: '/plan',
    route: planRoute
  },
  {
    path: '/exercise',
    route: exerciseRoute
  },
  { path: '/ai', route: aiRoute },
  { path: '/comment', route: commentRoute },
  { path: '/lessons', route: lessonRoute },
  { path: '/courses', route: courseRoute },
  { path: '/course-types', route: courseTypeRoute },
  { path: '/enrollments', route: enrollmentRoute },
  { path: '/progress', route: progressRoute },
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
