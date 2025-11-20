import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { connectDatabase } from '@/database/connection'
import { errorHandler } from '@/middlewares/errorHandler'
import { userRouter } from '@/modules/user/user.route'
import { authRouter } from './modules/auth/auth.route'
import { searchRouter } from './modules/search/search.route'

import '@/config/passport.setup'
import { plannerRouter } from '@/modules/planner/planner.route'
import { mapperRouter } from '@/modules/mapper/mapper.route'
import { reviewRouter } from '@/modules/review/review.route'
import MongoStore from 'connect-mongo'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)

// Security & performance middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(morgan('dev'))

// Connect to MongoDB
connectDatabase()

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/planner', plannerRouter)
app.use('/api/mapper', mapperRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/search', searchRouter)

// Global error handler
app.use(errorHandler)

export default app
