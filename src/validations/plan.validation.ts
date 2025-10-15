import { z } from 'zod'

const generatePlan = z.object({
  subject: z.string().min(1, 'Môn học không được để trống'),
  year: z.string().min(1, 'Năm học không được để trống'),
  school: z.string().min(1, 'Tên trường không được để trống'),
  class: z.string().min(1, 'Tên lớp không được để trống'),
  role: z.string().optional(),
  tasks: z.array(z.string()).optional()
})

const generateInitiative = z.object({
  subject: z.string().min(1, 'Môn học không được để trống'),
  school: z.string().min(1, 'Tên trường không được để trống'),
  position: z.string().min(1, 'Chức vụ không được để trống'),
  fullname: z.string().min(1, 'Họ và tên không được để trống'),
  field: z.string().min(1, 'Lĩnh vực không được để trống'),
  title: z.string().min(1, 'Chủ đề/đề tài không được để trống')
})

export default {
  generatePlan,
  generateInitiative
}
