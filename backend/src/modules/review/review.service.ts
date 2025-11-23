import { logger } from '@/config/logger'
import { cleanText } from '@/utils/cleanText'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { chromium } from 'playwright'

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
        }
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
  async getNaverBlogText(blogUrl: string) {
    logger.info('Crawling naver blog text...')

    try {
      const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
      const page = await browser.newPage()

      await page.goto(blogUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector('#mainFrame')
        return iframe ? iframe.getAttribute('src') : null
      })

      if (iframeSrc) {
        const iframeUrl = 'https://blog.naver.com' + iframeSrc

        await page.goto(iframeUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        const iframeHtml = await page.content()
        const $ = cheerio.load(iframeHtml)

        // Editor 2.0
        let content = $('[id^="post-view"]').text().trim()
        if (content) return content

        // Editor 1.0
        content = $('#postViewArea').text().trim()
        if (content) return content
      }

      const html = await page.content()
      const $ = cheerio.load(html)

      let content = $('[id^="post-view"]').text().trim()
      if (content) return content

      content = $('#postViewArea').text().trim()
      if (content) return content

      return ''
    } catch (error) {
      logger.error('Error crawling naver blog text:', error)
      return ''
    }
  },
  async translateToEnglish(text: string): Promise<string> {
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
        }
      }
    )

    return response.data.message.result.translatedText
  },
  async summary(data: { locationName: string }) {
    try {
      // Step 1: Get link blogs
      const linkBlogs = await this.getLinkBlogs(data.locationName)

      if (linkBlogs.length === 0) {
        logger.warn('No blog links found for location:', data.locationName)
        const locationEN = await this.translateToEnglish(data.locationName).catch(() => data.locationName)

        return {
          locationKR: data.locationName,
          locationEN: locationEN,
          summaryKR: '정보가 부족하여 요약을 생성할 수 없습니다.',
          summaryEN: 'Insufficient information to generate a summary based on available blogs.',
          sources: linkBlogs
        }
      }

      // Step 2: Get blog text & Step 3: Summarize each blog individually
      logger.info('Fetching and summarizing individual blogs...')
      const individualSummaries: Array<{ link: string; summary: string }> = []

      const MIN_LENGTH = 300
      for (const blog of linkBlogs) {
        try {
          const content = await this.getNaverBlogText(blog.link)
          const cleanedContent = cleanText(content)

          if (cleanedContent && cleanedContent.length >= MIN_LENGTH) {
            // Summarize each blog individually
            const response = await axios.post(
              `https://clovastudio.stream.ntruss.com/v1/api-tools/summarization/v2`,
              {
                texts: [cleanedContent],
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
                }
              }
            )

            const blogSummary = response.data.result.text
            individualSummaries.push({
              link: blog.link,
              summary: blogSummary
            })
          }
        } catch (error) {
          logger.warn(`Failed to process blog: ${blog.link}`, error)
          continue
        }
      }

      if (individualSummaries.length === 0) {
        logger.warn(`No blog content met the minimum length of ${MIN_LENGTH} characters.`)
        const locationEN = await this.translateToEnglish(data.locationName).catch(() => data.locationName)

        return {
          locationKR: data.locationName,
          locationEN: locationEN,
          summaryKR: '정보가 부족하여 요약을 생성할 수 없습니다.',
          summaryEN: 'Insufficient information to generate a summary based on available blogs.',
          sources: linkBlogs
        }
      }

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
      const summaryEN = await this.translateToEnglish(summaryKR)
      const locationEN = await this.translateToEnglish(data.locationName)

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
