import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import axios from 'axios'

// Enhanced web scraping with multiple sources and better performance
class GoldDataScraper {
  constructor() {
    this.browser = null
    this.page = null
    this.sources = {
      investing: 'https://www.investing.com',
      marketwatch: 'https://www.marketwatch.com',
      yahoo: 'https://finance.yahoo.com'
    }
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36')
    await this.page.setViewport({ width: 1920, height: 1080 })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  // Enhanced price extraction with multiple sources
  async getGoldPrice() {
    const priceData = {
      price: null,
      change: null,
      changePercent: null,
      timestamp: new Date().toISOString(),
      source: null
    }

    try {
      // Primary source: Investing.com
      console.log('🔍 Fetching gold price from Investing.com...')
      await this.page.goto('https://www.investing.com/commodities/gold', { waitUntil: 'networkidle2' })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = cheerio.load(html)

      // Try multiple selectors for price
      let price = $('[data-test="instrument-price-last"]').first().text().trim()
      if (!price) price = $('.text-2xl').first().text().trim()
      if (!price) price = $('[class*="price"]').first().text().trim()

      let change = $('[data-test="instrument-price-change"]').first().text().trim()
      if (!change) change = $('[class*="change"]').first().text().trim()

      let changePercent = $('[data-test="instrument-price-change-percent"]').first().text().trim()

      if (price) {
        priceData.price = price
        priceData.change = change
        priceData.changePercent = changePercent
        priceData.source = 'Investing.com'
        console.log(`✅ Price found: ${price} ${change}`)
        return priceData
      }
    } catch (error) {
      console.log('❌ Investing.com failed:', error.message)
    }

    try {
      // Fallback: MarketWatch
      console.log('🔍 Trying MarketWatch as fallback...')
      await this.page.goto('https://www.marketwatch.com/investing/future/gc00', { waitUntil: 'networkidle2' })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = cheerio.load(html)

      let price = $('.price-value').first().text().trim()
      let change = $('.price-change').first().text().trim()

      if (price) {
        priceData.price = price
        priceData.change = change
        priceData.source = 'MarketWatch'
        console.log(`✅ Fallback price found: ${price} ${change}`)
        return priceData
      }
    } catch (error) {
      console.log('❌ MarketWatch failed:', error.message)
    }

    return priceData
  }

  // Enhanced news extraction with sentiment analysis
  async getGoldNews() {
    const allNews = []

    // Source 1: Investing.com Gold News
    try {
      console.log('📰 Fetching gold news from Investing.com...')
      await this.page.goto('https://www.investing.com/commodities/gold-news', { waitUntil: 'networkidle2' })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = cheerio.load(html)

      $('article').each((i, el) => {
        if (i >= 15) return // Limit per source

        const $el = $(el)
        const title = $el.find('[data-test="article-title-link"]').text().trim() || $el.find('a').first().text().trim()
        const description = $el.find('[data-test="article-description"]').text().trim() || $el.find('p').first().text().trim()
        const time = $el.find('time').attr('datetime') || $el.find('time').text().trim()
        const link = $el.find('a').first().attr('href')

        if (title && title.length > 5) {
          allNews.push({
            title,
            description,
            time: time || 'Recent',
            source: 'Investing.com',
            link: link?.startsWith('http') ? link : `https://www.investing.com${link}`,
            sentiment: this.analyzeSentiment(title + ' ' + description),
            goldRelevance: this.calculateGoldRelevance(title + ' ' + description)
          })
        }
      })
    } catch (error) {
      console.log('❌ Investing.com news failed:', error.message)
    }

    // Source 2: MarketWatch Gold News
    try {
      console.log('📰 Fetching gold news from MarketWatch...')
      await this.page.goto('https://www.marketwatch.com/markets/metals', { waitUntil: 'networkidle2' })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = cheerio.load(html)

      $('.article__content').each((i, el) => {
        if (i >= 10) return

        const $el = $(el)
        const title = $el.find('h3 a').text().trim() || $el.find('.headline').text().trim()
        const description = $el.find('p').first().text().trim()
        const time = $el.find('time').text().trim()
        const link = $el.find('a').first().attr('href')

        if (title && title.length > 5) {
          const goldKeywords = ['gold', 'precious metal', 'bullion', 'xau']
          const hasGold = goldKeywords.some((keyword) => title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword))

          if (hasGold) {
            allNews.push({
              title,
              description,
              time: time || 'Recent',
              source: 'MarketWatch',
              link: link?.startsWith('http') ? link : `https://www.marketwatch.com${link}`,
              sentiment: this.analyzeSentiment(title + ' ' + description),
              goldRelevance: this.calculateGoldRelevance(title + ' ' + description)
            })
          }
        }
      })
    } catch (error) {
      console.log('❌ MarketWatch news failed:', error.message)
    }

    // Remove duplicates and sort by relevance and time
    const uniqueNews = this.removeDuplicates(allNews)
    return this.sortNewsByRelevance(uniqueNews)
  }

  // Simple sentiment analysis
  analyzeSentiment(text) {
    const positiveWords = ['rise', 'gain', 'up', 'bullish', 'positive', 'strong', 'rally', 'surge', 'climb']
    const negativeWords = ['fall', 'drop', 'down', 'bearish', 'negative', 'weak', 'decline', 'plunge', 'crash']

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return 'bullish'
    if (negativeCount > positiveCount) return 'bearish'
    return 'neutral'
  }

  // Calculate gold relevance score
  calculateGoldRelevance(text) {
    const goldTerms = {
      gold: 10,
      'precious metal': 8,
      bullion: 8,
      xau: 7,
      futures: 5,
      commodity: 3,
      metal: 2
    }

    let score = 0
    const lowerText = text.toLowerCase()

    Object.entries(goldTerms).forEach(([term, points]) => {
      if (lowerText.includes(term)) {
        score += points
      }
    })

    return Math.min(score, 10) // Cap at 10
  }

  // Remove duplicate articles
  removeDuplicates(articles) {
    const seen = new Set()
    return articles.filter((article) => {
      const key = article.title.toLowerCase().substring(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Sort news by relevance and recency
  sortNewsByRelevance(articles) {
    return articles.sort((a, b) => {
      // First by gold relevance
      if (a.goldRelevance !== b.goldRelevance) {
        return b.goldRelevance - a.goldRelevance
      }
      // Then by time (newer first)
      return new Date(b.time) - new Date(a.time)
    })
  }

  // Get comprehensive market data
  async getMarketData() {
    try {
      console.log('📊 Starting comprehensive gold market data collection...')

      const [priceData, newsData] = await Promise.all([this.getGoldPrice(), this.getGoldNews()])

      return {
        price: priceData,
        news: newsData.slice(0, 10), // Top 10 most relevant
        timestamp: new Date().toISOString(),
        summary: {
          totalNewsItems: newsData.length,
          bullishNews: newsData.filter((n) => n.sentiment === 'bullish').length,
          bearishNews: newsData.filter((n) => n.sentiment === 'bearish').length,
          highRelevanceNews: newsData.filter((n) => n.goldRelevance >= 7).length
        }
      }
    } catch (error) {
      console.error('❌ Error getting market data:', error)
      throw error
    }
  }
}

// Main execution function
async function scrapeEnhanced() {
  const scraper = new GoldDataScraper()

  try {
    await scraper.init()
    const marketData = await scraper.getMarketData()

    // Enhanced output with better formatting
    console.log('\n🏆 ENHANCED GOLD MARKET DATA 🏆')
    console.log('='.repeat(50))

    // Price data
    console.log(`\n💰 Gold Price: ${marketData.price.price || 'N/A'}`)
    console.log(`📈 Change: ${marketData.price.change || 'N/A'}`)
    console.log(`📊 Source: ${marketData.price.source || 'N/A'}`)
    console.log(`⏰ Updated: ${new Date(marketData.timestamp).toLocaleString()}`)

    // Market sentiment summary
    console.log(`\n📊 MARKET SENTIMENT ANALYSIS`)
    console.log(`📰 Total News: ${marketData.summary.totalNewsItems}`)
    console.log(`🟢 Bullish News: ${marketData.summary.bullishNews}`)
    console.log(`🔴 Bearish News: ${marketData.summary.bearishNews}`)
    console.log(`⭐ High Relevance: ${marketData.summary.highRelevanceNews}`)

    // Top news with enhanced details
    console.log(`\n📰 TOP GOLD NEWS (Relevance-Sorted)`)
    console.log('='.repeat(50))

    marketData.news.forEach((article, idx) => {
      console.log(`\n${idx + 1}. 📈 ${article.title}`)
      console.log(`   ⏰ ${article.time} | 📰 ${article.source}`)
      console.log(`   💭 Sentiment: ${article.sentiment.toUpperCase()} | 🎯 Relevance: ${article.goldRelevance}/10`)
      if (article.description) {
        console.log(`   📝 ${article.description}`)
      }
      if (article.link) {
        console.log(`   🔗 ${article.link}`)
      }
    })

    return marketData
  } finally {
    await scraper.close()
  }
}

// Export for use in other modules
export { GoldDataScraper, scrapeEnhanced }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeEnhanced().catch(console.error)
}
