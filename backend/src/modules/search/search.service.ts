import { logger } from '@/config/logger'
import axios from 'axios'
import NodeCache from 'node-cache'

const searchCache = new NodeCache({ stdTTL: 86400 })

export const searchService = {
  async getAddresses(keyword: string) {
    // Use toLowerCase() for consistent caching across locales
    const cacheKey = `search:${keyword.trim().toLowerCase()}`

    const cachedResult = searchCache.get(cacheKey)

    if (cachedResult) {
      logger.info('Serving search from cache', { keyword })
      return cachedResult
    }

    logger.info('Fetching addresses...', { keyword })

    // Check if API keys are configured
    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      logger.error('Naver Maps API keys not configured')
      throw new Error('Naver Maps API keys are not configured')
    }

    try {
      // Detect if keyword contains Korean characters
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(keyword)
      
      // Omit language parameter to allow API to return results in both Korean and English
      // This helps with locations that have both names (e.g., "Incheon" and "인천")
      const params: any = {
        query: keyword,
        count: 20 // Request more results (up to 20 instead of default 5)
      }

      const res = await axios.get(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode`, {
        params,
        headers: {
          Accept: 'application/json',
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET
        }
      })

      let items = res.data?.addresses || []

      // If we got few results with English query, try Korean version if applicable
      if (items.length < 5 && !hasKorean && keyword.length >= 3) {
        // This is a fallback - in a real scenario, you might want to use a translation service
        // For now, we'll just log and return what we have
        logger.info('Got limited results, consider trying Korean translation', { 
          keyword, 
          resultCount: items.length 
        })
      }

      logger.info('Naver Geocode API response:', {
        status: res.status,
        addressCount: items.length,
        keyword,
        hasResults: items.length > 0,
        hasKorean
      })

      // Log if no results found
      if (items.length === 0) {
        logger.warn('No addresses found for keyword', { keyword })
      } else {
        // Cache successful results
        searchCache.set(cacheKey, items)
      }

      return items
    } catch (error: any) {
      logger.error('Error fetching addresses by keyword:', {
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
