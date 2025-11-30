import axios from 'axios'
import pLimit from 'p-limit'
import * as cheerio from 'cheerio'

import { logger } from '@/config/logger'
import { cleanText } from '@/utils/cleanText'
import { translateKoreanToEnglish } from '@/utils/translate'

const limit = pLimit(3)

const AXIOS_CONFIG = {
  timeout: 10000, // 10s fail fast
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  }
}

export const reviewService = {
  async getLinkBlogs(locationName: string) {
    logger.info('Fetching link blogs...')

    try {
      const res = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
        params: {
          query: `${locationName} 리뷰`,
          display: 3,
          sort: 'sim'
        },
        headers: {
          'X-Naver-Client-Id': `${process.env.X_NAVER_CLIENT_ID!}`,
          'X-Naver-Client-Secret': `${process.env.X_NAVER_CLIENT_SECRET!}`
        },
        timeout: 8000
      })

      const items = res.data.items.map((item: { title: string; link: string }) => ({
        title: item.title.replace(/<[^>]*>/g, ''),
        link: item.link
      }))

      return items
    } catch (error) {
      logger.error('Error fetching tourist attractions:', error)
      throw error
    }
  },
  async crawlBlog(blogUrl: string) {
    logger.info('Crawling naver blog text...')

    try {
      const mainRes = await axios.get(blogUrl)
      let $ = cheerio.load(mainRes.data)

      let content = $('[id^="post-view"]').text().trim() || $('#postViewArea').text().trim()

      if (content) return content

      const iframeSrc = $('#mainFrame').attr('src')
      if (iframeSrc) {
        const realUrl = iframeSrc.startsWith('http') ? iframeSrc : `https://blog.naver.com${iframeSrc}`

        const iframeRes = await axios.get(realUrl, AXIOS_CONFIG)

        $ = cheerio.load(iframeRes.data)

        content = $('[id^="post-view"]').text().trim() || $('#postViewArea').text().trim()

        if (content) return content
      }

      return ''
    } catch (err) {
      logger.error('Error crawling Naver blog:', err)
      return ''
    }
  },
  async summarizeOneText(text: string): Promise<string> {
    const res = await axios.post(
      `https://clovastudio.stream.ntruss.com/v1/api-tools/summarization/v2`,
      {
        texts: [text],
        autoSentenceSplitter: true,
        segCount: -1,
        segMaxSize: 1000,
        segMinSize: 300,
        includeAiFilters: false
      },
      {
        headers: {
          Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    return res.data.result.text
  },
  async summary(data: { locationName: string }) {
    try {
      // Step 1: Get link blogs
      const linkBlogs = await this.getLinkBlogs(data.locationName)

      if (linkBlogs.length === 0) {
        logger.warn('No blog links found for location:', data.locationName)
        const locationEN = await translateKoreanToEnglish(data.locationName).catch(() => data.locationName)

        return {
          locationKR: data.locationName,
          locationEN: locationEN,
          summaryKR: '정보가 부족하여 요약을 생성할 수 없습니다.',
          summaryEN: 'Insufficient information to generate a summary based on available blogs.',
          sources: linkBlogs
        }
      }

      // Step 2: Crawling blog & Step 3: Summarize each blog individually
      logger.info('Fetching and summarizing individual blogs...')
      const MIN_LENGTH = 300
      const tasks = linkBlogs.map((blog: { link: string }) =>
        limit(async () => {
          try {
            const html = await this.crawlBlog(blog.link)
            const cleanedText = cleanText(html)

            if (!cleanedText || cleanedText.length < MIN_LENGTH) {
              logger.warn(`Blog content too short for ${blog.link}`)
              return null
            }

            const sum = await this.summarizeOneText(cleanedText)
            return { link: blog.link, summary: sum }
          } catch (e) {
            return null
          }
        })
      )

      const settled = await Promise.allSettled(tasks)
      const individualSummaries = settled.filter(Boolean) as any[]

      if (individualSummaries.length === 0) {
        logger.warn('No valid blog summaries could be generated.')
        const locationEN = await translateKoreanToEnglish(data.locationName).catch(() => data.locationName)
        return {
          locationKR: data.locationName,
          locationEN: locationEN,
          summaryKR: '정보가 부족하여 요약을 생성할 수 없습니다.',
          summaryEN: 'Insufficient information to generate a summary based on available blogs.',
          sources: linkBlogs
        }
      }

      // Step 4: Consolidate individual summaries into final summary
      logger.info('Generating final consolidated summary...')

      const combinedSummariesText = individualSummaries.map((item) => `[출처: ${item.link}]\n${item.summary}`).join('\n\n---\n\n')

      const finalSummaryPrompt = `다음은 여러 블로그에서 추출한 요약본들입니다. 이들을 분석하여 해당 장소에 대한 최종 요약을 작성해주세요.

요구사항:
- 최대 5개의 핵심 포인트로 정리
- 각 포인트는 간결하게 (1-2문장)
- 각 포인트마다 출처(블로그 링크)를 명시
- 중복되는 내용은 통합
- 가장 유용하고 중요한 정보를 우선순위

블로그 요약본들:
${combinedSummariesText}

다음 텍스트 형식으로만 답변하세요 (JSON이나 마크다운 코드블록 없이):

• [첫 번째 핵심 포인트]
  출처: [링크1], [링크2]

• [두 번째 핵심 포인트]
  출처: [링크]

(최대 5개까지)`

      const chatResponse = await axios.post(
        `https://clovastudio.stream.ntruss.com/v1/chat-completions/HCX-003`,
        {
          messages: [
            {
              role: 'user',
              content: finalSummaryPrompt
            }
          ],
          temperature: 0.8,
          topP: 0.8,
          maxTokens: 1024
        },
        {
          headers: {
            Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const summaryKR = chatResponse.data.result.message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      // Translate to English
      const summaryEN = await translateKoreanToEnglish(summaryKR)
      const locationEN = await translateKoreanToEnglish(data.locationName)

      return {
        locationKR: data.locationName,
        locationEN: locationEN,
        summaryKR: summaryKR,
        summaryEN: summaryEN,
        sources: linkBlogs,
        individualSummaries: individualSummaries
      }
    } catch (error) {
      logger.error('Error generating summary:', error)
      throw error
    }
  }
}
