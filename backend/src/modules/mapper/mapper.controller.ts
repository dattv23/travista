import { Request, Response } from 'express'
import { mapperService } from './mapper.service'

export const mapperController = {
  /**
   * GET /get-directions?start=lng,lat&goal=lng,lat&option=trafast
   */
  async getDirections(req: Request, res: Response) {
    try {
      const start = req.query.start as string
      const goal = req.query.goal as string
      const option = (req.query.option as string) || 'trafast'

      if (!start || !goal) {
        return res.status(400).json({
          success: false,
          message: 'start and goal parameters are required'
        })
      }

      const result = await mapperService.getDirections(start, goal, option)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get directions',
        error: error.response?.data || error.message
      })
    }
  }
}
