import { Request, Response } from 'express'
import { userService } from './user.service'

export const userController = {
  async create(req: Request, res: Response) {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  },

  async getAll(req: Request, res: Response) {
    const users = await userService.getAllUsers()
    res.json(users)
  }
}
