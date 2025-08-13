import z from 'zod'
import { TemplateType } from '@prisma/client'

const createTemplate = {
  body: z.object({
    name: z.string(),
    content: z.string(),
    type: z.nativeEnum(TemplateType)
  })
} as const

const getTemplates = {
  query: z.object({
    userId: z.number().optional(),
    type: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional()
  })
} as const

export type TQueryTemplates = z.infer<typeof getTemplates.query>

const getTemplate = {
  params: z.object({
    templateId: z.coerce.number().int().positive()
  })
} as const

const updateTemplate = {
  params: z.object({
    templateId: z.coerce.number().int().positive()
  }),
  body: z
    .object({
      name: z.string().optional(),
      content: z.string().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
} as const

const deleteTemplate = {
  params: z.object({
    templateId: z.coerce.number().int().positive()
  })
} as const

export default {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate
}
