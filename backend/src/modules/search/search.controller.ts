import { Request, Response, NextFunction } from 'express'
import { searchService } from './search.service'

export const searchController = {
  async location(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword } = req.query as { keyword: string }

      if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2) {
        return res.status(400).json({ 
          success: false,
          message: 'Keyword must be at least 2 characters',
          addresses: []
        })
      }

      const addresses = await searchService.getAddresses(keyword.trim())
      
      res.status(200).json({ 
        success: true,
        addresses: addresses || [],
        count: addresses?.length || 0
      })
    } catch (error: any) {
      console.error('Search controller error:', error)
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to search location',
        addresses: []
      })
    }
  }
}
