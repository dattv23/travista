// planner.controller.ts
import { Request, Response } from 'express'
import { isAxiosError } from 'axios' // 1. Import isAxiosError
import { plannerService } from './planner.service'
import { IUserInput } from './planner.validation'
import { logger } from '@/config/logger'

export const plannerController = {
  async createItinerary(req: Request, res: Response) {
    try {
      const userInput = req.body as IUserInput
      const summary = await plannerService.executePlannerWorkflow(userInput)
      res.status(200).json(summary)
    } catch (error: unknown) {
      logger.error('Controller Error:', error)

      // Default values
      let status = 500
      let message: string = 'Internal Server Error'

      // Axios Error (Network/API errors)
      if (isAxiosError(error)) {
        status = error.response?.status || 500
        message = error.response?.data || error.message
      }
      // Standard JavaScript Error
      else if (error instanceof Error) {
        message = error.message
      }

      res.status(status).json({
        success: false,
        message: 'External API Error',
        details: message
      })
    }
  }
}
