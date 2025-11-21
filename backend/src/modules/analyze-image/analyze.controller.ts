import { Request, Response } from 'express'
import { AxiosError } from 'axios' // 1. Import this
import { analyzeService } from './analyze.service'

export const analyzeController = {
  async analyzeImage(req: Request, res: Response) {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ message: 'No image file provided' })
      }

      const base64Image = file.buffer.toString('base64')
      const result = await analyzeService.analyzeImageWithAI(base64Image, file.mimetype)

      res.status(200).json(result)
    } catch (error) {
      // 3. Cast error to AxiosError to safely access .response and .data
      const err = error as AxiosError

      res.status(500).json({
        message: err.message || 'Internal Server Error',
        details: err.response?.data // TypeScript now knows this exists
      })
    }
  }
}
