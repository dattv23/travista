import { z } from 'zod'

export const reviewSummarySchema = z.object({
  locationName: z.string().min(2)
})
