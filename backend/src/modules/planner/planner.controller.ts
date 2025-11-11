import { Request, Response } from 'express'
import { plannerService } from './planner.service'

export const plannerController = {
  async createItinerary(req: Request, res: Response) {
    const { lat, lng } = req.body
    const summary = await plannerService.executePlannerWorkflow(lat, lng)
    res.status(200).json(summary)
  }
}
