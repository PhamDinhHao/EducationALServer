import _ from 'lodash'
import httpStatus from 'http-status'
import { User } from '@prisma/client'

import ApiError from '@utils/ApiError'
import catchAsync from '@utils/catchAsync'

import { templateService } from '@/services'
import { TQueryTemplates } from '@/validations/template.validation'

const createTemplate = catchAsync(async (req, res) => {
  const user = req.user as User
  const { name, content, type } = req.body
  const template = await templateService.createTemplate(user.id, name, content, type)
  res.status(httpStatus.CREATED).send(template)
})

const getTemplates = catchAsync(async (req, res) => {
  const query: TQueryTemplates = req.query
  const filter = _.pick(query, ['type'])
  const options = _.pick(query, ['sortBy', 'limit', 'page'])
  const result = await templateService.queryTemplates(filter, options)
  res.send(result)
})

const getUserTemplates = catchAsync(async (req, res) => {
  const user = req.user as User
  const query: TQueryTemplates = { ...req.query, userId: user.id }
  const filter = _.pick(query, ['type', 'userId'])
  const options = _.pick(query, ['sortBy', 'limit', 'page'])
  const result = await templateService.queryTemplates(filter, options)
  res.send(result)
})

const getTemplate = catchAsync(async (req, res) => {
  const template = await templateService.getTemplateById(req.params.templateId)
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  res.send(template)
})

const updateTemplate = catchAsync(async (req, res) => {
  const template = await templateService.updateTemplateById(req.params.templateId, req.body)
  res.send(template)
})

const deleteTemplate = catchAsync(async (req, res) => {
  await templateService.deleteTemplateById(req.params.templateId)
  res.status(httpStatus.NO_CONTENT).send()
})

export default {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getUserTemplates
}
