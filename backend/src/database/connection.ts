import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || ''

    // Skip MongoDB if no URI provided
    if (!uri) {
      console.log('⚠️  MongoDB URI not provided, skipping database connection')
      return
    }

    await mongoose.connect(uri)
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.error('❌ MongoDB connection failed', err)
    console.log('⚠️  Server will continue without database (location API still works)')
    // Don't exit - allow server to run without MongoDB for location API testing
  }
}
