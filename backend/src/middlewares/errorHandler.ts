/* eslint-disable @typescript-eslint/no-unused-vars */
import { logger } from '@/config/logger'
import { Request, Response, NextFunction } from 'express'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('❌ Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  })
}
