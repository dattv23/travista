import { z } from 'zod'

// Geocoding validation schema
export const geocodeSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  coordinate: z.string().optional(),
  filter: z.string().optional(),
  language: z.enum(['kor', 'eng']).optional(),
  page: z.number().min(1).optional(),
  count: z.number().min(1).max(100).optional()
})

// Directions validation schema
export const directionsSchema = z.object({
  start: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Start must be in format: longitude,latitude'),
  goal: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Goal must be in format: longitude,latitude'),
  waypoints: z.string().optional(),
  option: z.enum(['trafast', 'tracomfort', 'traoptimal', 'traavoidtoll', 'traavoidcaronly']).optional(),
  cartype: z.number().min(1).max(10).optional(),
  fueltype: z.number().min(1).max(4).optional(),
  mileage: z.number().min(0).optional()
})

