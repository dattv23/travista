import { Router } from 'express'
import { searchController } from './search.controller'

export const searchRouter = Router()

// Test route to verify router is working
searchRouter.get('/', (req, res) => {
  res.json({ message: 'Search router is working', routes: ['/location'] })
})

// Search location route
searchRouter.get('/location', searchController.location)
