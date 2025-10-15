import express from 'express'
import validate from '@/middlewares/validate'
import planValidation from '@/validations/plan.validation'
import planController from '@/controllers/plan.controller'

const router = express.Router()

// Tạo kế hoạch cá nhân
router.post(
  '/plans',
  validate({ body: planValidation.generatePlan }), // ✅ giống ví dụ lesson
  planController.generatePlan
)

router.post(
  '/initiatives',
  validate({ body: planValidation.generateInitiative }), // ✅
  planController.generateInitiative
)

export default router
