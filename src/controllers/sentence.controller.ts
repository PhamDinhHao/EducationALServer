import _ from 'lodash'
import httpStatus from 'http-status'
import { User } from '@prisma/client'
import { Request, Response } from 'express'

import ApiError from '@/utils/ApiError'
import catchAsync from '@/utils/catchAsync'
import sentenceService from '@/services/sentence.service'
import { TQuerySentences } from '@/validations/sentence.validation'

const createSentence = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User
  const { name, content } = req.body
  const data = await sentenceService.createSentence(user.id, name, content)
  res.status(httpStatus.CREATED).json(data)
})

const getSentences = catchAsync(async (req: Request, res: Response) => {
  const query: TQuerySentences = req.query
  const options = _.pick(query, ['sortBy', 'limit', 'page'])
  const data = await sentenceService.querySentences({}, options)
  res.send(data)
})

const getSentence = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = await sentenceService.getSentenceById(+id)
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sentence not found')
  }
  res.status(httpStatus.OK).json(data)
})

const updateSentence = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, content } = req.body
  const data = await sentenceService.updateSentenceById(+id, { name, content })
  res.status(httpStatus.OK).json(data)
})

const deleteSentence = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  await sentenceService.deleteSentenceById(+id)
  res.status(httpStatus.NO_CONTENT).send()
})

export default {
  createSentence,
  getSentences,
  getSentence,
  updateSentence,
  deleteSentence
}
