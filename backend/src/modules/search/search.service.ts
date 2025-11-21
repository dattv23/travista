import { logger } from '@/config/logger'
import axios from 'axios'

export const searchService = {
  async getAddresses(keyword: string) {
    logger.info('Fetching addresses...', { keyword })

    // Check if API keys are configured
    if (!process.env.NAVER_MAPS_CLIENT_ID || !process.env.NAVER_MAPS_CLIENT_SECRET) {
      logger.error('Naver Maps API keys not configured')
      throw new Error('Naver Maps API keys are not configured')
    }

    try {
      const res = await axios.get(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode`, {
        params: {
          query: keyword,
          language: 'eng'
        },
        headers: {
          Accept: 'application/json',
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET
        }
      })

      logger.info('Naver Geocode API response:', {
        status: res.status,
        addressCount: res.data?.addresses?.length || 0
      })

      const items = res.data?.addresses || []

      return items
    } catch (error: any) {
      logger.error('Error fetching addresses by keyword:', {
        message: error.message,
        response: axios.isAxiosError(error) ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        } : null,
        keyword
      })
      throw error
    }
  }
}
