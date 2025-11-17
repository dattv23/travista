import { Router } from 'express'
import { mapperController } from './mapper.controller'

export const mapperRouter = Router()

/**
 * GET /mapper/get-directions?start=lng,lat&goal=lng,lat&option=trafast
 */
mapperRouter.get('/get-directions', mapperController.getDirections)
