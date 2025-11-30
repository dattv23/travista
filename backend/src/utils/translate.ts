import axios from 'axios'

export const translateKoreanToEnglish = async (text: string): Promise<string> => {
  const response = await axios.post(
    'https://papago.apigw.ntruss.com/nmt/v1/translation',
    {
      source: 'ko',
      target: 'en',
      text
    },
    {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID!,
        'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY!,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    }
  )

  return response.data.message.result.translatedText
}
