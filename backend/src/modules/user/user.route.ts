import { Router } from 'express'
import { userController } from './user.controller'
import { validate } from '../../middlewares/validate'
import { createUserSchema } from './user.validation'

export const userRouter = Router()

userRouter.post('/', validate(createUserSchema), userController.create)
userRouter.get('/', userController.getAll)
