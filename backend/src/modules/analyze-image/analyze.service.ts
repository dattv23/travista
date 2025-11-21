import { logger } from '@/config/logger'
import { analyzeImagePrompt } from '@/utils/prompts/analyzeImagePrompt'
import axios from 'axios'

export const analyzeService = {
  async analyzeImageWithAI(base64Data: string, mimeType: string) {
    logger.info('Analyzing image with Naver HyperCLOVA HCX-005...')

    const prompt = analyzeImagePrompt
    const dataUri = `data:${mimeType};base64,${base64Data}`

    try {
      const response = await axios.post(
        'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005',
        {
          messages: [
            { role: 'system', content: 'You are an AI assistant that must respond ONLY in valid JSON following the schema.' },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  dataUri: {
                    data: dataUri
                  }
                }
              ]
            }
          ],
          topP: 0.8,
          topK: 0,
          maxTokens: 256,
          temperature: 0.1,
          repeatPenalty: 1.1
        },
        {
          headers: {
            Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Extract the actual text result
      const resultText = response.data.result.message.content

      const cleanJson = resultText.replace(/```json|```/g, '').trim()

      let parsedData
      try {
        parsedData = JSON.parse(cleanJson)
      } catch (error) {
        logger.error('error:', error)
        parsedData = {} // Fallback
      }

      return {
        success: true,
        locationName: parsedData.nameEN || parsedData.nameKR || resultText,
        data: parsedData,
        raw: response.data
      }
    } catch (error) {
      logger.error('Error:', error)
      throw error
    }
  }
}
