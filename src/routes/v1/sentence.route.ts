import { sentenceController } from '@/controllers'
import auth from '@/middlewares/auth'
import validate from '@/middlewares/validate'
import { sentenceValidation } from '@/validations'
import express from 'express'

const router = express.Router()

router.route('/').get(auth(), validate(sentenceValidation.getSentences), sentenceController.getSentences).post(auth(), validate(sentenceValidation.createSentence), sentenceController.createSentence)

router
  .route('/:id')
  .get(auth(), validate(sentenceValidation.getSentence), sentenceController.getSentence)
  .patch(auth(), validate(sentenceValidation.updateSentence), sentenceController.updateSentence)
  .delete(auth(), validate(sentenceValidation.deleteSentence), sentenceController.deleteSentence)

export default router
