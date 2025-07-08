import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import crypto from 'crypto'

// Import route modules
import analysisRoutes from './routes/analysis.js'
import tradingRoutes from './routes/trading.js'
import portfolioRoutes from './routes/portfolio.js'

// Import crontab manager
import crontabManager, { initializeCrontab } from './analysis-crontab.js'

// Import notification service
import notificationService from './services/notificationService.js'
import newsService from './services/newsService.js'
import analysisService from './services/analysisService.js'

// Import sonar bot
import { runGoldAnalysis, analyzeGoldMarket } from './backup/legacy-bots/sonar-bot2.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class GoldTradingAPIServer {
  constructor() {
    this.app = express()
    this.port = process.env.API_PORT || 3001
    this.server = null
    this.crontabManager = null

    // In-memory data store (in production, use a proper database)
    this.dataStore = {
      lastAnalysis: null,
      portfolioStatus: {
        goldAllocation: 0,
        cashAllocation: 100,
        totalValue: 10000,
        lastUpdate: new Date().toISOString()
      },
      tradingHistory: [],
      alerts: [],
      systemStatus: 'RUNNING'
    }
  }

  async init() {
    console.log('🚀 Initializing Gold Trading API Server...')

    // Setup middleware
    this.setupMiddleware()

    // Setup routes
    this.setupRoutes()

    // Setup error handling
    this.setupErrorHandling()

    // Load any persisted data
    await this.loadPersistedData()

    // Initialize crontab manager
    await this.initializeCrontab()

    console.log('✅ Gold Trading API Server initialized')
  }

  /**
   * Initialize crontab manager for automated analysis
   */
  async initializeCrontab() {
    try {
      console.log('🕐 Initializing automated analysis crontab...')

      this.crontabManager = await initializeCrontab()

      if (this.crontabManager) {
        console.log('✅ Crontab manager initialized - analysis will run every 6 hours')
      } else {
        console.log('⚠️  Crontab manager failed to initialize')
      }
    } catch (error) {
      console.error('❌ Error initializing crontab:', error.message)
    }
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(
      cors({
        origin: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:4173',
          'https://trade-gold-ai.onrender.com',
          'https://golden-ai.kanoks.me',
          'https://golden-api.kanoks.me',
          'http://golden-ai.kanoks.me',
          'http://golden-api.kanoks.me'
        ], // Frontend URLs
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      })
    )

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`)
      next()
    })
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Gold Trading API',
        version: '1.0.0'
      })
    })

    // API status endpoint
    this.app.get('/api/status', (req, res) => {
      const crontabStatus = this.crontabManager ? this.crontabManager.getStatus() : null

      res.json({
        success: true,
        data: {
          serverStatus: 'RUNNING',
          systemStatus: this.dataStore.systemStatus,
          lastUpdate: new Date().toISOString(),
          crontab: crontabStatus,
          endpoints: {
            analysis: '/api/analysis',
            trading: '/api/trading',
            portfolio: '/api/portfolio',
            crontab: '/api/crontab'
          }
        }
      })
    })

    // Crontab management endpoints
    this.app.get('/api/crontab/status', (req, res) => {
      try {
        const status = this.crontabManager ? this.crontabManager.getStatus() : null
        res.json({
          success: true,
          data: status || { error: 'Crontab manager not initialized' }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    this.app.post('/api/crontab/trigger', async (req, res) => {
      try {
        if (!this.crontabManager) {
          return res.status(400).json({
            success: false,
            error: 'Crontab manager not initialized'
          })
        }

        console.log('🔧 Manual analysis trigger requested via API')
        const success = await this.crontabManager.triggerManual()

        res.json({
          success: true,
          data: {
            triggered: true,
            success: success,
            message: success ? 'Analysis completed successfully' : 'Analysis completed with errors'
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    this.app.post('/api/crontab/schedule', (req, res) => {
      try {
        if (!this.crontabManager) {
          return res.status(400).json({
            success: false,
            error: 'Crontab manager not initialized'
          })
        }

        const { schedule } = req.body
        if (!schedule) {
          return res.status(400).json({
            success: false,
            error: 'Schedule parameter required'
          })
        }

        const success = this.crontabManager.changeSchedule(schedule)

        res.json({
          success: true,
          data: {
            scheduleChanged: success,
            newSchedule: success ? schedule : null,
            message: success ? 'Schedule updated successfully' : 'Invalid schedule format'
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    this.app.post('/api/crontab/start', (req, res) => {
      try {
        if (!this.crontabManager) {
          return res.status(400).json({
            success: false,
            error: 'Crontab manager not initialized'
          })
        }

        const { schedule } = req.body
        const success = this.crontabManager.start(schedule)

        res.json({
          success: true,
          data: {
            started: success,
            schedule: schedule || this.crontabManager.schedule,
            message: success ? 'Crontab started successfully' : 'Failed to start crontab'
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    this.app.post('/api/crontab/stop', (req, res) => {
      try {
        if (!this.crontabManager) {
          return res.status(400).json({
            success: false,
            error: 'Crontab manager not initialized'
          })
        }

        const success = this.crontabManager.stop()

        res.json({
          success: true,
          data: {
            stopped: success,
            message: success ? 'Crontab stopped successfully' : 'No active crontab to stop'
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Real-time price endpoint
    this.app.get('/api/price/realtime', async (req, res) => {
      try {
        console.log('💰 Fetching real-time gold price directly via API...')
        const priceData = await newsService.getTradeviewXAUUSDPriceRealtime()

        if (priceData.price !== null && priceData.price !== undefined) {
          res.json({
            success: true,
            data: {
              price: priceData.price,
              source: priceData.source,
              timestamp: priceData.timestamp
            }
          })
        } else {
          res.status(503).json({
            success: false,
            error: priceData.error || 'Price data unavailable'
          })
        }
      } catch (error) {
        console.error('❌ Error fetching real-time price:', error)
        res.status(500).json({
          success: false,
          error: 'Gold price service temporarily unavailable',
          details: error.message
        })
      }
    })

    // Mount API route modules
    this.app.use(
      '/api/analysis',
      (req, res, next) => {
        req.dataStore = this.dataStore
        next()
      },
      analysisRoutes
    )

    this.app.use(
      '/api/trading',
      (req, res, next) => {
        req.dataStore = this.dataStore
        next()
      },
      tradingRoutes
    )

    this.app.use(
      '/api/portfolio',
      (req, res, next) => {
        req.dataStore = this.dataStore
        next()
      },
      portfolioRoutes
    )

    // Line webhook routes
    this.setupLineWebhook()

    // Legacy API endpoints for backward compatibility
    this.setupLegacyRoutes()

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: ['/health', '/api/status', '/api/analysis/*', '/api/trading/*', '/api/portfolio/*', '/api/sonar/analyze', '/api/sonar/status', '/api/sonar/latest', '/webhook/line', '/api/line/config', '/api/line/command']
      })
    })
  }

  setupLineWebhook() {
    // Line webhook verification middleware
    const verifyLineSignature = (req, res, next) => {
      const channelSecret = process.env.LINE_OA_CHANNEL_SECRET
      if (!channelSecret) {
        console.log('⚠️ Line channel secret not configured, skipping verification')
        return next()
      }

      const signature = req.get('X-Line-Signature')
      if (!signature) {
        return res.status(400).json({ error: 'Missing Line signature' })
      }

      const body = JSON.stringify(req.body)
      const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')

      if (signature !== hash) {
        return res.status(400).json({ error: 'Invalid Line signature' })
      }

      next()
    }

    // Line webhook endpoint
    this.app.post('/webhook/line', verifyLineSignature, async (req, res) => {
      try {
        const events = req.body.events || []

        for (const event of events) {
          await this.handleLineEvent(event)
        }

        res.status(200).json({ status: 'ok' })
      } catch (error) {
        console.error('❌ Line webhook error:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    // Manual command endpoint for testing
    this.app.post('/api/line/command', async (req, res) => {
      try {
        const { userId, command } = req.body

        if (!userId || !command) {
          return res.status(400).json({
            success: false,
            error: 'userId and command are required'
          })
        }

        const result = await this.handleLineCommand(userId, command)

        res.json({
          success: true,
          data: result
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Line configuration check endpoint
    this.app.get('/api/line/config', (req, res) => {
      const hasOAToken = !!process.env.LINE_OA_TOKEN
      const hasChannelSecret = !!process.env.LINE_OA_CHANNEL_SECRET
      const hasLineToken = !!process.env.LINE_TOKEN

      res.json({
        success: true,
        data: {
          lineOA: {
            configured: hasOAToken && hasChannelSecret,
            hasToken: hasOAToken,
            hasChannelSecret: hasChannelSecret
          },
          lineNotify: {
            configured: hasLineToken,
            hasToken: hasLineToken
          },
          webhookUrl: `/webhook/line`,
          status: hasOAToken && hasChannelSecret ? 'ready' : 'not_configured'
        }
      })
    })
  }

  async handleLineEvent(event) {
    try {
      console.log('📱 Line event received:', event.type)

      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId
        const messageText = event.message.text.trim()

        console.log(`👤 User ${userId} sent: ${messageText}`)

        await this.handleLineCommand(userId, messageText)
      }
    } catch (error) {
      console.error('❌ Error handling Line event:', error)
    }
  }

  async handleLineCommand(userId, command) {
    try {
      const lowerCommand = command.toLowerCase()

      switch (lowerCommand) {
        case '/start':
        case 'start':
          await notificationService.sendLineOAMessage(
            userId,
            `🤖 Welcome to Gold Trading Bot!\n\nAvailable commands:\n` +
              `📰 /news - Get latest market news\n` +
              `💰 /price - Get current gold price\n` +
              `📊 /analysis - Get market analysis\n` +
              `🔍 /sonar - Run Sonar analysis\n` +
              `🆔 /myid - Get your user ID\n` +
              `❓ /help - Show this help message`
          )
          return { command: 'start', response: 'Welcome message sent' }

        case '/news':
        case 'news':
          const newsResult = await notificationService.sendNewsUpdate(userId)
          if (newsResult) {
            return { command: 'news', response: 'News update sent' }
          } else {
            await notificationService.sendLineOAMessage(userId, '⚠️ News service is not available at the moment. Please try again later.')
            return { command: 'news', response: 'News update failed - Line OA not configured' }
          }

        case '/myid':
        case 'myid':
          await notificationService.sendLineOAMessage(userId, `🆔 Your User ID: ${userId}\n\nYou can use this ID to receive automated notifications.`)
          return { command: 'myid', response: 'User ID sent', userId }

        case '/price':
        case 'price':
          try {
            console.log('💰 Fetching real-time gold price from Gold API...')
            const priceData = await newsService.getTradeviewXAUUSDPriceRealtime()

            if (priceData.price !== null) {
              await notificationService.sendLineOAMessage(userId, `💰 Current Gold Price (XAUUSD): $${priceData.price}\n` + `📊 Source: ${priceData.source}\n` + `⏰ Updated: ${new Date(priceData.timestamp).toLocaleString()}`)
              return { command: 'price', response: 'Real-time price sent', price: priceData.price }
            } else {
              // Send error message instead of mock data
              await notificationService.sendLineOAMessage(userId, `❌ Unable to fetch gold price at this time\n` + `🔧 Error: ${priceData.error || 'Price data unavailable'}\n` + `🔄 Please try again later`)
              return { command: 'price', response: 'Price fetch failed - error message sent' }
            }
          } catch (error) {
            console.error('❌ Error fetching price:', error)
            // Send error message instead of mock data
            await notificationService.sendLineOAMessage(userId, `❌ Gold price service temporarily unavailable\n` + `🔧 Technical issue: ${error.message}\n` + `🔄 Please try again in a few minutes`)
            return { command: 'price', response: 'Service error - error message sent' }
          }

        case '/analysis':
        case 'analysis':
          try {
            console.log('📊 Starting comprehensive market analysis...')

            // Execute the 4-step analysis process
            const analysisResult = await analysisService.executeCompleteAnalysis()

            // Store the result in dataStore for other endpoints
            this.dataStore.lastAnalysis = analysisResult

            // Format and send the analysis via Line
            const formattedMessage = analysisService.formatForLineMessage(analysisResult)
            await notificationService.sendLineOAMessage(userId, formattedMessage)

            return {
              command: 'analysis',
              response: 'Enhanced analysis completed and sent',
              data: analysisResult
            }
          } catch (error) {
            console.error('❌ Error in enhanced analysis:', error)

            // Send error message instead of fallback analysis
            await notificationService.sendLineOAMessage(
              userId,
              `❌ Market Analysis Unavailable\n\n` + `🔧 Service Error: ${error.message}\n` + `🔄 Please try again later\n\n` + `⚠️ The analysis system is temporarily experiencing issues. Our team is working to resolve this.`
            )

            return {
              command: 'analysis',
              response: 'Analysis failed - error message sent',
              error: error.message
            }
          }

        case '/sonar':
        case 'sonar':
          try {
            console.log('🔍 Sonar analysis requested via Line command')

            // Send initial message
            await notificationService.sendLineOAMessage(userId, '🔍 Starting Sonar analysis... This may take a moment.')

            const startTime = Date.now()
            const result = await runGoldAnalysis()
            const endTime = Date.now()
            const duration = ((endTime - startTime) / 1000).toFixed(2)

            if (result.success) {
              // Store the result
              this.dataStore.lastAnalysis = {
                ...result,
                source: 'sonar-bot',
                duration: `${duration}s`
              }

              // Format and send the sonar analysis
              const formattedMessage = this.formatSonarForLine(result)
              await notificationService.sendLineOAMessage(userId, formattedMessage)

              return {
                command: 'sonar',
                response: 'Sonar analysis completed and sent',
                data: result,
                duration: `${duration}s`
              }
            } else {
              await notificationService.sendLineOAMessage(userId, `❌ Sonar Analysis Failed\n\n` + `🔧 Error: ${result.error}\n` + `⏱️ Duration: ${duration}s\n` + `🔄 Please try again later`)

              return {
                command: 'sonar',
                response: 'Sonar analysis failed - error message sent',
                error: result.error,
                duration: `${duration}s`
              }
            }
          } catch (error) {
            console.error('❌ Error in sonar analysis:', error)
            await notificationService.sendLineOAMessage(userId, `🚨 Sonar Analysis Error\n\n` + `💥 System Error: ${error.message}\n` + `🔄 Please try again later`)

            return {
              command: 'sonar',
              response: 'Sonar analysis system error',
              error: error.message
            }
          }

        case '/help':
        case 'help':
          await notificationService.sendLineOAMessage(
            userId,
            `📋 Available Commands:\n\n` + `📰 /news - Latest market news\n` + `💰 /price - Current gold price\n` + `📊 /analysis - Market analysis\n` + `🔍 /sonar - Sonar AI analysis\n` + `🆔 /myid - Your user ID\n` + `❓ /help - This help message`
          )
          return { command: 'help', response: 'Help message sent' }

        default:
          await notificationService.sendLineOAMessage(userId, `❓ Unknown command: "${command}"\n\nType /help to see available commands.`)
          return { command: 'unknown', response: 'Unknown command message sent' }
      }
    } catch (error) {
      console.error('❌ Error handling Line command:', error)
      await notificationService.sendLineOAMessage(userId, `🚨 Sorry, there was an error processing your command. Please try again later.`)
      throw error
    }
  }

  formatSonarForLine(sonarResult) {
    try {
      if (!sonarResult.success || !sonarResult.analysis) {
        return `❌ Sonar Analysis Failed\n\nNo valid analysis data available.`
      }

      // Try to parse the analysis JSON
      let analysis
      try {
        analysis = typeof sonarResult.analysis === 'string' ? JSON.parse(sonarResult.analysis) : sonarResult.analysis
      } catch (error) {
        return `❌ Sonar Analysis Error\n\nFailed to parse analysis data.`
      }

      const validation = sonarResult.validation || {}
      const credibilityScore = validation.credibilityScore || 0
      const dataQuality = validation.dataQuality || 'unknown'

      // Check if this is a unified_analysis structure
      if (analysis.unified_analysis) {
        return this.formatUnifiedAnalysisForLine(analysis, validation, sonarResult)
      } else {
        return this.formatLegacyAnalysisForLine(analysis, validation, sonarResult)
      }
    } catch (error) {
      console.error('❌ Error formatting sonar result for Line:', error)
      return `❌ Sonar Analysis Formatting Error\n\nUnable to format analysis results.`
    }
  }

  formatUnifiedAnalysisForLine(analysis, validation, sonarResult) {
    const unified = analysis.unified_analysis
    const credibilityScore = validation.credibilityScore || 0
    const dataQuality = validation.dataQuality || 'unknown'

    // Extract price data from unified structure
    const spotPrice = unified.spot_price || 'N/A'

    // Format price change
    let priceChangeText = ''
    if (unified.price_change) {
      if (unified.price_change.daily_pct !== undefined && unified.price_change.daily_pct !== null) {
        const changeSymbol = unified.price_change.daily_pct >= 0 ? '+' : ''
        priceChangeText += `📈 Daily Change: ${changeSymbol}${unified.price_change.daily_pct}%\n`
      }
      if (unified.price_change.weekly_pct !== undefined && unified.price_change.weekly_pct !== null) {
        const changeSymbol = unified.price_change.weekly_pct >= 0 ? '+' : ''
        priceChangeText += `📈 Weekly Change: ${changeSymbol}${unified.price_change.weekly_pct}%\n`
      }
    }

    // Format sentiment from unified structure
    const sentiment = unified.market_sentiment || {}
    const sentimentEmojis = { bullish: '📈', bearish: '📉', neutral: '🤝' }
    const sentimentEmoji = sentimentEmojis[sentiment.overall] || '📊'
    const confidenceEmojis = { high: '🔒', medium: '⚖️', low: '⚠️' }
    const confidenceEmoji = confidenceEmojis[sentiment.confidence] || '📊'

    // Format signals from unified structure
    const signals = unified.signals || {}
    const signalEmojis = { strong_buy: '🚀', buy: '📈', hold: '🤝', sell: '📉', strong_sell: '🔻' }
    let signalsText = ''
    if (signals.short_term) {
      signalsText += `${signalEmojis[signals.short_term] || '🎯'} Short-term: ${signals.short_term.toUpperCase()}\n`
    }
    if (signals.medium_term) {
      signalsText += `${signalEmojis[signals.medium_term] || '🎯'} Medium-term: ${signals.medium_term.toUpperCase()}\n`
    }
    if (signals.long_term) {
      signalsText += `${signalEmojis[signals.long_term] || '🎯'} Long-term: ${signals.long_term.toUpperCase()}\n`
    }

    // Format technical analysis from unified structure
    let technicalText = ''
    if (unified.technical_indicators) {
      const tech = unified.technical_indicators
      technicalText = `\n📊 TECHNICAL ANALYSIS:\n`

      if (tech.trend) {
        const trendEmojis = { bullish: '📈', bearish: '📉', neutral: '➡️' }
        const trendEmoji = trendEmojis[tech.trend] || '📊'
        technicalText += `📈 Trend: ${trendEmoji} ${tech.trend.toUpperCase()}\n`
      }

      if (tech.rsi_14) {
        technicalText += `📊 RSI (14): ${tech.rsi_14}\n`
      }

      if (Array.isArray(tech.supports) && tech.supports.length > 0) {
        technicalText += `🛡️ Support Levels: $${tech.supports.join(', $')}\n`
      }

      if (Array.isArray(tech.resistances) && tech.resistances.length > 0) {
        technicalText += `⛔ Resistance Levels: $${tech.resistances.join(', $')}\n`
      }
    }

    // Format news from unified structure
    let newsText = ''
    if (Array.isArray(unified.news_highlights) && unified.news_highlights.length > 0) {
      newsText = `📰 News Coverage: ${unified.news_highlights.length} articles analyzed\n`
      const topNews = unified.news_highlights.slice(0, 3)
      if (topNews.length > 0) {
        const impactEmojis = { high: '🔥', medium: '⚡', low: '📄' }
        const newsEmojis = { bullish: '📈', bearish: '📉', neutral: '🤝' }

        topNews.forEach((article, index) => {
          if (article && article.headline) {
            const impactEmoji = impactEmojis[article.impact] || '📄'
            const newsEmoji = newsEmojis[article.sentiment] || '📊'
            newsText += `   ${index + 1}. ${impactEmoji} ${newsEmoji} ${article.headline.substring(0, 80)}...\n`
          }
        })
      }
    }

    // Format trading levels from final_decision
    let tradingText = ''
    if (unified.final_decision) {
      const decision = unified.final_decision
      tradingText = `\n🎯 TRADING RECOMMENDATION:\n`

      if (decision.action) {
        const actionEmoji = signalEmojis[decision.action] || '🎯'
        tradingText += `${actionEmoji} Action: ${decision.action.toUpperCase()}\n`
      }

      if (decision.confidence) {
        tradingText += `🔒 Confidence: ${decision.confidence}%\n`
      }

      if (decision.entryPoint) {
        tradingText += `🎯 Entry Point: $${decision.entryPoint}\n`
      }

      if (decision.stopLoss) {
        tradingText += `🛑 Stop Loss: $${decision.stopLoss}\n`
      }

      if (Array.isArray(decision.takeProfit) && decision.takeProfit.length > 0) {
        tradingText += `🎯 Take Profit: $${decision.takeProfit.join(', $')}\n`
      }

      if (decision.reasoning) {
        tradingText += `💭 Reasoning: ${decision.reasoning.substring(0, 150)}...\n`
      }
    }

    // Build the complete message for unified analysis
    return (
      `🔍 UNIFIED GOLD ANALYSIS\n` +
      `🕐 ${new Date().toLocaleString()}\n` +
      `📅 Source: ${analysis.source || 'AI Merged'}\n` +
      `⚡ Freshness: ${analysis.data_freshness_minutes || 0} minutes\n\n` +
      `💰 Current Gold Price: $${spotPrice}\n` +
      priceChangeText +
      `${sentimentEmoji} Market Sentiment: ${(sentiment.overall || 'neutral').toUpperCase()}\n` +
      `${confidenceEmoji} Confidence: ${(sentiment.confidence || 'medium').toUpperCase()}\n\n` +
      `🎯 TRADING SIGNALS:\n` +
      signalsText +
      (sentiment.summary ? `\n📝 Market Summary: ${sentiment.summary.substring(0, 200)}...\n` : '') +
      (newsText ? '\n' + newsText : '') +
      technicalText +
      tradingText +
      `\n📊 Data Quality: ${dataQuality} (${credibilityScore}/100)\n` +
      `⚡ Powered by AI Unified Analysis`
    )
  }

  formatLegacyAnalysisForLine(analysis, validation, sonarResult) {
    const credibilityScore = validation.credibilityScore || 0
    const dataQuality = validation.dataQuality || 'unknown'

    // Extract price data from legacy format
    const priceData = analysis.priceData || {}
    const spotPrice = priceData.spotPrice || analysis.spot_price || 'N/A'
    const change24h = priceData.change24h
    const changePercent24h = priceData.changePercent24h
    const sources = priceData.sources || []

    // Format price change
    let priceChangeText = ''
    if (change24h !== undefined && changePercent24h !== undefined) {
      const changeSymbol = change24h >= 0 ? '+' : ''
      priceChangeText = `📈 24h Change: ${changeSymbol}$${change24h} (${changePercent24h}%)\n`
    }

    // Format price sources
    let priceSourcesText = ''
    if (sources.length > 0) {
      priceSourcesText = `📊 Price Sources: ${sources.length} confirmed sources\n`
    }

    // Format sentiment emoji
    const sentimentEmojis = { bullish: '📈', bearish: '📉', neutral: '🤝' }
    const sentimentEmoji = sentimentEmojis[analysis.sentiment] || '📊'

    // Format signal emoji
    const signalEmojis = { strong_buy: '🚀', buy: '📈', hold: '🤝', sell: '📉', strong_sell: '🔻' }
    const signalEmoji = signalEmojis[analysis.signal] || '🎯'

    // Format confidence emoji
    const confidenceEmojis = { high: '🔒', medium: '⚖️', low: '⚠️' }
    const confidenceEmoji = confidenceEmojis[analysis.confidence] || '📊'

    // Format key factors
    const keyFactors = analysis.keyFactors || analysis.key_drivers || []
    let keyFactorsText = 'No key factors available'
    if (Array.isArray(keyFactors) && keyFactors.length > 0) {
      keyFactorsText =
        `🔑 Key Factors (${keyFactors.length}):\n` +
        keyFactors
          .slice(0, 3)
          .map((factor, i) => `   ${i + 1}. ${factor}`)
          .join('\n')
    }

    // Format news coverage
    let newsText = ''
    if (analysis.news24h && Array.isArray(analysis.news24h)) {
      newsText = `📰 News Coverage: ${analysis.news24h.length} articles analyzed\n`
      const topNews = analysis.news24h.slice(0, 3)
      if (topNews.length > 0) {
        const impactEmojis = { high: '🔥', medium: '⚡', low: '📄' }
        const newsEmojis = { bullish: '📈', bearish: '📉', neutral: '🤝' }

        topNews.forEach((article, index) => {
          if (article && article.headline) {
            const impactEmoji = impactEmojis[article.impact] || '📄'
            const newsEmoji = newsEmojis[article.sentiment] || '📊'
            newsText += `   ${index + 1}. ${impactEmoji} ${newsEmoji} ${article.headline.substring(0, 80)}...\n`
          }
        })
      }
    }

    // Format technical analysis
    let technicalText = ''
    if (analysis.technicalView) {
      const tech = analysis.technicalView
      technicalText = `\n📊 TECHNICAL ANALYSIS:\n`

      if (tech.trend) {
        const trendEmojis = { bullish: '📈', bearish: '📉', neutral: '➡️' }
        const trendEmoji = trendEmojis[tech.trend] || '📊'
        technicalText += `📈 Trend: ${trendEmoji} ${tech.trend.toUpperCase()}\n`
      }

      if (tech.supportLevels && Array.isArray(tech.supportLevels)) {
        technicalText += `🛡️ Support Levels: $${tech.supportLevels.join(', $')}\n`
      }

      if (tech.resistanceLevels && Array.isArray(tech.resistanceLevels)) {
        technicalText += `⛔ Resistance Levels: $${tech.resistanceLevels.join(', $')}\n`
      }

      if (tech.rsi) {
        technicalText += `📊 RSI: ${tech.rsi}\n`
      }
    }

    // Format trading levels
    let tradingText = ''
    if (analysis.entryPoint || analysis.stopLoss || analysis.takeProfit) {
      tradingText = `\n🎯 TRADING LEVELS:\n`

      if (analysis.entryPoint) {
        tradingText += `🎯 Entry Point: $${analysis.entryPoint}\n`
      }

      if (analysis.stopLoss) {
        tradingText += `🛑 Stop Loss: $${analysis.stopLoss}\n`
      }

      if (analysis.takeProfit && Array.isArray(analysis.takeProfit)) {
        tradingText += `🎯 Take Profit: $${analysis.takeProfit.join(', $')}\n`
      }
    }

    // Format additional metrics
    let additionalMetrics = ''

    if (analysis.riskLevel) {
      const riskEmojis = { high: '🚨', medium: '⚠️', low: '✅' }
      const riskEmoji = riskEmojis[analysis.riskLevel] || '📊'
      additionalMetrics += `⚠️ Risk Level: ${riskEmoji} ${analysis.riskLevel.toUpperCase()}\n`
    }

    if (analysis.timeHorizon) {
      additionalMetrics += `⏰ Time Horizon: ${analysis.timeHorizon.toUpperCase()}\n`
    }

    if (analysis.institutionalFlow) {
      const flowEmojis = { buying: '💰', selling: '💸', neutral: '🤝' }
      const flowEmoji = flowEmojis[analysis.institutionalFlow] || '📊'
      additionalMetrics += `🏛️ Institutional Flow: ${flowEmoji} ${analysis.institutionalFlow.toUpperCase()}\n`
    }

    if (analysis.fedImpact) {
      additionalMetrics += `🏛️ Fed Impact: ${analysis.fedImpact}\n`
    }

    if (analysis.currencyImpact) {
      additionalMetrics += `💵 Currency Impact: ${analysis.currencyImpact}\n`
    }

    if (analysis.priceTarget) {
      additionalMetrics += `🎯 Price Target: ${analysis.priceTarget}\n`
    }

    // Build the complete message for legacy analysis
    return (
      `🔍 SONAR GOLD ANALYSIS\n` +
      `🕐 ${new Date().toLocaleString()}\n` +
      `📅 Range: ${sonarResult.dateRange || 'Last 24h'}\n\n` +
      `💰 Current Gold Price: $${spotPrice}\n` +
      priceChangeText +
      priceSourcesText +
      `${sentimentEmoji} Market Sentiment: ${(analysis.sentiment || 'neutral').toUpperCase()}\n` +
      `${signalEmoji} Trading Signal: ${(analysis.signal || 'hold').toUpperCase()}\n` +
      `${confidenceEmoji} Confidence: ${(analysis.confidence || 'medium').toUpperCase()}\n` +
      `📝 Summary: ${analysis.summary || 'No summary available'}\n` +
      keyFactorsText +
      '\n' +
      (newsText ? '\n' + newsText : '') +
      technicalText +
      tradingText +
      (additionalMetrics ? '\n' + additionalMetrics : '') +
      `\n📊 Data Quality: ${dataQuality} (${credibilityScore}/100)\n` +
      `⚡ Powered by Sonar AI`
    )
  }

  setupLegacyRoutes() {
    // Legacy endpoint for current analysis
    this.app.get('/api/current-analysis', (req, res) => {
      try {
        const analysis = this.dataStore.lastAnalysis || this.generateMockAnalysis()
        res.json({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Debug endpoint to check data structure
    this.app.get('/api/debug/analysis', (req, res) => {
      try {
        console.log('🔍 Debug: Current analysis data structure:', JSON.stringify(this.dataStore.lastAnalysis, null, 2))
        res.json({
          success: true,
          dataStore: this.dataStore.lastAnalysis,
          type: typeof this.dataStore.lastAnalysis,
          keys: this.dataStore.lastAnalysis ? Object.keys(this.dataStore.lastAnalysis) : null
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Legacy endpoint for triggering analysis
    this.app.post('/api/trigger-analysis', async (req, res) => {
      try {
        console.log('🔄 Manual analysis triggered from API')

        // Generate mock analysis (replace with actual analysis logic)
        const analysis = this.generateMockAnalysis()
        this.dataStore.lastAnalysis = analysis

        // Save to file
        await this.saveAnalysisToFile(analysis)

        res.json({
          success: true,
          message: 'Analysis triggered successfully',
          data: analysis
        })
      } catch (error) {
        console.error('❌ Analysis trigger failed:', error)
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Sonar bot endpoints
    this.app.post('/api/sonar/analyze', async (req, res) => {
      try {
        console.log('🔍 Sonar bot analysis requested via API')
        const startTime = Date.now()

        // Run the sonar analysis
        const result = await runGoldAnalysis()
        const endTime = Date.now()
        const duration = ((endTime - startTime) / 1000).toFixed(2)

        // Store the result in dataStore
        if (result.success) {
          this.dataStore.lastAnalysis = {
            ...result,
            source: 'sonar-bot',
            duration: `${duration}s`
          }
        }

        res.json({
          success: result.success,
          message: result.success ? 'Sonar analysis completed successfully' : 'Sonar analysis failed',
          data: result,
          executionTime: `${duration}s`
        })
      } catch (error) {
        console.error('❌ Sonar analysis failed:', error)
        res.status(500).json({
          success: false,
          error: error.message,
          message: 'Sonar analysis encountered an error'
        })
      }
    })

    this.app.get('/api/sonar/status', (req, res) => {
      try {
        const lastSonarAnalysis = this.dataStore.lastAnalysis?.source === 'sonar-bot' ? this.dataStore.lastAnalysis : null

        res.json({
          success: true,
          data: {
            available: true,
            lastAnalysis: lastSonarAnalysis?.timestamp || null,
            credibilityScore: lastSonarAnalysis?.validation?.credibilityScore || null,
            dateRange: lastSonarAnalysis?.dateRange || null,
            status: lastSonarAnalysis?.status || 'not_run'
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    this.app.get('/api/sonar/latest', (req, res) => {
      try {
        const lastSonarAnalysis = this.dataStore.lastAnalysis?.source === 'sonar-bot' ? this.dataStore.lastAnalysis : null

        if (!lastSonarAnalysis) {
          return res.status(404).json({
            success: false,
            error: 'No sonar analysis available',
            message: 'Run /api/sonar/analyze first to generate analysis'
          })
        }

        res.json({
          success: true,
          data: lastSonarAnalysis
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        })
      }
    })

    // Legacy performance endpoint
    this.app.get('/api/performance', (req, res) => {
      res.json({
        success: true,
        data: {
          totalTrades: this.dataStore.tradingHistory.length,
          profitLoss: 0,
          winRate: 0,
          maxDrawdown: 0,
          sharpeRatio: 0
        }
      })
    })

    // Legacy alerts endpoint
    this.app.get('/api/alerts', (req, res) => {
      res.json({
        success: true,
        data: this.dataStore.alerts.slice(-10) // Last 10 alerts
      })
    })
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('🚨 API Error:', error)

      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.path
      })
    })
  }

  generateMockAnalysis() {
    const mockPrice = (2600 + Math.random() * 200).toFixed(2)
    const mockChange = (Math.random() * 40 - 20).toFixed(2)

    return {
      timestamp: new Date().toISOString(),
      marketData: {
        price: {
          price: `$${mockPrice}`,
          change: `${mockChange >= 0 ? '+' : ''}$${mockChange}`,
          source: 'Mock Data'
        },
        news: [
          {
            title: 'Gold prices fluctuate amid market uncertainty',
            sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
            timestamp: new Date().toISOString()
          },
          {
            title: 'Federal Reserve comments impact precious metals',
            sentiment: 'neutral',
            timestamp: new Date().toISOString()
          }
        ],
        summary: {
          totalNews: 5,
          bullishNews: Math.floor(Math.random() * 3),
          bearishNews: Math.floor(Math.random() * 3)
        }
      },
      signal: {
        signal: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 5) + 5
      },
      analysis: 'Market analysis shows mixed signals with moderate volatility expected.',
      confidence: Math.floor(Math.random() * 40) + 50,
      risk: {
        riskScore: Math.floor(Math.random() * 5) + 3,
        riskLevel: 'MODERATE'
      }
    }
  }

  async loadPersistedData() {
    try {
      // Try to load the latest analysis file
      const files = await fs.readdir('./data').catch(() => [])
      const analysisFiles = files.filter((f) => f.startsWith('analysis_'))

      if (analysisFiles.length > 0) {
        const latestFile = analysisFiles.sort().pop()
        const data = await fs.readFile(`./data/${latestFile}`, 'utf8')
        const parsed = JSON.parse(data)
        this.dataStore.lastAnalysis = parsed.analysis
        console.log(`📁 Loaded analysis from ${latestFile}`)
      }
    } catch (error) {
      console.log('📝 No previous analysis data found, starting fresh')
    }
  }

  async saveAnalysisToFile(analysis) {
    try {
      const date = new Date().toISOString().split('T')[0]
      const filename = `./data/analysis_${date}.json`

      // Ensure data directory exists
      await fs.mkdir('./data', { recursive: true })

      const data = {
        timestamp: new Date().toISOString(),
        analysis,
        serverInfo: {
          version: '1.0.0',
          port: this.port
        }
      }

      await fs.writeFile(filename, JSON.stringify(data, null, 2))
      console.log(`💾 Analysis saved to ${filename}`)
    } catch (error) {
      console.error('❌ Failed to save analysis:', error.message)
    }
  }

  async start() {
    await this.init()

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🌐 Gold Trading API Server running on http://localhost:${this.port}`)
        console.log(`📊 Health check: http://localhost:${this.port}/health`)
        console.log(`📡 API Status: http://localhost:${this.port}/api/status`)
        console.log('='.repeat(60))
        resolve()
      })
    })
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🛑 Gold Trading API Server stopped')
          resolve()
        })
      })
    }
  }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiServer = new GoldTradingAPIServer()

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down API Server...')
    await apiServer.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down API Server...')
    await apiServer.stop()
    process.exit(0)
  })

  // Start the server
  apiServer.start().catch(console.error)
}

export default GoldTradingAPIServer
export { GoldTradingAPIServer }
