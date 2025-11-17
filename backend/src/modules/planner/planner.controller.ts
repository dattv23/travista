import { Request, Response } from 'express'
import { plannerService } from './planner.service'
import { IUserInput } from './planner.validation'

export const plannerController = {
  async createItinerary(req: Request, res: Response) {
    const userInput = req.body as IUserInput
    const summary = await plannerService.executePlannerWorkflow(userInput)
    res.status(200).json(summary)
  }
}
