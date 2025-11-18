import { Router } from 'express'
import { mapperController } from './mapper.controller'

export const mapperRouter = Router()

/**
 * POST /mapper/get-directions
 * Simple route between 2 points or with waypoints
 * Body: { start: "lng,lat", goal: "lng,lat", waypoints: "lng,lat|lng,lat", option: "trafast" }
 */
mapperRouter.post('/get-directions', mapperController.getDirections)

/**
 * POST /mapper/draw-route
 * Create route through multiple locations
 * Body: { locations: ["lng,lat", "lng,lat", "lng,lat", ...] }
 */
mapperRouter.post('/draw-route', mapperController.drawRoute)
