import { Schema, model, Document } from 'mongoose'
import type { IPlace, IRestaurant, IDestinationRoute, IRestaurantRoute } from './planner.type'
import { IUserInput } from './planner.validation'

export interface IItineraryDocument extends Document {
  userId: string
  userInput: IUserInput
  places: IPlace[]
  restaurants: IRestaurant[]
  userDestinationMatrix: Array<{
    name: string
    distance: number
    duration: number
  }>
  destinationMatrix: IDestinationRoute[]
  restaurantDestinationMatrix: IRestaurantRoute[]
  itinerary: string
  createdAt: Date
  updatedAt: Date
  routeData?: {
    summary: {
      distance: string
      duration: string
      taxiFare: number
    }
    sections: Array<{
      start: { lat: number; lng: number }
      end: { lat: number; lng: number }
      distanceText: string
      durationMinutes: number
      path: [[Number]]
    }>
    path: number[][] // Coordinates to draw map
  }
}

const itinerarySchema = new Schema<IItineraryDocument>(
  {
    // userId: {
    //   type: String,
    //   required: true,
    //   index: true
    // },
    userInput: {
      destination: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      startDate: { type: String, required: true },
      numberOfDays: { type: Number, required: true },
      people: { type: String, required: true },
      budget: { type: String, required: true },
      theme: { type: String, required: true }
    },
    places: [
      {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        kakaoId: String
      }
    ],
    restaurants: [
      {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        kakaoId: String,
        distance: Number,
        phone: String,
        url: String
      }
    ],
    userDestinationMatrix: [
      {
        name: String,
        distance: Number,
        duration: Number
      }
    ],
    destinationMatrix: [
      {
        from: String,
        routes: [
          {
            to: String,
            distance: Number,
            duration: Number
          }
        ]
      }
    ],
    restaurantDestinationMatrix: [
      {
        from: String,
        routes: [
          {
            to: String,
            distance: Number,
            duration: Number
          }
        ]
      }
    ],
    itinerary: {
      type: String,
      required: true
    },
    routeData: {
      summary: {
        distance: String,
        duration: String,
        taxiFare: Number
      },
      sections: [
        {
          start: { lat: Number, lng: Number },
          end: { lat: Number, lng: Number },
          distanceText: String,
          durationMinutes: Number,
          path: [[Number]]
        }
      ],
      path: [[Number]] // Mảng 2 chiều
    }
  },
  { timestamps: true }
)

export const TravelItinerary = model<IItineraryDocument>('TravelItinerary', itinerarySchema)
