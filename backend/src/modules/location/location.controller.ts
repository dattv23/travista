import { Request, Response, NextFunction } from 'express'
import { locationService } from './location.service'
import { logger } from '@/config/logger'

export class LocationController {
  /**
   * POST /api/location/geocode
   * Geocode an address to get coordinates
   */
  async geocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address } = req.body

      const result = await locationService.geocode(address)

      res.status(200).json({
        success: true,
        data: result,
        message: 'Address geocoded successfully',
      })
    } catch (error) {
      logger.error('Geocode controller error:', error)
      next(error)
    }
  }

  /**
   * POST /api/location/directions
   * Get directions between two coordinate points
   */
  async getDirections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { origin, destination } = req.body

      const result = await locationService.getDirections(origin, destination)

      res.status(200).json({
        success: true,
        data: result,
        message: 'Directions retrieved successfully',
      })
    } catch (error) {
      logger.error('Get directions controller error:', error)
      next(error)
    }
  }

  /**
   * POST /api/location/directions-by-address
   * Get directions between two addresses (geocodes them first)
   */
  async getDirectionsByAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { originAddress, destinationAddress } = req.body

      const result = await locationService.getDirectionsByAddress(originAddress, destinationAddress)

      res.status(200).json({
        success: true,
        data: result,
        message: 'Directions by address retrieved successfully',
      })
    } catch (error) {
      logger.error('Get directions by address controller error:', error)
      next(error)
    }
  }
}

export const locationController = new LocationController()

