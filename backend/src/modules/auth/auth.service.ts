import { Types } from 'mongoose'
import { IUser, UserModel } from '../user/user.model'
import { userService } from '../user/user.service'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { registerSchema, loginSchema } from './auth.validation'

export const authService = {
  async register(data: z.infer<typeof registerSchema>) {
    const existingUser = await UserModel.findOne({ email: data.email })
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const user = await userService.createUser(data)

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!)

    user.password = undefined!
    return { user, token }
  },

  async login(data: z.infer<typeof loginSchema>) {
    const user = await UserModel.findOne({ email: data.email })
    if (!user || !user.password) {
      throw new Error('Invalid email')
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password)
    if (!isPasswordMatch) {
      throw new Error('Invalid password')
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!)

    user.password = undefined!
    return { user, token }
  },

  async findOrCreateGoogleUser(profile: { googleId: string; email: string; name: string }) {
    let user = await UserModel.findOne({ googleId: profile.googleId })
    if (user) {
      return { user }
    }

    user = await UserModel.findOne({ email: profile.email })
    if (user) {
      user.googleId = profile.googleId
      user.name = user.name || profile.name
      await user.save()
      return { user }
    }

    user = await UserModel.create({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name
    })

    return { user }
  },

  /**
   * Generates a JWT for a given user.
   */
  generateJwtForUser(user: IUser & { _id?: Types.ObjectId }) {
    if (!user._id) {
      throw new Error('User ID is missing, cannot generate token.')
    }
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET!)
    user.password = undefined
    return { user, token }
  }
}
