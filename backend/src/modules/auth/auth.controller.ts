import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { IUser } from '../user/user.model'
import { Types } from 'mongoose'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  async googleCallback(req: Request, res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    if (!req.user) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_failed`)
    }
    res.redirect(frontendUrl)
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' })
      }
      const user = req.user as IUser & { _id: Types.ObjectId }
      user.password = undefined
      res.status(200).json({ user })
    } catch (error) {
      next(error)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      res.status(200).json({ message: 'Logged out successfully' })
    })
  }
}
