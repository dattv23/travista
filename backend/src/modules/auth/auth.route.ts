import { Router } from 'express'
import passport from 'passport'
import { authController } from './auth.controller'
import { validate } from '../../middlewares/validate'
import { registerSchema, loginSchema } from './auth.validation'

export const authRouter = Router()

// -- Email/Password Routes --
authRouter.post('/register', validate(registerSchema), authController.register)
authRouter.post('/login', validate(loginSchema), authController.login)

// -- Google OAuth Routes --
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login-failed' }), authController.googleCallback)

// -- Session Routes --
authRouter.get('/me', authController.getMe)

authRouter.post('/logout', authController.logout)
