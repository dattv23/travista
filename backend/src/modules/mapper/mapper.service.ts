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
    const params: any = { start, goal, option }
    if (waypoints) params.waypoints = waypoints

    try {
      const response = await axios.get('https://maps.apigw.ntruss.com/map-direction-15/v1/driving', {
        params,
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID!,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET!
        }
      })
      return response.data
    } catch (error: any) {
      logger.error('Directions API Error', error.response?.data)
      throw error
    }
  },

  async getFormattedRoute(locations: string[]) {
    if (locations.length < 2) return null

    const start = locations[0]
    const goal = locations[locations.length - 1]
    let waypoints: string | undefined
    if (locations.length > 2) {
      const middlePoints = locations.slice(1, -1)
      waypoints = middlePoints.join('|')
    }

    const rawData = await this.getDirections(start, goal, waypoints)

    if (rawData.code !== 0) return null

    logger.info('Naver Full Raw Data Check:', {
      code: rawData.code,
      summaryDuration: rawData.route?.trafast?.[0]?.summary?.duration,
      firstSection: rawData.route?.trafast?.[0]?.section?.[0]
    })

    const routeKey = Object.keys(rawData.route)[0]
    const route = rawData.route[routeKey][0]

    let sections = []
    if (route.section && Array.isArray(route.section)) {
      sections = route.section.map((sec: any, index: number) => {
        const startCoords = locations[index].split(',').map(Number)
        const endCoords = locations[index + 1].split(',').map(Number)

        const durationMs = sec.duration || 0
        const distanceMeters = sec.distance || 0

        logger.info('Duration Ms: ', durationMs)

        return {
          pointIndex: sec.pointIndex,
          start: { lng: startCoords[0], lat: startCoords[1] },
          end: { lng: endCoords[0], lat: endCoords[1] },
          distanceText: `${(distanceMeters / 1000).toFixed(1)} km`,

          durationMinutes: Math.ceil(durationMs / 60000) || 0
        }
      })
    } else {
      const startCoords = locations[0].split(',').map(Number)
      const endCoords = locations[locations.length - 1].split(',').map(Number)

      const totalDurationMs = route.summary.duration || 0
      const totalDistanceMeters = route.summary.distance || 0

      sections = [
        {
          pointIndex: 0,
          start: { lng: startCoords[0], lat: startCoords[1] },
          end: { lng: endCoords[0], lat: endCoords[1] },
          distanceText: `${(totalDistanceMeters / 1000).toFixed(1)} km`,
          durationMinutes: Math.round(totalDurationMs / 60000) || 0
        }
      ]
    }

    const summaryDuration = route.summary.duration || 0

    return {
      summary: {
        distance: `${(route.summary.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(summaryDuration / 60000)} minutes`,
        tollFare: route.summary.tollFare || 0,
        taxiFare: route.summary.taxiFare || 0,
        fuelPrice: route.summary.fuelPrice || 0
      },
      sections: sections,
      path: route.path
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
