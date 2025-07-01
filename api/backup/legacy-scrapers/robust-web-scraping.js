import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

// Robust web scraping with better error handling and fallbacks
class RobustGoldScraper {
  constructor() {
    this.browser = null
    this.page = null
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu']
    })
    this.page = await this.browser.newPage()

    // Better stealth configuration
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
    await this.page.setViewport({ width: 1366, height: 768 })

    // Set additional headers to appear more like a real browser
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async safeGoto(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return true
      } catch (error) {
        console.log(`⚠️  Attempt ${i + 1} failed for ${url}: ${error.message}`)
        if (i === maxRetries - 1) return false
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
    return false
  }

  async getGoldPriceRobust() {
    console.log('💰 Fetching gold price data...')

    // Try the original investing.com approach first
    const success = await this.safeGoto('https://www.investing.com/commodities/gold')

    if (success) {
      try {
        const html = await this.page.content()
        const $ = cheerio.load(html)

        let price = $('[data-test="instrument-price-last"]').first().text().trim()
        if (!price) price = $('.text-2xl').first().text().trim()
        if (!price) price = $('[class*="price"]').first().text().trim()

        let change = $('[data-test="instrument-price-change"]').first().text().trim()
        if (!change) change = $('[class*="change"]').first().text().trim()

        if (price) {
          console.log(`✅ Gold price found: ${price} ${change}`)
          return { price, change, source: 'Investing.com' }
        }
      } catch (error) {
        console.log(`❌ Price extraction failed: ${error.message}`)
      }
    }

    // Fallback: try to get from a financial API if available
    console.log('🔄 Trying alternative price source...')
    return { price: 'N/A', change: 'N/A', source: 'Unavailable' }
  }

  async getGoldNewsRobust() {
    console.log('📰 Fetching gold news...')
    const news = []

    // Try gold-specific news
    const success = await this.safeGoto('https://www.investing.com/commodities/gold-news')

    if (success) {
      try {
        const html = await this.page.content()
        const $ = cheerio.load(html)

        $('article').each((i, el) => {
          if (i >= 20) return false // Limit results

          const $el = $(el)
          let title = $el.find('[data-test="article-title-link"]').text().trim()
          if (!title) title = $el.find('a').first().text().trim()

          let description = $el.find('[data-test="article-description"]').text().trim()
          if (!description) description = $el.find('p').first().text().trim()

          const time = $el.find('time').attr('datetime') || $el.find('time').text().trim()
          let link = $el.find('a').first().attr('href')

          if (link && !link.startsWith('http')) {
            link = 'https://www.investing.com' + link
          }

          if (title && title.length > 5) {
            news.push({
              title: this.cleanText(title),
              description: this.cleanText(description),
              time: time || 'Recent',
              source: 'Investing.com',
              link,
              sentiment: this.getSentiment(title + ' ' + description),
              relevance: this.getRelevance(title + ' ' + description)
            })
          }
        })

        console.log(`✅ Found ${news.length} news articles`)
      } catch (error) {
        console.log(`❌ News extraction failed: ${error.message}`)
      }
    }

    return this.sortNewsByImportance(news)
  }

  cleanText(text) {
    if (!text) return ''
    return text
      .replace(/\s+/g, ' ')
      .replace(/By[A-Za-z\s.]+•\d+\s+(minutes?|hours?|days?)\s+ago/gi, '')
      .replace(/By[A-Za-z\s.]+$/gi, '')
      .trim()
  }

  getSentiment(text) {
    const bullish = ['rise', 'gain', 'up', 'bullish', 'rally', 'surge', 'climb', 'strong', 'positive']
    const bearish = ['fall', 'drop', 'down', 'bearish', 'decline', 'weak', 'negative', 'crash']

    const lower = text.toLowerCase()
    const bullishCount = bullish.filter((word) => lower.includes(word)).length
    const bearishCount = bearish.filter((word) => lower.includes(word)).length

    if (bullishCount > bearishCount) return 'bullish'
    if (bearishCount > bullishCount) return 'bearish'
    return 'neutral'
  }

  getRelevance(text) {
    const keywords = {
      gold: 10,
      xau: 8,
      bullion: 7,
      'precious metal': 6,
      futures: 4,
      commodity: 3,
      trading: 2,
      market: 1
    }

    let score = 0
    const lower = text.toLowerCase()

    Object.entries(keywords).forEach(([word, points]) => {
      if (lower.includes(word)) score += points
    })

    return Math.min(score, 10)
  }

  sortNewsByImportance(articles) {
    return articles.sort((a, b) => {
      // Sort by relevance first, then by time
      if (a.relevance !== b.relevance) return b.relevance - a.relevance
      return new Date(b.time) - new Date(a.time)
    })
  }

  async getCompleteMarketData() {
    try {
      console.log('🚀 Starting robust gold market data collection...')

      const [priceData, newsData] = await Promise.all([this.getGoldPriceRobust(), this.getGoldNewsRobust()])

      const summary = {
        totalNews: newsData.length,
        bullishNews: newsData.filter((n) => n.sentiment === 'bullish').length,
        bearishNews: newsData.filter((n) => n.sentiment === 'bearish').length,
        highRelevance: newsData.filter((n) => n.relevance >= 7).length
      }

      return {
        price: priceData,
        news: newsData.slice(0, 10),
        summary,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Error in market data collection:', error)
      throw error
    }
  }
}

// Enhanced display function
function displayMarketData(data) {
  console.log('\n🏆 ROBUST GOLD MARKET ANALYSIS 🏆')
  console.log('='.repeat(60))

  // Price Information
  console.log(`\n💰 GOLD PRICE DATA`)
  console.log(`📊 Current Price: ${data.price.price}`)
  console.log(`📈 Change: ${data.price.change}`)
  console.log(`🔗 Source: ${data.price.source}`)
  console.log(`⏰ Last Updated: ${new Date(data.timestamp).toLocaleString()}`)

  // Market Sentiment
  console.log(`\n📊 MARKET SENTIMENT OVERVIEW`)
  console.log(`📰 Total Articles: ${data.summary.totalNews}`)
  console.log(`🟢 Bullish Sentiment: ${data.summary.bullishNews} articles`)
  console.log(`🔴 Bearish Sentiment: ${data.summary.bearishNews} articles`)
  console.log(`⭐ High Relevance: ${data.summary.highRelevance} articles`)

  // Calculate overall sentiment
  const overallSentiment = data.summary.bullishNews > data.summary.bearishNews ? 'BULLISH' : data.summary.bearishNews > data.summary.bullishNews ? 'BEARISH' : 'NEUTRAL'
  console.log(`🎯 Overall Market Sentiment: ${overallSentiment}`)

  // Top News
  console.log(`\n📰 TOP GOLD NEWS (By Relevance)`)
  console.log('='.repeat(60))

  data.news.forEach((article, idx) => {
    console.log(`\n${idx + 1}. 📈 ${article.title}`)
    console.log(`   ⏰ ${article.time} | 📰 ${article.source}`)
    console.log(`   💭 Sentiment: ${article.sentiment.toUpperCase()} | 🎯 Relevance: ${article.relevance}/10`)
    if (article.description) {
      console.log(`   📝 ${article.description}`)
    }
    if (article.link) {
      console.log(`   🔗 ${article.link}`)
    }
  })
}

// Main execution
async function main() {
  const scraper = new RobustGoldScraper()

  try {
    await scraper.init()
    const marketData = await scraper.getCompleteMarketData()
    displayMarketData(marketData)
    return marketData
  } finally {
    await scraper.close()
  }
}

// Export for use in other modules
export { RobustGoldScraper, main as robustScrape }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
