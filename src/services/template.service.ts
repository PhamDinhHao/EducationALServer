import httpStatus from 'http-status'
import { Template, Prisma, TemplateType } from '@prisma/client'

import prisma from '@/client'
import ApiError from '@utils/ApiError'
// import { uploadService } from '@/services'

/**
 * Create a template
 * @param {Object} templateBody
 * @returns {Promise<Template>}
 */
const createTemplate = async (userId: number, name: string, content: string, type: TemplateType): Promise<Template> => {
  let imageUrl
  if (type === TemplateType.HTML) {
    // const image = await convertHtmlToImage(content)
    // imageUrl = await uploadService.uploadImage('templates', image)
    imageUrl = ''
  }
  return prisma.template.create({
    data: {
      userId,
      name,
      content,
      image: imageUrl,
      type
    }
  })
}

/**
 * Query for templates
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTemplates = async <Key extends keyof Template>(
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  },
  keys: Key[] = ['id', 'userId', 'name', 'content', 'image', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<Template, Key>[]> => {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const sortBy = options.sortBy
  const sortType = options.sortType ?? 'desc'
  const templates = await prisma.template.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  })
  return templates as Pick<Template, Key>[]
}

/**
 * Get template by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Template, Key> | null>}
 */
const getTemplateById = async <Key extends keyof Template>(id: number, keys: Key[] = ['id', 'name', 'content', 'type', 'createdAt', 'updatedAt'] as Key[]): Promise<Pick<Template, Key> | null> => {
  return prisma.template.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Template, Key> | null>
}

/**
 * Update template by id
 * @param {ObjectId} templateId
 * @param {Object} updateBody
 * @returns {Promise<Template>}
 */
const updateTemplateById = async <Key extends keyof Template>(
  templateId: number,
  updateBody: Prisma.TemplateUpdateInput,
  keys: Key[] = ['id', 'content', 'name', 'type'] as Key[]
): Promise<Pick<Template, Key> | null> => {
  const template = await getTemplateById(templateId, ['id', 'content', 'name', 'type'])
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  // Update image if new content is provided for HTML templates (if it exists)
  let imageUrl
  const content = updateBody.content
  if (template.type === TemplateType.HTML && content) {
    // const image = await convertHtmlToImage(html!)
    // imageUrl = await uploadService.uploadImage('templates', image)
    imageUrl = ''
  }

  const updatedTemplate = await prisma.template.update({
    where: { id: template.id },
    data: { ...updateBody, image: imageUrl },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  })
  return updatedTemplate as Pick<Template, Key> | null
}

/**
 * Delete template by id
 * @param {ObjectId} templateId
 * @returns {Promise<Template>}
 */
const deleteTemplateById = async (templateId: number): Promise<Template> => {
  const template = await getTemplateById(templateId)
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found')
  }
  await prisma.template.delete({ where: { id: template.id } })
  return template
}

export default {
  createTemplate,
  queryTemplates,
  getTemplateById,
  updateTemplateById,
  deleteTemplateById
}
