import { Schema, model, Document } from 'mongoose'

export interface IRouteCache extends Document {
  startLat: number
  startLng: number
  goalLat: number
  goalLng: number
  distance: number
  duration: number
  createdAt: Date
  updatedAt: Date
}

const routeCacheSchema = new Schema<IRouteCache>(
  {
    startLat: { type: Number, required: true, index: true },
    startLng: { type: Number, required: true, index: true },
    goalLat: { type: Number, required: true, index: true },
    goalLng: { type: Number, required: true, index: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
)

// Compound index for fast lookup
routeCacheSchema.index({ startLat: 1, startLng: 1, goalLat: 1, goalLng: 1 }, { unique: true })

export const RouteCache = model<IRouteCache>('RouteCache', routeCacheSchema)