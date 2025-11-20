import axios from 'axios'
import { logger } from '@/config/logger'

export const mapperService = {
  /**
   * Get driving directions with waypoints - EXACT copy from test-waypoints-direct.js
   * start: "lng,lat"
   * goal: "lng,lat" 
   * waypoints: "lng,lat|lng,lat|lng,lat" (up to 5, separated by |)
   * option: 'trafast' | 'traoptimal' | 'tracomfort' | 'traavoidtoll' | 'traavoidcaronly'
   */
  async getDirections(start: string, goal: string, waypoints?: string, option: string = 'trafast') {
    // Check environment variables
    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      const missingVars = []
      if (!process.env.NAVER_MAPS_CLIENT_ID) missingVars.push('NAVER_MAPS_CLIENT_ID')
      if (!process.env.NAVER_MAPS_CLIENT_SECRET) missingVars.push('NAVER_MAPS_CLIENT_SECRET')
      logger.error(`❌ Missing environment variables: ${missingVars.join(', ')}`)
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }

    logger.info(`Getting directions: ${start} -> ${goal}`)
    if (waypoints) {
      logger.info(`Via waypoints: ${waypoints}`)
    }

    const params: any = { 
      start,
      goal,
      option
    }

    if (waypoints) {
      params.waypoints = waypoints
    }

    try {
      logger.info('Making request to Naver Maps API...')
      const response = await axios.get('https://maps.apigw.ntruss.com/map-direction-15/v1/driving', {
        params,
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID!,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET!
        }
      })

      logger.info(`✅ Route found - Code: ${response.data.code}, Message: ${response.data.message}`)
      return response.data
    } catch (error: any) {
      logger.error('❌ Directions API Error:')
      logger.error('Status:', error.response?.status)
      logger.error('Status Text:', error.response?.statusText)
      logger.error('Data:', JSON.stringify(error.response?.data, null, 2))
      if (error.response?.status === 401) {
        logger.error('⚠️ Authentication failed - check your API keys!')
      }
      throw error
    }
  },

  /**
   * Create route through multiple locations
   * Takes array of "lng,lat" strings and creates route with waypoints
   * Max 7 locations: start + 5 waypoints + goal
   */
  async createRouteFromLocations(locations: string[]) {
    if (locations.length < 2) {
      throw new Error('Need at least 2 locations')
    }

    if (locations.length > 7) {
      throw new Error('Maximum 7 locations (start + 5 waypoints + goal)')
    }

    const start = locations[0]
    const goal = locations[locations.length - 1]
    
    logger.info(`Creating route through ${locations.length} locations`)
    
    let waypoints: string | undefined
    if (locations.length > 2) {
      const middlePoints = locations.slice(1, -1)
      waypoints = middlePoints.join('|')
    }

    return this.getDirections(start, goal, waypoints)
  }
}
