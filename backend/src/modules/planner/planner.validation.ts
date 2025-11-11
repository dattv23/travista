import { z } from 'zod'

export const createItinerarySchema = z.object({
  lat: z.number(),
  lng: z.number()
})
