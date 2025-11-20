import { Request, Response } from 'express'
import { plannerService } from './planner.service'
import { IUserInput } from './planner.validation'

export const plannerController = {
  async createItinerary(req: Request, res: Response) {
    try {
      console.log('📥 Received planner request:', JSON.stringify(req.body, null, 2))
      
      const userInput = req.body as IUserInput
      
      console.log('🚀 Starting planner workflow...')
      const summary = await plannerService.executePlannerWorkflow(userInput)
      
      console.log('✅ Planner workflow completed successfully')
      res.status(200).json(summary)
    } catch (error: any) {
      console.error('❌ Planner controller error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.response) {
        console.error('API Response Status:', error.response.status)
        console.error('API Response Data:', JSON.stringify(error.response.data, null, 2))
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create itinerary',
        error: error.response?.data || error.toString()
      })
    }
  }
}
