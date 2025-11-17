import axios from 'axios'
import { logger } from '@/config/logger'

export const mapperService = {
  /**
   * Get driving directions - EXACT copy from test-simple.js that WORKS
   */
  async getDirections(start: string, goal: string, option: string = 'trafast') {
    logger.info(`Getting directions from ${start} to ${goal}`)

    try {
      const response = await axios.get('https://maps.apigw.ntruss.com/map-direction-15/v1/driving', {
        params: { 
          start,
          goal,
          option
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAPS_CLIENT_ID!,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAPS_CLIENT_SECRET!
        }
      })

      logger.info(`✅ Directions success - Code: ${response.data.code}`)
      return response.data
    } catch (error: any) {
      logger.error('❌ Directions error:', error.response?.data || error.message)
      throw error
    }
  }
}
