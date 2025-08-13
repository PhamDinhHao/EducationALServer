import express from 'express'

import auth from '@middlewares/auth'
import validate from '@middlewares/validate'

import { templateController } from '@/controllers'
import { templateValidation } from '@/validations'

const router = express.Router()

router
  .route('/')
  .get(auth(), validate(templateValidation.getTemplates), templateController.getUserTemplates)
  .post(auth(), validate(templateValidation.createTemplate), templateController.createTemplate)

router
  .route('/:templateId')
  .get(auth(), validate(templateValidation.getTemplate), templateController.getTemplate)
  .put(auth(), validate(templateValidation.updateTemplate), templateController.updateTemplate)
  .delete(auth(), validate(templateValidation.deleteTemplate), templateController.deleteTemplate)

export default router
