import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { plannerController } from '@/modules/planner/planner.controller'
import { createItinerarySchema } from '@/modules/planner/planner.validation'

export const plannerRouter = Router()

plannerRouter.post('/create-itinerary', validate(createItinerarySchema), plannerController.createItinerary)
