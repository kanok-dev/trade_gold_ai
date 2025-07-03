// News Service for fetching market news and gold prices
import https from 'https'
import http from 'http'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

export class NewsService {
  constructor() {
    this.sources = ['https://www.investing.com', 'https://www.reuters.com', 'https://www.bloomberg.com']
    this.priceAPIs = {
      source1: {
        name: 'MetalsAPI',
        url: 'api.metals.live',
        path: '/v1/latest?access_key=',
        apiKey: process.env.METALS_API_KEY
      },
      source2: {
        name: 'GoldAPI',
        url: 'www.goldapi.io',
        path: '/api/XAU/USD',
        apiKey: process.env.GOLD_API_KEY
      }
    }
  }

  async fetchLatestNews(topic = 'gold price') {
    try {
      console.log(`📰 Fetching latest news for: ${topic}`)

      // TODO: Implement actual news fetching
      return [
        {
          title: 'Gold prices consolidate around $3,300 level',
          source: 'Investing.com',
          timestamp: new Date().toISOString(),
          sentiment: 'neutral',
          relevance: 0.8
        },
        {
          title: 'Fed policy impacts precious metals outlook',
          source: 'Reuters',
          timestamp: new Date().toISOString(),
          sentiment: 'bearish',
          relevance: 0.9
        }
      ]
    } catch (error) {
      console.error('❌ Error fetching news:', error)
      throw error
    }
  }

  async analyzeNewsSentiment(news) {
    try {
      console.log('📊 Analyzing news sentiment...')

      const sentiments = news.map((article) => {
        // Simple sentiment analysis
        const bullishWords = ['rise', 'up', 'gain', 'positive', 'strong']
        const bearishWords = ['fall', 'down', 'loss', 'negative', 'weak']

        const text = (article.title + ' ' + (article.description || '')).toLowerCase()

        const bullishCount = bullishWords.filter((word) => text.includes(word)).length
        const bearishCount = bearishWords.filter((word) => text.includes(word)).length

        if (bullishCount > bearishCount) return 'bullish'
        if (bearishCount > bullishCount) return 'bearish'
        return 'neutral'
      })

      return {
        overall: this.calculateOverallSentiment(sentiments),
        details: sentiments
      }
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error)
      throw error
    }
  }

  calculateOverallSentiment(sentiments) {
    const counts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {})

    const total = sentiments.length
    if ((counts.bullish || 0) / total > 0.6) return 'bullish'
    if ((counts.bearish || 0) / total > 0.6) return 'bearish'
    return 'neutral'
  }

  async fetchGoldPriceFromSource1() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.priceAPIs.source1.apiKey) {
          // Fallback to mock data if API key not configured
          const mockPrice = 3348.1 + (Math.random() - 0.5) * 10
          return resolve({
            price: parseFloat(mockPrice.toFixed(2)),
            source: 'MetalsAPI (Mock)',
            timestamp: new Date().toISOString()
          })
        }

        const options = {
          hostname: this.priceAPIs.source1.url,
          port: 443,
          path: `${this.priceAPIs.source1.path}${this.priceAPIs.source1.apiKey}&base=USD&symbols=XAU`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }

        const req = https.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data)
              if (parsed.success && parsed.rates && parsed.rates.XAU) {
                const pricePerOunce = 1 / parsed.rates.XAU // Convert to USD per ounce
                resolve({
                  price: parseFloat(pricePerOunce.toFixed(2)),
                  source: 'MetalsAPI',
                  timestamp: new Date().toISOString()
                })
              } else {
                throw new Error('Invalid API response format')
              }
            } catch (parseError) {
              reject(parseError)
            }
          })
        })

        req.on('error', reject)
        req.setTimeout(5000, () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
        req.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  async fetchGoldPriceFromSource2() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.priceAPIs.source2.apiKey) {
          // Fallback to mock data if API key not configured
          const mockPrice = 3348.1 + (Math.random() - 0.5) * 10
          return resolve({
            price: parseFloat(mockPrice.toFixed(2)),
            source: 'GoldAPI (Mock)',
            timestamp: new Date().toISOString()
          })
        }

        const options = {
          hostname: this.priceAPIs.source2.url,
          port: 443,
          path: this.priceAPIs.source2.path,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': this.priceAPIs.source2.apiKey
          }
        }

        const req = https.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data)
              if (parsed.price) {
                resolve({
                  price: parseFloat(parsed.price.toFixed(2)),
                  source: 'GoldAPI',
                  timestamp: new Date().toISOString()
                })
              } else {
                throw new Error('Invalid API response format')
              }
            } catch (parseError) {
              reject(parseError)
            }
          })
        })

        req.on('error', reject)
        req.setTimeout(5000, () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
        req.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Fetch real-time XAUUSD price from Gold API (https://api.gold-api.com/price/XAU)
   * Returns: { price: number, source: string, timestamp: string }
   */
  async getTradeviewXAUUSDPriceRealtime() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          hostname: 'api.gold-api.com',
          port: 443,
          path: '/price/XAU',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }

        const req = https.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.price && typeof parsed.price === 'number') {
                console.log(`✅ Gold API: $${parsed.price} (${parsed.updatedAtReadable || 'recently updated'})`)
                resolve({
                  price: parseFloat(parsed.price.toFixed(2)),
                  source: 'Gold API',
                  timestamp: parsed.updatedAt || new Date().toISOString(),
                  updatedAtReadable: parsed.updatedAtReadable || 'recently'
                })
              } else {
                throw new Error('Invalid Gold API response format - missing price data')
              }
            } catch (parseError) {
              console.error('❌ Error parsing Gold API response:', parseError.message)
              resolve({
                price: null,
                source: 'Gold API',
                timestamp: new Date().toISOString(),
                error: `Parse error: ${parseError.message}`
              })
            }
          })
        })

        req.on('error', (error) => {
          console.error('❌ Error fetching from Gold API:', error.message)
          resolve({
            price: null,
            source: 'Gold API',
            timestamp: new Date().toISOString(),
            error: `Network error: ${error.message}`
          })
        })

        req.setTimeout(10000, () => {
          req.destroy()
          console.error('❌ Gold API request timeout')
          resolve({
            price: null,
            source: 'Gold API',
            timestamp: new Date().toISOString(),
            error: 'Request timeout after 10 seconds'
          })
        })

        req.end()
      } catch (error) {
        console.error('❌ Unexpected error in Gold API request:', error.message)
        resolve({
          price: null,
          source: 'Gold API',
          timestamp: new Date().toISOString(),
          error: `Unexpected error: ${error.message}`
        })
      }
    })
  }

  async getRealtimeGoldPrice() {
    try {
      console.log('💰 Fetching real-time gold price from multiple sources...')

      // Fetch prices from both sources simultaneously
      const [source1Result, source2Result] = await Promise.allSettled([this.fetchGoldPriceFromSource1(), this.fetchGoldPriceFromSource2()])

      const prices = []

      // Process Source 1 result
      if (source1Result.status === 'fulfilled') {
        prices.push(source1Result.value)
        console.log(`✅ ${source1Result.value.source}: $${source1Result.value.price}`)
      } else {
        console.error(`❌ Source 1 failed:`, source1Result.reason.message)
      }

      // Process Source 2 result
      if (source2Result.status === 'fulfilled') {
        prices.push(source2Result.value)
        console.log(`✅ ${source2Result.value.source}: $${source2Result.value.price}`)
      } else {
        console.error(`❌ Source 2 failed:`, source2Result.reason.message)
      }

      // Validate we have at least one price
      if (prices.length === 0) {
        throw new Error('Failed to fetch price from any source')
      }

      // If we have only one price, return it with a warning
      if (prices.length === 1) {
        console.log('⚠️ Only one price source available')
        return {
          price: prices[0].price,
          sources: prices,
          validation: {
            isValid: true,
            warning: 'Only one source available',
            priceDifference: null,
            priceDifferencePercent: null
          },
          timestamp: new Date().toISOString()
        }
      }

      // Compare prices from multiple sources
      const price1 = prices[0].price
      const price2 = prices[1].price
      const priceDifference = Math.abs(price1 - price2)
      const averagePrice = (price1 + price2) / 2
      const priceDifferencePercent = (priceDifference / averagePrice) * 100

      console.log(`📊 Price comparison: $${price1} vs $${price2}`)
      console.log(`📊 Difference: $${priceDifference.toFixed(2)} (${priceDifferencePercent.toFixed(2)}%)`)

      // Validate price difference is within acceptable range (1%)
      const isValid = priceDifferencePercent <= 1.0

      if (!isValid) {
        console.log(`⚠️ Price difference exceeds 1%: ${priceDifferencePercent.toFixed(2)}%`)
      }

      // Use average price if both sources are valid and within range
      const finalPrice = isValid ? averagePrice : price1 // Use first source if validation fails

      return {
        price: parseFloat(finalPrice.toFixed(2)),
        sources: prices,
        validation: {
          isValid,
          warning: isValid ? null : `Price difference ${priceDifferencePercent.toFixed(2)}% exceeds 1% threshold`,
          priceDifference: parseFloat(priceDifference.toFixed(2)),
          priceDifferencePercent: parseFloat(priceDifferencePercent.toFixed(2))
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Error fetching real-time gold price:', error)

      // Return fallback mock price in case of complete failure
      const fallbackPrice = 3348.1
      return {
        price: fallbackPrice,
        sources: [
          {
            price: fallbackPrice,
            source: 'Fallback',
            timestamp: new Date().toISOString()
          }
        ],
        validation: {
          isValid: false,
          warning: 'Using fallback price due to API failure',
          priceDifference: null,
          priceDifferencePercent: null
        },
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }
}

export default new NewsService()
