import { Request, Response } from 'express'
import { mapperService } from './mapper.service'

export const mapperController = {
  /**
   * GET /get-directions?start=lng,lat&goal=lng,lat&waypoints=lng,lat|lng,lat&option=trafast
   * Simple 2-point route or route with waypoints
   */
  async getDirections(req: Request, res: Response) {
    try {
      const start = req.query.start as string
      const goal = req.query.goal as string
      const waypoints = req.query.waypoints as string | undefined
      const option = (req.query.option as string) || 'trafast'

      if (!start || !goal) {
        return res.status(400).json({
          success: false,
          message: 'start and goal parameters are required'
        })
      }

      const result = await mapperService.getDirections(start, goal, waypoints, option)
      
      if (result.code !== 0) {
        return res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        })
      }

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get directions',
        error: error.response?.data || error.message
      })
    }
  },

  /**
   * POST /draw-route
   * Body: { locations: ["lng,lat", "lng,lat", ...] }
   * Max 7 locations (start + 5 waypoints + goal)
   */
  async drawRoute(req: Request, res: Response) {
    try {
      const { locations } = req.body

      if (!locations || !Array.isArray(locations) || locations.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'locations array with at least 2 coordinates required'
        })
      }

      if (locations.length > 7) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 7 locations allowed (start + 5 waypoints + goal)'
        })
      }

      const result = await mapperService.createRouteFromLocations(locations)
      
      if (result.code !== 0) {
        return res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        })
      }

      // Extract route data for drawing
      const routeKey = Object.keys(result.route)[0]
      const route = result.route[routeKey][0]

      res.status(200).json({
        success: true,
        data: {
          summary: {
            distance: `${(route.summary.distance / 1000).toFixed(2)} km`,
            duration: `${Math.round(route.summary.duration / 60000)} minutes`,
            tollFare: route.summary.tollFare,
            taxiFare: route.summary.taxiFare,
            fuelPrice: route.summary.fuelPrice
          },
          path: route.path,  // Array of [lng, lat] for drawing
          guide: route.guide, // Turn-by-turn directions
          fullData: result
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create route',
        error: error.response?.data || error.message
      })
    }
  }
}
