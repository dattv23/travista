import axios from 'axios'
import { IKakaoMapsResponse, IItineraryState } from './planner.type'
import { TravelItinerary } from './planner.model'
import { RouteCache } from './route-cache.model'
import { logger } from '@/config/logger'
import { smartTripPrompt } from '@/utils/prompts'
import { IUserInput } from './planner.validation'
import { parseItinerary } from '@/utils/parseItinerary'
import { mapperService } from '../mapper/mapper.service'

export const plannerService = {
  async getTouristAttractions(state: IItineraryState): Promise<IItineraryState> {
    logger.info(`Fetching tourist attractions at [Lat: ${state.userInput.destination.lat}, Lng: ${state.userInput.destination.lng}]...`)

    try {
      const res = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        params: {
          category_group_code: 'AT4',
          x: state.userInput.destination.lng, // longitude
          y: state.userInput.destination.lat, // latitude
          radius: 15000,
          size: 10,
          sort: 'distance'
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY!}`
        }
      })

      logger.info('Kakao API response:', {
        status: res.status,
        hasDocuments: !!res.data?.documents,
        documentCount: res.data?.documents?.length || 0,
        meta: res.data?.meta
      })

      if (!res.data?.documents || res.data.documents.length === 0) {
        logger.warn('No tourist attractions found from Kakao API', {
          response: res.data,
          params: {
            lat: state.userInput.destination.lat,
            lng: state.userInput.destination.lng
          }
        })
        state.places = []
        return state
      }

      state.places = res.data.documents.map((p: { place_name: string; road_address_name: string; address_name: string; y: string; x: string; id: string }) => ({
        name: p.place_name,
        address: p.road_address_name || p.address_name,
        lat: Number(p.y),
        lng: Number(p.x),
        kakaoId: p.id
      }))

      logger.info(`Found ${state.places.length} tourist attractions:`, {
        places: state.places.map((p) => ({ name: p.name, address: p.address }))
      })
      return state
    } catch (error) {
      logger.error('Error fetching tourist attractions:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data
            }
          : null,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  },

  async getRestaurants(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Fetching restaurants (Kakao)...')

    try {
      const res = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        params: {
          category_group_code: 'FD6', // 🍽️ FD6 = 음식점 (Restaurant)
          x: state.userInput.destination.lng, // longitude
          y: state.userInput.destination.lat, // latitude
          radius: 15000, // ~5km search range
          size: 10, // fetch more to filter later
          sort: 'distance' // nearest first
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY!}`
        }
      })

      logger.info('Kakao API restaurant response:', {
        status: res.status,
        hasDocuments: !!res.data?.documents,
        documentCount: res.data?.documents?.length || 0
      })

      if (!res.data?.documents || res.data.documents.length === 0) {
        logger.warn('No restaurants found from Kakao API')
        state.restaurants = []
        return state
      }

      const restaurants = res.data.documents.map((r: IKakaoMapsResponse) => ({
        name: r.place_name,
        address: r.road_address_name || r.address_name,
        lat: Number(r.y),
        lng: Number(r.x),
        distance: Number(r.distance || 0),
        phone: r.phone || '',
        kakaoId: r.id,
        url: r.place_url
      }))

      restaurants.sort((a: IKakaoMapsResponse, b: IKakaoMapsResponse) => a.distance - b.distance)

      state.restaurants = restaurants
      logger.info(`Found ${state.restaurants.length} restaurants:`, {
        restaurants: state.restaurants.slice(0, 5).map((r) => ({ name: r.name, address: r.address })) // Log first 5
      })
      return state
    } catch (error) {
      logger.error('Error fetching restaurants:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data
            }
          : null,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  },

  async getRoute(start: string, goal: string) {
    try {
      if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
        logger.warn('Naver Maps API keys not configured, skipping route calculation')
        return null
      }

      // parse coordinates
      const [startLng, startLat] = start.split(',').map((coord) => parseFloat(coord))
      const [goalLng, goalLat] = goal.split(',').map((coord) => parseFloat(coord))

      const roundedStartLat = Math.round(startLat * 10000) / 10000
      const roundedStartLng = Math.round(startLng * 10000) / 10000
      const roundedGoalLat = Math.round(goalLat * 10000) / 10000
      const roundedGoalLng = Math.round(goalLng * 10000) / 10000

      const cachedRoute = await RouteCache.findOne({ startLat: roundedStartLat, startLng: roundedStartLng, goalLat: roundedGoalLat, goalLng: roundedGoalLng })
      if (cachedRoute) {
        return {
          distance: cachedRoute.distance,
          duration: cachedRoute.duration
        }
      }

      const rawData = await mapperService.getDirections(start, goal)

      if (rawData.code === 0) {
        const routeKey = Object.keys(rawData.route)[0]
        const summary = rawData.route[routeKey][0].summary

        const routeData = {
          distance: summary.distance,
          duration: summary.duration
        }

        // 4. Lưu vào Cache cho lần sau
        RouteCache.findOneAndUpdate(
          { startLat: roundedStartLat, startLng: roundedStartLng, goalLat: roundedGoalLat, goalLng: roundedGoalLng },
          { ...routeData, startLat: roundedStartLat, startLng: roundedStartLng, goalLat: roundedGoalLat, goalLng: roundedGoalLng },
          { upsert: true, new: true }
        ).catch((err) => logger.warn('Failed to cache route:', err))

        return routeData
      }
      return null
    } catch (error: any) {
      logger.warn(`Error getting route for matrix: ${error}`)
      return null
    }
  },

  async calculateDistanceToDestinationMatrix(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating distance to destinations (Naver)...')

    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      logger.warn('Naver Maps API keys not configured, skipping distance calculations')
      state.userDestinationMatrix = state.places.map((place) => ({
        ...place,
        distance: 0,
        duration: 0
      }))
      return state
    }

    const start = `${state.userInput.destination.lng},${state.userInput.destination.lat}`
    state.userDestinationMatrix = []

    // Limit to top 5 places to reduce API calls
    const limitedPlaces = state.places.slice(0, 5)

    for (const place of limitedPlaces) {
      const goal = `${place.lng},${place.lat}`
      const result = await this.getRoute(start, goal)

      if (result) {
        state.userDestinationMatrix.push({
          ...place,
          name: place.name,
          ...result
        })
      } else {
        // If API fails, still add place with default distance values
        state.userDestinationMatrix.push({
          ...place,
          distance: 0,
          duration: 0
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return state
  },

  async calculateDistanceAmongDestinations(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating inter-destination distance matrix (Naver)...')

    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      logger.warn('Naver Maps API keys not configured, skipping distance matrix')
      state.destinationMatrix = []
      return state
    }

    const matrix = []

    // Limit to top 5 places to reduce API calls (5 × 4 = 20 calls instead of 90)
    const limitedPlaces = state.places.slice(0, 5)

    for (const origin of limitedPlaces) {
      const row = []

      for (const destination of limitedPlaces) {
        if (origin === destination) continue

        const result = await this.getRoute(`${origin.lng},${origin.lat}`, `${destination.lng},${destination.lat}`)

        if (result) {
          row.push({ to: destination.name, ...result })
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      matrix.push({ from: origin.name, routes: row })
    }

    state.destinationMatrix = matrix
    return state
  },

  async calculateDistanceFromRestaurants(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating restaurant → destinations matrix (Naver)...')

    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      logger.warn('Naver Maps API keys not configured, skipping restaurant distance matrix')
      state.restaurantDestinationMatrix = []
      return state
    }

    const matrix = []

    // Limit to top 3 restaurants and top 5 places (3 × 5 = 15 calls instead of 100)
    const limitedRestaurants = state.restaurants.slice(0, 3)
    const limitedPlaces = state.places.slice(0, 5)

    for (const restaurant of limitedRestaurants) {
      const row = []

      for (const place of limitedPlaces) {
        const result = await this.getRoute(`${restaurant.lng},${restaurant.lat}`, `${place.lng},${place.lat}`)

        if (result) {
          row.push({ to: place.name, ...result })
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      matrix.push({ from: restaurant.name, routes: row })
    }

    state.restaurantDestinationMatrix = matrix
    return state
  },

  async generateItinerary(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Generating itinerary with Naver HyperCLOVA HCX-007...')

    const userInput = `
      - Destination: (${state.userInput.destination.lat}, ${state.userInput.destination.lng}) 
      - Start date: ${state.userInput.startDate}
      - Number of days: ${state.userInput.numberOfDays}
      - People: ${state.userInput.people}
      - Budget: ${state.userInput.budget}
      - Theme: ${state.userInput.theme}
    `

    const allPlacesData = `
      User → Destination distance/time:
      ${JSON.stringify(state.userDestinationMatrix, null, 2)}

      Between destinations:
      ${JSON.stringify(state.destinationMatrix, null, 2)}

      Restaurant → Destination relationships:
      ${JSON.stringify(state.restaurantDestinationMatrix, null, 2)}
    `
    const prompt = smartTripPrompt.replace('{{USER_INPUT}}', userInput).replace('{{TOTAL_DAYS}}', state.userInput.numberOfDays.toString()).replace('{{ALL_PLACES_DATA}}', allPlacesData)

    try {
      const response = await axios.post(
        `https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007`,
        {
          messages: [
            { role: 'system', content: 'You are an AI assistant that must respond ONLY in valid JSON following the schema.' },
            { role: 'user', content: prompt }
          ],
          topP: 0.8,
          topK: 0,
          maxCompletionTokens: 10000,
          temperature: 0.5,
          repetitionPenalty: 1.1,
          thinking: { effort: 'none' },
          stop: [],
          responseFormat: {
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                days: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      day_index: { type: 'number' },
                      date: { type: 'string' },
                      timeline: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            index: { type: 'number' },
                            nameEN: { type: 'string' },
                            nameKR: { type: 'string' },
                            type: { type: 'string', enum: ['attraction', 'restaurant'] },
                            start_time: { type: 'string' },
                            end_time: { type: 'string' },
                            duration_minutes: { type: 'number' },
                            lat: { type: ['number', 'null'] },
                            lng: { type: ['number', 'null'] },
                            note: { type: 'string' }
                          },
                          required: ['index', 'name', 'type', 'start_time', 'end_time', 'duration_minutes', 'lat', 'lng', 'note']
                        }
                      }
                    },
                    required: ['day_index', 'date', 'timeline']
                  }
                }
              },
              required: ['days']
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      )

      state.itinerary = response.data.result?.message?.content || ''

      logger.info('Itinerary generation completed.')
      const itineraryPreview = parseItinerary(state.itinerary)
      if (itineraryPreview) logger.debug(`Itinerary preview: ${itineraryPreview.toString()}`)
      else logger.warn('Failed to parse itinerary preview for logging.')
      return state
    } catch (error) {
      logger.error('Error generating itinerary:', error)
      throw error
    }
  },

  async calculateFinalRoute(itineraryJson: string, allPlaces: any[]) {
    try {
      const parsed = JSON.parse(itineraryJson)
      const orderedPoints: string[] = []

      parsed.days.forEach((day: any) => {
        day.timeline.forEach((item: any) => {
          let lat = item.lat
          let lng = item.lng

          if (!lat || !lng) {
            const found = allPlaces.find((p) => p.name === item.name || p.name.includes(item.name) || (item.nameKR && p.name.includes(item.nameKR)))
            if (found) {
              lat = found.lat
              lng = found.lng
            }
          }

          if (lat && lng) {
            orderedPoints.push(`${lng},${lat}`)
          }
        })
      })

      // Limited 7 points
      let routePoints = orderedPoints
      if (orderedPoints.length > 7) {
        const start = orderedPoints[0]
        const end = orderedPoints[orderedPoints.length - 1]
        const middle = orderedPoints.slice(1, -1)
        const step = Math.ceil(middle.length / 5)
        const selectedMiddle = middle.filter((_, i) => i % step === 0).slice(0, 5)
        routePoints = [start, ...selectedMiddle, end]
      }

      if (routePoints.length < 2) return undefined

      const routeData = await mapperService.getFormattedRoute(routePoints)
      return routeData || undefined
    } catch (e) {
      logger.warn('Auto-route calculation failed', e)
      return undefined
    }
  },

  async executePlannerWorkflow(userInput: IUserInput): Promise<IItineraryState> {
    let state: IItineraryState = {
      userInput: userInput,
      places: [],
      restaurants: [],
      userDestinationMatrix: [],
      destinationMatrix: [],
      restaurantDestinationMatrix: [],
      itinerary: ''
    }

    // Validate API key
    if (!process.env.KAKAO_REST_API_KEY) {
      throw new Error('KAKAO_REST_API_KEY environment variable is not set')
    }

    // Execute workflow steps
    state = await this.getTouristAttractions(state)

    if (state.places.length === 0) {
      const errorMsg = `No tourist attractions found in the area at coordinates (${userInput.destination.lat}, ${userInput.destination.lng}). Please check if the location is correct and if Kakao API is returning results.`
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }

    state = await this.getRestaurants(state)

    if (state.restaurants.length === 0) {
      const errorMsg = `No restaurants found in the area at coordinates (${userInput.destination.lat}, ${userInput.destination.lng}). Please check if the location is correct and if Kakao API is returning results.`
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }

    state = await this.calculateDistanceToDestinationMatrix(state)
    state = await this.calculateDistanceAmongDestinations(state)
    state = await this.calculateDistanceFromRestaurants(state)
    state = await this.generateItinerary(state)

    logger.info('Calculating final route data...')
    const allKnownPlaces = [...state.places, ...state.restaurants]
    const routeData = await this.calculateFinalRoute(state.itinerary, allKnownPlaces)

    if (routeData && routeData.sections) {
      const totalSections = routeData.sections.length
      const firstLegDuration = routeData.sections[0]?.durationMinutes || 0

      logger.info(`--- FINAL ROUTE SECTIONS DATA --- | Total Legs: ${totalSections} | First Leg: ${firstLegDuration} mins`, {
        totalSections: totalSections,
        sections: routeData.sections.map((s: any) => ({
          duration: s.durationMinutes,
          distance: s.distanceText
        }))
      })
    }

    const savedItinerary = await TravelItinerary.create({
      userInput: state.userInput,
      places: state.places,
      restaurants: state.restaurants,
      userDestinationMatrix: state.userDestinationMatrix,
      destinationMatrix: state.destinationMatrix,
      restaurantDestinationMatrix: state.restaurantDestinationMatrix,
      itinerary: state.itinerary,
      routeData: routeData
    })

    logger.info(`Itinerary saved with ID: ${savedItinerary._id}`)
    return { ...state, routeData } as any
  }
}
