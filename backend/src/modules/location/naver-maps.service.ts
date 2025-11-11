import axios from 'axios'
import { logger } from '@/config/logger'

interface Coordinates {
  lat: number
  lng: number
}

interface GeocodeResult {
  address: string
  coordinates: Coordinates
  formattedAddress?: string
  roadAddress?: string
  jibunAddress?: string
  englishAddress?: string
}

interface DirectionsResult {
  origin: Coordinates
  destination: Coordinates
  distance?: string
  duration?: string
  steps?: any[]
  polyline?: string
  rawData?: any
}

/**
 * Naver Cloud Platform Maps Service
 * Documentation: https://api.ncloud-docs.com/docs/en/ai-naver-mapsgeocoding-geocode
 */
export class NaverMapsService {
  private geocodingApiUrl: string
  private directionsApiUrl: string
  private apiKeyId: string
  private apiKey: string

  constructor() {
    // Naver Cloud Platform requires two keys: API Key ID and API Key
    this.geocodingApiUrl = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode'
    this.directionsApiUrl = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving'
 
    this.apiKeyId = process.env.NAVER_MAPS_API_KEY_ID || ''
    this.apiKey = process.env.NAVER_MAPS_API_KEY || ''
  }

  /**
   * Geocoding: Convert address to coordinates
   * @param address - The address to geocode
   * @param language - Response language ('kor' or 'eng')
   * @returns GeocodeResult with coordinates
   */
  async geocode(address: string, language: 'kor' | 'eng' = 'eng'): Promise<GeocodeResult> {
    try {
      logger.info(`[Naver Maps] Geocoding address: ${address}`)

      // Log the request details
      logger.info(`[Naver Maps] Request URL: ${this.geocodingApiUrl}?query=${encodeURIComponent(address)}`)
      logger.info(`[Naver Maps] API Key ID: ${this.apiKeyId ? 'Set' : 'NOT SET'}`)
      logger.info(`[Naver Maps] API Key: ${this.apiKey ? 'Set' : 'NOT SET'}`)

      const response = await axios.get(this.geocodingApiUrl, {
        params: {
          query: address,
          language: language,
          count: 1, // Get top result only
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.apiKeyId,
          'X-NCP-APIGW-API-KEY': this.apiKey,
          Accept: 'application/json',
        },
        timeout: 10000,
      })

      // Log the full response for debugging
      logger.info(`[Naver Maps] Response status: ${response.status}`)
      logger.info(`[Naver Maps] Response data: ${JSON.stringify(response.data)}`)

      // Check response status
      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed with status: ${response.data.status}`)
      }

      // Check if we have results
      if (!response.data.addresses || response.data.addresses.length === 0) {
        throw new Error('No results found for the given address')
      }

      const addressData = response.data.addresses[0]

      const result: GeocodeResult = {
        address: address,
        coordinates: {
          lat: parseFloat(addressData.y),
          lng: parseFloat(addressData.x),
        },
        formattedAddress: addressData.roadAddress || addressData.jibunAddress,
        roadAddress: addressData.roadAddress,
        jibunAddress: addressData.jibunAddress,
        englishAddress: addressData.englishAddress,
      }

      logger.info(`[Naver Maps] Geocoded successfully: lat=${result.coordinates.lat}, lng=${result.coordinates.lng}`)
      return result
    } catch (error) {
      logger.error('[Naver Maps] Geocoding error:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errorMessage || error.message
        throw new Error(`Failed to geocode address: ${errorMessage}`)
      }
      throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reverse Geocoding: Convert coordinates to address
   * @param coordinates - The coordinates to reverse geocode
   * @param language - Response language ('kor' or 'eng')
   * @returns GeocodeResult with address information
   */
  async reverseGeocode(coordinates: Coordinates, language: 'kor' | 'eng' = 'eng'): Promise<GeocodeResult> {
    try {
      logger.info(`[Naver Maps] Reverse geocoding: ${coordinates.lat}, ${coordinates.lng}`)

      // For reverse geocoding, we use the coordinate parameter format
      const coordString = `${coordinates.lng},${coordinates.lat}`

      const response = await axios.get(this.geocodingApiUrl, {
        params: {
          query: coordString,
          coordinate: coordString,
          language: language,
          count: 1,
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.apiKeyId,
          'X-NCP-APIGW-API-KEY': this.apiKey,
          Accept: 'application/json',
        },
        timeout: 10000,
      })

      if (response.data.status !== 'OK' || !response.data.addresses || response.data.addresses.length === 0) {
        throw new Error('No address found for the given coordinates')
      }

      const addressData = response.data.addresses[0]

      const result: GeocodeResult = {
        address: addressData.roadAddress || addressData.jibunAddress || '',
        coordinates: coordinates,
        formattedAddress: addressData.roadAddress || addressData.jibunAddress,
        roadAddress: addressData.roadAddress,
        jibunAddress: addressData.jibunAddress,
        englishAddress: addressData.englishAddress,
      }

      logger.info(`[Naver Maps] Reverse geocoded successfully: ${result.formattedAddress}`)
      return result
    } catch (error) {
      logger.error('[Naver Maps] Reverse geocoding error:', error)
      throw new Error(
        `Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Directions: Get route data between two points
   * @param origin - Starting coordinates
   * @param destination - Ending coordinates
   * @param options - Additional options (waypoints, avoid, etc.)
   * @returns DirectionsResult with route information
   */
  async getDirections(
    origin: Coordinates,
    destination: Coordinates,
    options?: {
      waypoints?: string // Format: "lng1,lat1:lng2,lat2:..."
      avoid?: string // toll, trafficlight, ferry
      option?: string // trafast (fastest), tracomfort (optimal), traoptimal (shortest)
    }
  ): Promise<DirectionsResult> {
    try {
      logger.info(
        `[Naver Maps] Getting directions from [${origin.lat},${origin.lng}] to [${destination.lat},${destination.lng}]`
      )

      // Format: lng,lat (Naver uses lng,lat order)
      const start = `${origin.lng},${origin.lat}`
      const goal = `${destination.lng},${destination.lat}`

      const params: any = {
        start: start,
        goal: goal,
        option: options?.option || 'trafast', // Default to fastest route
      }

      if (options?.waypoints) {
        params.waypoints = options.waypoints
      }

      if (options?.avoid) {
        params.avoid = options.avoid
      }

      const response = await axios.get(this.directionsApiUrl, {
        params: params,
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.apiKeyId,
          'X-NCP-APIGW-API-KEY': this.apiKey,
          Accept: 'application/json',
        },
        timeout: 15000,
      })

      // Check response
      if (response.data.code !== 0) {
        throw new Error(`Directions failed with code: ${response.data.code}, message: ${response.data.message}`)
      }

      if (!response.data.route || !response.data.route.trafast) {
        throw new Error('No route found between the given points')
      }

      // Get the route based on selected option
      const routeType = options?.option || 'trafast'
      const route = response.data.route[routeType]?.[0]

      if (!route) {
        throw new Error('Route data is empty')
      }

      const summary = route.summary

      // Convert distance from meters to km and duration from milliseconds to minutes
      const distanceKm = (summary.distance / 1000).toFixed(1)
      const durationMin = Math.round(summary.duration / 1000 / 60)

      // Extract steps from path
      const steps = route.path?.map((point: any, index: number) => ({
        stepNumber: index + 1,
        coordinates: point,
      }))

      const result: DirectionsResult = {
        origin,
        destination,
        distance: `${distanceKm} km`,
        duration: `${durationMin} mins`,
        steps: steps,
        polyline: route.path, // Array of [lng, lat] coordinates
        rawData: {
          summary: summary,
          route: route,
          fullResponse: response.data,
        },
      }

      logger.info(`[Naver Maps] Directions retrieved: ${result.distance}, ${result.duration}`)
      return result
    } catch (error) {
      logger.error('[Naver Maps] Directions error:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message
        throw new Error(`Failed to get directions: ${errorMessage}`)
      }
      throw new Error(`Failed to get directions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Combined geocode and directions
   * Useful for when you have addresses instead of coordinates
   */
  async getDirectionsByAddress(
    originAddress: string,
    destinationAddress: string,
    options?: {
      avoid?: string
      option?: string
    }
  ): Promise<DirectionsResult> {
    try {
      logger.info(`[Naver Maps] Getting directions by address: ${originAddress} -> ${destinationAddress}`)

      // First geocode both addresses
      const [originGeocode, destinationGeocode] = await Promise.all([
        this.geocode(originAddress),
        this.geocode(destinationAddress),
      ])

      // Then get directions
      return await this.getDirections(originGeocode.coordinates, destinationGeocode.coordinates, options)
    } catch (error) {
      logger.error('[Naver Maps] Get directions by address error:', error)
      throw new Error(
        `Failed to get directions by address: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const naverMapsService = new NaverMapsService()

