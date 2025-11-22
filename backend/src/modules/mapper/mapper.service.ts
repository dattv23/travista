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
  },

  // Get segment duration and distance from Naver Maps API
  async getSegmentInfo(start: string, goal: string): Promise<{ duration: number; distance: number } | null> {
    try {
      const result = await this.getDirections(start, goal, undefined, 'trafast')
      
      if (result.code !== 0 || !result.route) {
        logger.warn(`Failed to get route for ${start} → ${goal}`)
        return null
      }

      const routeKey = Object.keys(result.route)[0]
      const route = result.route[routeKey]?.[0]
      
      if (!route?.summary) {
        return null
      }

      return {
        duration: Math.round(route.summary.duration / 60000),
        distance: route.summary.distance
      }
    } catch (error) {
      logger.error(`Error calculating segment info ${start} → ${goal}:`, error)
      return null
    }
  },

  // Validate itinerary duration/distance when adding a new stop
  async validateItineraryDuration(
    stopList: string[],
    newStop: string,
    insertAfterIndex: number = 0,
    maxDurationHours: number = 12,
    existingSegmentDurations?: number[],
    existingSegmentDistances?: number[]
  ): Promise<{
    valid: boolean
    totalDurationMinutes: number
    totalDistanceMeters: number
    totalDistanceKm: number
    maxDurationMinutes: number
    exceededByMinutes?: number
    newSegmentDuration?: number
    newSegmentDistanceMeters?: number
    segmentDurations: number[]
    segmentDistances: number[]
    segmentDetails: Array<{ duration: number; distance: number }>
    message: string
  }> {
    const MAX_DURATION_MINUTES = maxDurationHours * 60
    
    logger.info('Validating itinerary duration', {
      stopListLength: stopList.length,
      insertAfterIndex,
      newStop,
      maxDurationHours
    })

    if (stopList.length < 2) {
      throw new Error('Stop list must contain at least 2 stops')
    }

    if (insertAfterIndex < 0 || insertAfterIndex >= stopList.length - 1) {
      throw new Error(`insertAfterIndex must be between 0 and ${stopList.length - 2}`)
    }

    const start = stopList[insertAfterIndex]
    const nextStop = stopList[insertAfterIndex + 1]
    logger.info(`Calculating new route: ${start} → ${newStop} → ${nextStop}`)
    
    let newSegmentDurationMinutes: number | null = null
    let newSegmentDistanceMeters: number | null = null
    try {
      const routeResult = await this.getDirections(start, nextStop, newStop, 'trafast')
      
      if (routeResult.code === 0 && routeResult.route) {
        const routeKey = Object.keys(routeResult.route)[0]
        const route = routeResult.route[routeKey]?.[0]
        
        if (route?.summary) {
          newSegmentDurationMinutes = Math.round(route.summary.duration / 60000)
          newSegmentDistanceMeters = route.summary.distance
          if (newSegmentDistanceMeters !== null) {
            logger.info(`New segment - Duration: ${newSegmentDurationMinutes} minutes, Distance: ${(newSegmentDistanceMeters / 1000).toFixed(2)} km`)
          } else {
            logger.info(`New segment - Duration: ${newSegmentDurationMinutes} minutes, Distance: calculating...`)
          }
        }
      }
    } catch (error) {
      logger.error('Failed to calculate new route with waypoint:', error)
    }

    if (newSegmentDurationMinutes === null || newSegmentDistanceMeters === null) {
      return {
        valid: false,
        totalDurationMinutes: 0,
        totalDistanceMeters: 0,
        totalDistanceKm: 0,
        maxDurationMinutes: MAX_DURATION_MINUTES,
        segmentDurations: [],
        segmentDistances: [],
        segmentDetails: [],
        message: 'Failed to calculate route for new segment. Please try again.',
      }
    }

    const newSegmentDuration = newSegmentDurationMinutes
    const newSegmentDistance = newSegmentDistanceMeters
    const remainingSegmentDurations: number[] = []
    const remainingSegmentDistances: number[] = []
    const remainingSegmentDetails: Array<{ duration: number; distance: number }> = []
    
    if (existingSegmentDurations && existingSegmentDurations.length > 0 && 
        existingSegmentDistances && existingSegmentDistances.length > 0) {
      logger.info('Using provided existing segment durations and distances')
      remainingSegmentDurations.push(...existingSegmentDurations)
      remainingSegmentDistances.push(...existingSegmentDistances)
      for (let i = 0; i < existingSegmentDurations.length; i++) {
        remainingSegmentDetails.push({
          duration: existingSegmentDurations[i],
          distance: existingSegmentDistances[i] || 0
        })
      }
    } else {
      logger.info('Calculating remaining segment durations and distances')
      for (let i = insertAfterIndex + 1; i < stopList.length - 1; i++) {
        const segmentStart = stopList[i]
        const segmentGoal = stopList[i + 1]
        
        const segmentInfo = await this.getSegmentInfo(segmentStart, segmentGoal)
        
        if (segmentInfo !== null) {
          remainingSegmentDurations.push(segmentInfo.duration)
          remainingSegmentDistances.push(segmentInfo.distance)
          remainingSegmentDetails.push(segmentInfo)
        } else {
          logger.warn(`Failed to get info for segment ${segmentStart} → ${segmentGoal}, using estimate`)
          remainingSegmentDurations.push(30)
          remainingSegmentDistances.push(10000)
          remainingSegmentDetails.push({ duration: 30, distance: 10000 })
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const allSegmentDurations = [newSegmentDuration, ...remainingSegmentDurations]
    const allSegmentDistances = [newSegmentDistance, ...remainingSegmentDistances]
    const allSegmentDetails = [
      { duration: newSegmentDuration, distance: newSegmentDistance },
      ...remainingSegmentDetails
    ]
    
    const totalDurationMinutes = allSegmentDurations.reduce((sum, dur) => sum + dur, 0)
    const totalDistanceMeters = allSegmentDistances.reduce((sum, dist) => sum + dist, 0)
    const totalDistanceKm = totalDistanceMeters / 1000

    logger.info('Duration and distance calculation complete', {
      newSegmentDuration: newSegmentDuration,
      newSegmentDistance: `${(newSegmentDistance / 1000).toFixed(2)} km`,
      remainingSegmentDurations,
      remainingSegmentDistances: remainingSegmentDistances.map(d => `${(d / 1000).toFixed(2)} km`),
      totalDurationMinutes,
      totalDistanceKm: totalDistanceKm.toFixed(2),
      maxDurationMinutes: MAX_DURATION_MINUTES
    })

    if (totalDurationMinutes > MAX_DURATION_MINUTES) {
      const exceededBy = totalDurationMinutes - MAX_DURATION_MINUTES
      return {
        valid: false,
        totalDurationMinutes,
        totalDistanceMeters,
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        maxDurationMinutes: MAX_DURATION_MINUTES,
        exceededByMinutes: exceededBy,
        newSegmentDuration: newSegmentDuration,
        newSegmentDistanceMeters: newSegmentDistance,
        segmentDurations: allSegmentDurations,
        segmentDistances: allSegmentDistances,
        segmentDetails: allSegmentDetails,
        message: `Itinerary exceeds time limit of ${maxDurationHours} hours by ${exceededBy} minutes. Total: ${totalDurationMinutes} minutes (${totalDistanceKm.toFixed(2)} km).`,
      }
    }

    return {
      valid: true,
      totalDurationMinutes,
      totalDistanceMeters,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      maxDurationMinutes: MAX_DURATION_MINUTES,
      newSegmentDuration: newSegmentDuration,
      newSegmentDistanceMeters: newSegmentDistance,
      segmentDurations: allSegmentDurations,
      segmentDistances: allSegmentDistances,
      segmentDetails: allSegmentDetails,
      message: `Valid itinerary. Total duration: ${totalDurationMinutes} minutes (${(totalDurationMinutes / 60).toFixed(1)} hours). Total distance: ${totalDistanceKm.toFixed(2)} km.`,
    }
  }
}
