import { Request, Response, NextFunction } from 'express'
import { searchService } from './search.service'

export const searchController = {
  async location(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword } = req.query as { keyword: string }

      if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2) {
        return res.status(400).json({ message: 'Keyword must be at least 2 characters' })
      }

      const addresses = await searchService.getAddresses(keyword.trim())
      res.status(200).json({ addresses })
    } catch (error) {
      next(error)
    }
  }
}
