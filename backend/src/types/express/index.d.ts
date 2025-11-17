import { IUser } from '@/modules/user/user.model'
import { Types } from 'mongoose'

declare global {
  namespace Express {
    export interface User extends IUser {
      _id?: Types.ObjectId
    }
  }
}
