import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { connectDatabase } from '@/database/connection'
import { errorHandler } from '@/middlewares/errorHandler'
import { userRouter } from '@/modules/user/user.route'
import { plannerRouter } from '@/modules/planner/planner.route'

const app = express()

// Security & performance middlewares
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(morgan('dev'))

// Connect to MongoDB
connectDatabase()

// Routes
app.use('/api/users', userRouter)
app.use('/api/planner', plannerRouter)

// Global error handler
app.use(errorHandler)

export default app
