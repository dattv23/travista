import { Request, Response } from 'express'
import { reviewService } from './review.service'

export const reviewController = {
  async summary(req: Request, res: Response) {
    const summary = await reviewService.summary(req.body)
    res.status(201).json(summary)
  }
}
