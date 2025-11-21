import { Request, Response, NextFunction } from 'express'
import { searchService } from './search.service'

export const searchController = {
  async location(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword } = req.query as { keyword: string }
      
      if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
        return res.status(400).json({ message: 'Keyword parameter is required' })
      }

      const addresses = await searchService.getAddresses(keyword.trim())
      res.status(200).json({ addresses })
    } catch (error) {
      next(error)
    }
  }
}
