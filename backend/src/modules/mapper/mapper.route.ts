import { Router } from 'express'
import { mapperController } from './mapper.controller'

export const mapperRouter = Router()

/**
 * GET /mapper/get-directions
 * Simple route between 2 points or with waypoints
 * Query: ?start=lng,lat&goal=lng,lat&waypoints=lng,lat|lng,lat&option=trafast
 */
mapperRouter.get('/get-directions', mapperController.getDirections)

/**
 * POST /mapper/draw-route
 * Create route through multiple locations
 * Body: { locations: ["lng,lat", "lng,lat", "lng,lat", ...] }
 */
mapperRouter.post('/draw-route', mapperController.drawRoute)

/**
 * POST /mapper/validate-itinerary-duration
 * Validate itinerary duration and distance when adding a new stop
 * Body: {
 *   stopList: ["lng,lat", "lng,lat", ...],
 *   newStop: "lng,lat",
 *   insertAfterIndex: 0,
 *   maxDurationHours: 12,
 *   existingSegmentDurations?: [minutes, ...],
 *   existingSegmentDistances?: [meters, ...]
 * }
 */
mapperRouter.post('/validate-itinerary-duration', mapperController.validateItineraryDuration)