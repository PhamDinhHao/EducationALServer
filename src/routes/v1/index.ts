import express from 'express'

import userRoute from './user.route'
import authRoute from './auth.route'
import assetRoute from './asset.route'
import templateRoute from './template.route'
import sentenceRoute from './sentence.route'
import aiRoute from './ai.route'

const router = express.Router()

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route is working!' })
})

const defaultRoutes = [
  { path: '/auth', route: authRoute },
  { path: '/users', route: userRoute },
  { path: '/templates', route: templateRoute },
  { path: '/assets', route: assetRoute },
  { path: '/sentences', route: sentenceRoute },
  { path: '/ai', route: aiRoute }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
