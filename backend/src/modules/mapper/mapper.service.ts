import axios from 'axios'
import { logger } from '@/config/logger'

export const mapperService = {
  /**
   * Get driving directions to draw route on map
   * Works with single destination or multiple waypoints
   */
  async getDirections(start: string, goal: string, waypoints?: string, option: string = 'trafast') {
    logger.info(`Getting directions: ${start} -> ${goal}${waypoints ? ` via ${waypoints}` : ''}`)

    const params: any = { 
      start,
      goal,
      option
    }

    // Add waypoints if provided (up to 5 waypoints allowed)
    if (waypoints) {
      params.waypoints = waypoints
    }

    try {
      const response = await axios.get('https://maps.apigw.ntruss.com/map-direction-15/v1/driving', {
        params,
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID!,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET!
        }
      })

      logger.info(`✅ Route found - Code: ${response.data.code}`)
      return response.data
    } catch (error: any) {
      logger.error('❌ Directions API Error Details:')
      logger.error('Status:', error.response?.status)
      logger.error('Data:', JSON.stringify(error.response?.data, null, 2))
      logger.error('Request params:', JSON.stringify(params, null, 2))
      throw error
    }
  },

  /**
   * Parse locations array and create route
   * Takes array of coordinates and creates a route through all of them
   */
  async createRouteFromLocations(locations: string[]) {
    if (locations.length < 2) {
      throw new Error('Need at least 2 locations to create a route')
    }

    const start = locations[0]
    const goal = locations[locations.length - 1]
    
    logger.info(`Creating route: ${locations.length} locations`)
    logger.info(`Start: ${start}`)
    logger.info(`Goal: ${goal}`)
    
    // Middle locations become waypoints (max 5)
    let waypoints: string | undefined
    if (locations.length > 2) {
      const middlePoints = locations.slice(1, -1).slice(0, 5) // Max 5 waypoints
      waypoints = middlePoints.join('|')
      logger.info(`Waypoints: ${waypoints}`)
    }

    return this.getDirections(start, goal, waypoints)
  }
}
