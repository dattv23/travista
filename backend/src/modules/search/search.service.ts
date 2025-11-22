import { logger } from '@/config/logger'
import axios from 'axios'
import NodeCache from 'node-cache'

const searchCache = new NodeCache({ stdTTL: 86400 })

export const searchService = {
  async getAddresses(keyword: string) {
    const cacheKey = `search:${keyword.trim().toLocaleLowerCase()}`

    const cachedResult = searchCache.get(cacheKey)

    if (cachedResult) {
      logger.info('Serving search from cache', { keyword })
      return cachedResult
    }

    logger.info('Fetching places by keyword...', { keyword })

    // Check if Kakao API key is configured
    if (!process.env.KAKAO_REST_API_KEY) {
      logger.error('Kakao REST API key not configured')
      throw new Error('Kakao REST API key is not configured')
    }

    try {
      // Use Kakao Local Search API for place names (better for Korean places)
      const res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
        params: {
          query: keyword.trim(),
          size: 15 // Get more results
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
      })

      logger.info('Kakao Local Search API response:', {
        status: res.status,
        placeCount: res.data?.documents?.length || 0,
        keyword
      })

      // Transform Kakao response to match expected format (similar to Naver geocode format)
      const places = res.data?.documents || []
      const items = places.map((place: any) => ({
        roadAddress: place.road_address_name || place.address_name,
        jibunAddress: place.address_name,
        englishAddress: place.english_name || '',
        x: place.x, // longitude
        y: place.y, // latitude
        placeName: place.place_name,
        categoryName: place.category_name,
        placeUrl: place.place_url,
        phone: place.phone || ''
      }))

      if (items.length > 0) {
        searchCache.set(cacheKey, items)
      }

      logger.info(`Found ${items.length} places for keyword: ${keyword}`)
      return items
    } catch (error: any) {
      logger.error('Error fetching places by keyword:', {
        message: error.message,
        response: axios.isAxiosError(error)
          ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          }
          : null,
        keyword
      })
      throw error
    }
  }
}
