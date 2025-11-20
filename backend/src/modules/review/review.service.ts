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
      const browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()

      await page.goto(blogUrl, {
        waitUntil: 'networkidle',
        timeout: 20000
      })

      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector('#mainFrame')
        return iframe ? iframe.getAttribute('src') : null
      })

      if (iframeSrc) {
        const iframeUrl = 'https://blog.naver.com' + iframeSrc

        await page.goto(iframeUrl, {
          waitUntil: 'networkidle',
          timeout: 20000
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
    // Placeholder implementation for generating a summary
    const linkBlogs = await this.getLinkBlogs(data.locationName)
    const blogContents = await Promise.all(
      linkBlogs.map(async (blog: { link: string }) => {
        const content = await this.getNaverBlogText(blog.link)
        return cleanText(content)
      })
    )
    logger.info('Generating summary...')
    try {
      const response = await axios.post(
        `https://clovastudio.stream.ntruss.com/v1/api-tools/summarization/v2`,
        {
          texts: blogContents,
          autoSentenceSplitter: true,
          segCount: -1,
          segMaxSize: 1000,
          segMinSize: 300,
          includeAiFilters: false
        },
        {
          headers: {
            // 'X-NCP-CLOVASTUDIO-API-KEY': process.env.NAVER_CLOVA_API_KEY!,
            // 'X-NCP-CLOVASTUDIO-API-SECRET': process.env.NAVER_CLOVA_API_SECRET!,
            // 'X-NCP-CLOVASTUDIO-PROJECT-ID': process.env.NAVER_CLOVA_PROJECT_ID!,
            Authorization: `Bearer nv-${process.env.NCP_API_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const summaryKR = response.data.result.text

      // Translate to English
      const summaryEN = await this.translateToEnglish(summaryKR)
      const locationEN = await this.translateToEnglish(data.locationName)
      return {
        locationKR: data.locationName,
        locationEN: locationEN,
        summaryKR: summaryKR,
        summaryEN: summaryEN,
        sources: linkBlogs
      }
    } catch (error) {
      logger.error('Error generating summary:', error)
    }
  }
}
