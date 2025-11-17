import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { plannerController } from '@/modules/planner/planner.controller'
import { userInputSchema } from './planner.validation'

export const plannerRouter = Router()

plannerRouter.post('/create-itinerary', validate(userInputSchema), plannerController.createItinerary)
