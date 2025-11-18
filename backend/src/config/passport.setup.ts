import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { UserModel } from '@/modules/user/user.model'
import { authService } from '@/modules/auth/auth.service'

passport.serializeUser((user: any, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0]) {
          return done(new Error('No email found from Google profile'))
        }

        const email = profile.emails[0].value
        const name = profile.displayName
        const googleId = profile.id

        const { user } = await authService.findOrCreateGoogleUser({
          email,
          name,
          googleId
        })
        done(null, user)
      } catch (err) {
        done(err as Error)
      }
    }
  )
)
