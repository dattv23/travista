import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || ''

    await mongoose.connect(uri)
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.error('❌ MongoDB connection failed', err)
    process.exit(1)
  }
}
