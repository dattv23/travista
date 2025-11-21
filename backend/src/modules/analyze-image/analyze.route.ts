import { Router } from 'express'
import { analyzeController } from './analyze.controller'
import { validate } from '@/middlewares/validate'
import { analyzeImageSchema } from './analyze.validation'
import multer from 'multer'

// Configure Multer to store files in memory (RAM)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

export const analyzeRouter = Router()

analyzeRouter.post('/image', upload.single('file'), validate(analyzeImageSchema), analyzeController.analyzeImage)
