import { Schema, model, Document } from 'mongoose'

export interface IMapperDocument extends Document {
  // Define your mapper document interface here
  createdAt: Date
  updatedAt: Date
}

const mapperSchema = new Schema<IMapperDocument>(
  {
    // Define your schema fields here
  },
  { timestamps: true }
)

export const Mapper = model<IMapperDocument>('Mapper', mapperSchema)

