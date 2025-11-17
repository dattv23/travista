import { Router } from 'express'
import { reviewController } from './review.controller'
import { validate } from '@/middlewares/validate'
import { reviewSummarySchema } from './review.validation'

export const reviewRouter = Router()

reviewRouter.post('/summary', validate(reviewSummarySchema), reviewController.summary)
