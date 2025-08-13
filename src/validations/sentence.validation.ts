import z from 'zod'

const createSentence = {
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    content: z.string().min(1, { message: 'Content is required' })
  })
}

const getSentences = {
  query: z.object({
    sortBy: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional()
  })
}
export type TQuerySentences = z.infer<typeof getSentences.query>

const getSentence = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
}

const updateSentence = {
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z
    .object({
      name: z.string().optional(),
      content: z.string().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
}

const deleteSentence = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
}

export default {
  createSentence,
  getSentences,
  getSentence,
  updateSentence,
  deleteSentence
}
