import { z } from 'zod'

// Validation schema for coordinates
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Validation schema for geocoding request
export const geocodeSchema = z.object({
  body: z.object({
    address: z.string().min(1, 'Address is required').max(500, 'Address is too long'),
  }),
})

// Validation schema for directions request
export const directionsSchema = z.object({
  body: z.object({
    origin: coordinatesSchema,
    destination: coordinatesSchema,
  }),
})

// Validation schema for directions by address request
export const directionsByAddressSchema = z.object({
  body: z.object({
    originAddress: z.string().min(1, 'Origin address is required').max(500, 'Address is too long'),
    destinationAddress: z.string().min(1, 'Destination address is required').max(500, 'Address is too long'),
  }),
})

export type GeocodeInput = z.infer<typeof geocodeSchema>
export type DirectionsInput = z.infer<typeof directionsSchema>
export type DirectionsByAddressInput = z.infer<typeof directionsByAddressSchema>

