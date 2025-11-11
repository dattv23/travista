import { naverMapsService } from './naver-maps.service'
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
 * Location Service - Wraps Naver Maps API
 * Uses Naver Cloud Platform Maps for geocoding and directions
 */
export class LocationService {
  constructor() {
    // Using Naver Maps Service
    logger.info('Location Service initialized with Naver Maps API')
  }

  /**
   * Geocoding: Convert address to coordinates
   * @param address - The address to geocode
   * @returns GeocodeResult with coordinates
   */
  async geocode(address: string): Promise<GeocodeResult> {
    try {
      logger.info(`Geocoding address: ${address}`)
      return await naverMapsService.geocode(address, 'eng')
    } catch (error) {
      logger.error('Geocoding error:', error)
      throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reverse Geocoding: Convert coordinates to address
   * @param coordinates - The coordinates to reverse geocode
   * @returns GeocodeResult with address information
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
    try {
      logger.info(`Reverse geocoding: ${JSON.stringify(coordinates)}`)
      return await naverMapsService.reverseGeocode(coordinates, 'eng')
    } catch (error) {
      logger.error('Reverse geocoding error:', error)
      throw new Error(
        `Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Directions: Get route data between two points
   * @param origin - Starting coordinates
   * @param destination - Ending coordinates
   * @returns DirectionsResult with route information
   */
  async getDirections(origin: Coordinates, destination: Coordinates): Promise<DirectionsResult> {
    try {
      logger.info(`Getting directions from ${JSON.stringify(origin)} to ${JSON.stringify(destination)}`)
      return await naverMapsService.getDirections(origin, destination, {
        option: 'trafast', // fastest route
      })
    } catch (error) {
      logger.error('Directions error:', error)
      throw new Error(`Failed to get directions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Combined geocode and directions
   * Useful for when you have addresses instead of coordinates
   */
  async getDirectionsByAddress(originAddress: string, destinationAddress: string): Promise<DirectionsResult> {
    try {
      return await naverMapsService.getDirectionsByAddress(originAddress, destinationAddress, {
        option: 'trafast',
      })
    } catch (error) {
      logger.error('Get directions by address error:', error)
      throw new Error(
        `Failed to get directions by address: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const locationService = new LocationService()

