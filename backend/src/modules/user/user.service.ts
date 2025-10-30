import { UserModel } from './user.model'
import bcrypt from 'bcrypt'

export const userService = {
  async createUser(data: { name: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10)
    const user = new UserModel({ ...data, password: hashed })
    return await user.save()
  },

  async getAllUsers() {
    return await UserModel.find().select('-password')
  }
}
