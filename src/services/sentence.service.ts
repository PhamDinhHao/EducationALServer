import httpStatus from 'http-status'
import { Sentence, Prisma } from '@prisma/client'

import prisma from '@/client'
import ApiError from '@utils/ApiError'

/**
 * Create a sentence
 * @param {Object} sentenceBody
 * @returns {Promise<Sentence>}
 */
const createSentence = async (userId: number, content: string, name: string): Promise<Sentence> => {
  return prisma.sentence.create({
    data: {
      userId,
      name,
      content
    }
  })
}

/**
 * Query for sentences
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySentences = async <Key extends keyof Sentence>(
  filter: object,
  options: {
    limit?: number
    page?: number
    sortBy?: string
    sortType?: 'asc' | 'desc'
  },
  keys: Key[] = ['id', 'name', 'content', 'createdAt', 'updatedAt'] as Key[]
): Promise<{ data: Pick<Sentence, Key>[]; total: number }> => {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const sortBy = options.sortBy
  const sortType = options.sortType ?? 'desc'

  const total = await prisma.sentence.count({
    where: filter
  })

  const sentences = await prisma.sentence.findMany({
    where: filter,
    select: {
      ...keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  })

  return { data: sentences as any, total }
}

/**
 * Get sentence by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Sentence, Key> | null>}
 */
const getSentenceById = async <Key extends keyof Sentence>(id: number, keys: Key[] = ['id', 'name', 'content', 'createdAt', 'updatedAt'] as Key[]): Promise<Pick<Sentence, Key> | null> => {
  return prisma.sentence.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Sentence, Key> | null>
}

/**
 * Update sentence by id
 * @param {ObjectId} sentenceId
 * @param {Object} updateBody
 * @returns {Promise<Sentence>}
 */
const updateSentenceById = async <Key extends keyof Sentence>(
  sentenceId: number,
  updateBody: Prisma.SentenceUpdateInput,
  keys: Key[] = ['id', 'name', 'content'] as Key[]
): Promise<Pick<Sentence, Key> | null> => {
  const sentence = await getSentenceById(sentenceId, ['id', 'name', 'content'])
  if (!sentence) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sentence not found')
  }
  const updatedSentence = await prisma.sentence.update({
    where: { id: sentence.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  })
  return updatedSentence as Pick<Sentence, Key> | null
}

/**
 * Delete sentence by id
 * @param {ObjectId} sentenceId
 * @returns {Promise<Sentence>}
 */
const deleteSentenceById = async (sentenceId: number): Promise<Sentence> => {
  const sentence = await getSentenceById(sentenceId)
  if (!sentence) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sentence not found')
  }
  await prisma.sentence.delete({ where: { id: sentence.id } })
  return sentence
}

export default {
  createSentence,
  querySentences,
  getSentenceById,
  updateSentenceById,
  deleteSentenceById
}
