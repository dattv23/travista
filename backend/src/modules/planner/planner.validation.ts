import { z } from 'zod'

export const coordinatesSchema = z.object({
  lat: z.number({ error: 'Latitude is required' }).min(-90).max(90),
  lng: z
    .number({
      error: 'Longitude must be a number'
    })
    .min(-180)
    .max(180)
})

export const userInputSchema = z.object({
  destination: coordinatesSchema,
  startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Start date must be a valid date string'),
  numberOfDays: z
    .number({
      error: 'Number of days must be a number'
    })
    .int()
    .min(1, 'Number of days must be at least 1')
    .max(30, 'Number of days must be at most 30'),
  people: z.string().min(1, 'People field cannot be empty'),
  budget: z.string().min(1, 'Budget field cannot be empty'),
  theme: z.string().min(1, 'Theme cannot be empty')
})

export type IUserInput = z.infer<typeof userInputSchema>
