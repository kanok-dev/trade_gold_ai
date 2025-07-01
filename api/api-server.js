import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs/promises'

// Import route modules
import analysisRoutes from './routes/analysis.js'
import tradingRoutes from './routes/trading.js'
import portfolioRoutes from './routes/portfolio.js'

// Import crontab manager
import crontabManager, { initializeCrontab } from './analysis-crontab.js'

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
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'], // Frontend URLs
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

    // Legacy API endpoints for backward compatibility
    this.setupLegacyRoutes()

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: ['/health', '/api/status', '/api/analysis/*', '/api/trading/*', '/api/portfolio/*']
      })
    })
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
