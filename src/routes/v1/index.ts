import express from 'express'

import userRoute from './user.route'
import authRoute from './auth.route'
import assetRoute from './asset.route'
import templateRoute from './template.route'
import sentenceRoute from './sentence.route'
import courseRoutes from './course.route' // chú ý: courseRoutes (plural) giống với export default
import fieldRoutes from './field.route'
import lessonRoutes from './lesson.routes'
import commentRoutes from './comment.routes'
import geminiRoute from './gemini.route'
import lessonRoute from './lesson.route'
import planRoute from './plan.route'
import exerciseRoute from './exercise.route'

import aiRoute from './ai.route'

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
    path: '/lessons',
    route: lessonRoute
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
  {
    path: '/courses', // <-- thêm course route
    route: courseRoutes
  },
  {
    path: '/field', // <-- thêm course route
    route: fieldRoutes
  },
  {
    path: '/lesson', // <-- thêm course route
    route: lessonRoutes
  },
  {
    path: '/comment', // <-- thêm course route
    route: commentRoutes
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
