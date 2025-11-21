import { z } from 'zod'

export const analyzeImageSchema = z.object({
  prompt: z.string().optional()
})
