import { Router } from 'express'
import { locationController } from './location.controller'
import { validate } from '@/middlewares/validate'
import { geocodeSchema, directionsSchema, directionsByAddressSchema } from './location.validation'

const router = Router()

/**
 * @route   POST /api/location/geocode
 * @desc    Convert address to coordinates
 * @body    { address: string }
 */
router.post('/geocode', validate(geocodeSchema), (req, res, next) => locationController.geocode(req, res, next))

/**
 * @route   POST /api/location/directions
 * @desc    Get route directions between two coordinate points
 * @body    { origin: { lat, lng }, destination: { lat, lng } }
 */
router.post('/directions', validate(directionsSchema), (req, res, next) =>
  locationController.getDirections(req, res, next)
)

/**
 * @route   POST /api/location/directions-by-address
 * @desc    Get route directions between two addresses
 * @body    { originAddress: string, destinationAddress: string }
 */
router.post('/directions-by-address', validate(directionsByAddressSchema), (req, res, next) =>
  locationController.getDirectionsByAddress(req, res, next)
)

export { router as locationRouter }

