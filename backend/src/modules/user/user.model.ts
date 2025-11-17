import { Schema, model } from 'mongoose'

export interface IUser {
  name: string
  email: string
  password?: string
  googleId?: string
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false, unique: true, sparse: true }
  },
  { timestamps: true }
)

export const UserModel = model<IUser>('User', userSchema)
