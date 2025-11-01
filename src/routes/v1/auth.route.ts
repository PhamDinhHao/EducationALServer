import express from 'express'

import auth from '@/middlewares/auth'
import validate from '@middlewares/validate'

import { authValidation } from '@/validations'
import { authController } from '@/controllers'

const router = express.Router()

router.post('/register', validate(authValidation.register), authController.register)
router.post('/login', validate(authValidation.login), authController.login)
router.post('/logout', authController.logout)
router.post('/refresh-tokens', authController.refreshTokens)
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword)
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword)
router.post('/send-verification-email', auth(), authController.sendVerificationEmail)
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail)
router.get('/me', auth(), authController.getMe)
router.put('/me', auth(), authController.updateMe)
router.put('/change-password', auth(), authController.changePassword)

export default router
