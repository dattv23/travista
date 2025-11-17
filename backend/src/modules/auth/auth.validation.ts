import { z } from 'zod'

export { createUserSchema as registerSchema } from '../user/user.validation'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string()
})
