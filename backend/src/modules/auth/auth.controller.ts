import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { IUser, UserModel } from '../user/user.model'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongoose'

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
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000'

    if (!req.user) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_failed`)
    }

    const user = req.user as IUser & { _id?: ObjectId }

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err)
        return res.redirect(`${frontendUrl}/auth/login?error=session_save_failed`)
      }
      const token = jwt.sign({ id: user!._id, email: user.email }, process.env.JWT_SECRET!)
      res.redirect(`${frontendUrl}/auth/login?token=${token}`)
    })
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationHeader = req.headers.authorization
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authenticated' })
      }

      const token = authorizationHeader.split(' ')[1]

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string }

      const user = await UserModel.findById(payload.id)

      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' })
      }

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
