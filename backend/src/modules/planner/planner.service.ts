import axios from 'axios'
import { IKakaoMapsResponse, IItineraryState } from './planner.type'
import { TravelItinerary } from './planner.model'
import { logger } from '@/config/logger'

export const plannerService = {
  async getTouristAttractions(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Fetching tourist attractions...')

    try {
      const res = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        params: {
          category_group_code: 'AT4',
          x: state.lng,
          y: state.lat,
          radius: 15000,
          size: 10,
          sort: 'distance'
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY!}`
        }
      })

      state.places = res.data.documents.map((p: { place_name: string; road_address_name: string; address_name: string; y: string; x: string; id: string }) => ({
        name: p.place_name,
        address: p.road_address_name || p.address_name,
        lat: Number(p.y),
        lng: Number(p.x),
        kakaoId: p.id
      }))

      return state
    } catch (error) {
      logger.error('Error fetching tourist attractions:', error)
      throw error
    }
  },

  async getRestaurants(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Fetching restaurants (Kakao)...')

    try {
      const res = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        params: {
          category_group_code: 'FD6', // 🍽️ FD6 = 음식점 (Restaurant)
          x: state.lng, // longitude
          y: state.lat, // latitude
          radius: 15000, // ~5km search range
          size: 10, // fetch more to filter later
          sort: 'distance' // nearest first
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY!}`
        }
      })

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
      return state
    } catch (error) {
      logger.error('Error fetching restaurants:', error)
      throw error
    }
  },

  async getRoute(start: string, goal: string) {
    const res = await axios.get('https://maps.apigw.ntruss.com/map-direction-15/v1/driving?option=trafast', {
      params: { start, goal },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID!,
        'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET!
      }
    })

    const route = res.data?.route?.trafast?.[0]
    return route
      ? {
          distance: route.summary.distance,
          duration: route.summary.duration
        }
      : null
  },

  async calculateDistanceToDestinationMatrix(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating distance to destinations (Naver)...')

    const start = `${state.lng},${state.lat}`
    state.userDestinationMatrix = []

    for (const place of state.places) {
      const goal = `${place.lng},${place.lat}`
      const result = await this.getRoute(start, goal)
      if (result)
        state.userDestinationMatrix.push({
          ...place,
          name: place.name,
          ...result
        })
    }

    return state
  },

  async calculateDistanceAmongDestinations(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating inter-destination distance matrix (Naver)...')

    const matrix = []

    for (const origin of state.places) {
      const row = []

      for (const destination of state.places) {
        if (origin === destination) continue
        const result = await this.getRoute(`${origin.lng},${origin.lat}`, `${destination.lng},${destination.lat}`)
        if (result) row.push({ to: destination.name, ...result })
      }

      matrix.push({ from: origin.name, routes: row })
    }

    state.destinationMatrix = matrix
    return state
  },

  async calculateDistanceFromRestaurants(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Calculating restaurant → destinations matrix (Naver)...')

    const matrix = []

    for (const restaurant of state.restaurants) {
      const row = []

      for (const place of state.places) {
        const result = await this.getRoute(`${restaurant.lng},${restaurant.lat}`, `${place.lng},${place.lat}`)
        if (result) row.push({ to: place.name, ...result })
      }

      matrix.push({ from: restaurant.name, routes: row })
    }

    state.restaurantDestinationMatrix = matrix
    return state
  },

  async generateItinerary(state: IItineraryState): Promise<IItineraryState> {
    logger.info('Generating itinerary with Naver HyperCLOVA X...')

    const prompt = `
You are a Korean travel assistant. Create a one-day optimized travel itinerary based on the following data.

User → Destination distance/time:
${JSON.stringify(state.userDestinationMatrix, null, 2)}

Between destinations:
${JSON.stringify(state.destinationMatrix, null, 2)}

Restaurant → Destination relationships:
${JSON.stringify(state.restaurantDestinationMatrix, null, 2)}

Rules:
1. Start with the closest tourist attraction from the user.
2. Visit 2 attractions, then choose the most convenient restaurant.
3. Continue to the remaining attractions while minimizing travel time.
4. Include estimated times and transitions clearly.
5. Keep the itinerary short, readable and friendly.
    `

    const response = await axios.post(
      `https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005`,
      {
        messages: [
          { role: 'system', content: 'You are a helpful Korean travel planning assistant.' },
          { role: 'user', content: prompt }
        ],
        maxTokens: 1800,
        temperature: 0.65,
        topP: 0.9
      },
      {
        headers: {
          // 'X-NCP-CLOVASTUDIO-API-KEY': process.env.NAVER_CLOVA_API_KEY!,
          // 'X-NCP-CLOVASTUDIO-API-SECRET': process.env.NAVER_CLOVA_API_SECRET!,
          // 'X-NCP-CLOVASTUDIO-PROJECT-ID': process.env.NAVER_CLOVA_PROJECT_ID!,
          Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
          'Content-Type': 'application/json'
        }
      }
    )

    state.itinerary = response.data.result?.message?.content || ''
    return state
  },

  async executePlannerWorkflow(lat: number, lng: number): Promise<IItineraryState> {
    let state: IItineraryState = {
      lat,
      lng,
      places: [],
      restaurants: [],
      userDestinationMatrix: [],
      destinationMatrix: [],
      restaurantDestinationMatrix: [],
      itinerary: ''
    }

    // Execute workflow steps
    state = await this.getTouristAttractions(state)

    if (state.places.length === 0) {
      throw new Error('No tourist attractions found in the area')
    }

    state = await this.getRestaurants(state)

    if (state.restaurants.length === 0) {
      throw new Error('No restaurants found in the area')
    }

    state = await this.calculateDistanceToDestinationMatrix(state)
    state = await this.calculateDistanceAmongDestinations(state)
    state = await this.calculateDistanceFromRestaurants(state)
    state = await this.generateItinerary(state)

    const savedItinerary = await TravelItinerary.create({
      userLocation: { lat: state.lat, lng: state.lng },
      places: state.places,
      restaurants: state.restaurants,
      userDestinationMatrix: state.userDestinationMatrix,
      destinationMatrix: state.destinationMatrix,
      restaurantDestinationMatrix: state.restaurantDestinationMatrix,
      itinerary: state.itinerary
    })

    logger.info(`Itinerary saved with ID: ${savedItinerary._id}`)
    return state
  }
}
