import { logger } from '@/config/logger'
import axios from 'axios'
import NodeCache from 'node-cache'

const searchCache = new NodeCache({ stdTTL: 86400 })

// Helper function to translate Korean text to English using Papago
async function translateToEnglish(text: string): Promise<string> {
  try {
    if (!process.env.X_NCP_APIGW_API_KEY_ID || !process.env.X_NCP_APIGW_API_KEY) {
      logger.warn('Papago API keys not configured, skipping translation')
      return text
    }

    const response = await axios.post(
      'https://papago.apigw.ntruss.com/nmt/v1/translation',
      {
        source: 'ko',
        target: 'en',
        text
      },
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID,
          'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data.message.result.translatedText
  } catch (error) {
    logger.warn('Translation failed, returning original text', { text, error })
    return text
  }
}

// Helper function to search Kakao API and translate results
async function searchKakaoAndTranslate(keyword: string): Promise<any[]> {
  if (!process.env.KAKAO_REST_API_KEY) {
    logger.warn('Kakao API key not configured, skipping Kakao search')
    return []
  }

  try {
    const res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      params: {
        query: keyword,
        size: 15
      },
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
      }
    })

    const documents = res.data?.documents || []
    logger.info('Kakao API response:', {
      status: res.status,
      resultCount: documents.length
    })

    if (documents.length === 0) {
      return []
    }

    // Normalize Kakao results to match Naver format and translate Korean text
    const normalizedResults = await Promise.all(
      documents.map(async (doc: any) => {
        const roadAddress = doc.road_address_name || ''
        const jibunAddress = doc.address_name || ''
        const placeName = doc.place_name || ''

        // Translate Korean addresses to English
        let englishRoadAddress = roadAddress
        let englishJibunAddress = jibunAddress

        // Check if text contains Korean characters
        const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(roadAddress + jibunAddress)

        if (hasKorean) {
          try {
            // Translate both addresses
            const [translatedRoad, translatedJibun] = await Promise.all([
              roadAddress ? translateToEnglish(roadAddress) : Promise.resolve(''),
              jibunAddress && jibunAddress !== roadAddress ? translateToEnglish(jibunAddress) : Promise.resolve('')
            ])
            englishRoadAddress = translatedRoad || roadAddress
            englishJibunAddress = translatedJibun || jibunAddress
          } catch (error) {
            logger.warn('Failed to translate addresses, using original', { error })
          }
        }

        return {
          roadAddress: englishRoadAddress || roadAddress,
          jibunAddress: englishJibunAddress || jibunAddress,
          x: doc.x, // longitude
          y: doc.y, // latitude
          placeName: placeName,
          // Keep original Korean for reference
          roadAddressKR: roadAddress,
          jibunAddressKR: jibunAddress
        }
      })
    )

    return normalizedResults
  } catch (error: any) {
    logger.error('Error fetching from Kakao API:', {
      message: error.message,
      response: axios.isAxiosError(error)
        ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
        : null
    })
    return []
  }
}

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

      logger.info('Naver Geocode API response:', {
        status: res.status,
        addressCount: items.length,
        keyword,
        hasResults: items.length > 0,
        hasKorean
      })

      // If we got few results, try Kakao API as fallback
      if (items.length < 5) {
        logger.info('Few results from Naver, trying Kakao API as fallback', {
          naverResults: items.length,
          keyword
        })

        const kakaoResults = await searchKakaoAndTranslate(keyword)

        if (kakaoResults.length > 0) {
          // Merge results, prioritizing Naver results and avoiding duplicates
          const existingCoords = new Set(
            items.map((item: any) => `${item.x},${item.y}`)
          )

          // Add Kakao results that don't duplicate Naver results
          const uniqueKakaoResults = kakaoResults.filter(
            (kakaoItem: any) => !existingCoords.has(`${kakaoItem.x},${kakaoItem.y}`)
          )

          items = [...items, ...uniqueKakaoResults]
          logger.info('Merged results from Naver and Kakao', {
            naverCount: res.data?.addresses?.length || 0,
            kakaoCount: kakaoResults.length,
            uniqueKakaoCount: uniqueKakaoResults.length,
            totalCount: items.length
          })
        }
      }

      if (items.length > 0) {
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
