// planner.controller.ts
import { Request, Response } from 'express'
import { plannerService } from './planner.service'
import { IUserInput } from './planner.validation'
import { logger } from '@/config/logger'

export const plannerController = {
  async createItinerary(req: Request, res: Response) {
    try {
      const userInput = req.body as IUserInput
      const summary = await plannerService.executePlannerWorkflow(userInput)
      res.status(200).json(summary)
    } catch (error: any) {
      // Log the detailed error on the server so you can see WHICH API failed
      logger.error('Controller Error:', error)

      // If it's an Axios error (from Kakao/Naver), it will have a response status
      const status = error.response?.status || 500
      const message = error.response?.data || error.message || 'Internal Server Error'

      res.status(status).json({
        success: false,
        message: 'External API Error',
        details: message
      })
    }
  }
}