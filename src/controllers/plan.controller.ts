import catchAsync from '@/utils/catchAsync'
import planService from '@/services/plan.service'

const generatePlan = catchAsync(async (req, res) => {
  const plan = await planService.generatePlan(req.body)
  res.json({ result: plan })
})

const generateInitiative = catchAsync(async (req, res) => {
  const initiative = await planService.generateInitiative(req.body)
  res.json({ result: initiative })
})

export default {
  generatePlan,
  generateInitiative
}
