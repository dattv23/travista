import { logger } from '@/config/logger'
import axios from 'axios'

export const searchService = {
  async getAddresses(keyword: string) {
    logger.info('Fetching addresses...')

    try {
      const res = await axios.get(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(keyword)}&language=eng`, {
        params: {},
        headers: {
          Accept: 'application/json',
          'X-NCP-APIGW-API-KEY-ID': process.env.NCP_MAP_KEY_ID ?? '',
          'X-NCP-APIGW-API-KEY': process.env.NCP_MAP_KEY ?? ''
        }
      })

      const items = res.data.addresses

      return items
    } catch (error) {
      logger.error('Error fetching addresses by keyword:', error)
      throw error
    }
  }
}
