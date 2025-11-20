import { Request, Response } from 'express'
import { mapperService } from './mapper.service'

export const mapperController = {
  /**
   * POST /get-directions
   * Body: { start: "lng,lat", goal: "lng,lat", waypoints: "lng,lat|lng,lat", option: "trafast" }
   */
  async getDirections(req: Request, res: Response) {
    try {
      const { start, goal, waypoints, option = 'trafast' } = req.body

      if (!start || !goal) {
        return res.status(400).json({
          success: false,
          message: 'start and goal are required in request body'
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

      console.log('📍 Received draw-route request with locations:', locations)

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
      
      console.log('📦 Received result from Naver API:', JSON.stringify(result, null, 2))

      if (result.code !== 0) {
        console.error('❌ Naver API returned error code:', result.code, result.message)
        return res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        })
      }

      // Extract route data for drawing - with better error handling
      if (!result.route || typeof result.route !== 'object') {
        throw new Error('Invalid route data structure: route object missing')
      }

      const routeKey = Object.keys(result.route)[0]
      if (!routeKey) {
        throw new Error('Invalid route data structure: no route key found')
      }

      const routeArray = result.route[routeKey]
      if (!Array.isArray(routeArray) || routeArray.length === 0) {
        throw new Error('Invalid route data structure: route array is empty or invalid')
      }

      const route = routeArray[0]
      if (!route || !route.summary || !route.path) {
        throw new Error('Invalid route data structure: missing summary or path')
      }

      const responseData = {
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
      }

      console.log('✅ Sending successful response')
      res.status(200).json(responseData)
    } catch (error: any) {
      console.error('❌ Draw-route error:', error)
      console.error('Error stack:', error.stack)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create route',
        error: error.response?.data || error.message
      })
    }
  }
}
