import { Request, Response } from 'express'
import { searchService } from './search.service'

export const searchController = {
  async location(req: Request, res: Response) {
    const { keyword } = req.query as { keyword: string }
    const addresses = await searchService.getAddresses(keyword)
    res.status(200).json({ addresses })
  }
}
