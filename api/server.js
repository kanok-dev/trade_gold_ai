import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import { IntegratedGoldTradingSystem } from './utils/integrated-system.js'
import { EnhancedGoldTradingBot } from './enhanced-trading-bot.js'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TradingDashboard {
  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    this.tradingSystem = new IntegratedGoldTradingSystem()
    this.bot = new EnhancedGoldTradingBot()
    this.connectedClients = new Set()
    this.lastAnalysis = null
    this.performanceData = []
    this.alertsHistory = []
  }

  async init() {
    await this.tradingSystem.init()
    await this.bot.init()
    this.setupRoutes()
    this.setupWebSocket()
    console.log('📊 Trading Dashboard initialized')
  }

  async setupRoutes() {
    // Dynamic import for route modules (since this file uses ES modules)
    const { default: analysisRoutes } = await import('./routes/analysis.js')
    const { default: tradingRoutes } = await import('./routes/trading.js')
    const { default: portfolioRoutes } = await import('./routes/portfolio.js')
    const { default: unifiedAnalysisRoutes } = await import('./routes/unified-analysis.js')

    // Serve frontend static files
    this.app.use(express.static(path.join(__dirname, '../frontend')))
    this.app.use(express.json())

    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      next()
    })

    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend', 'index.html'))
    })

    // Mount API routes
    this.app.use('/api/analysis', analysisRoutes)
    this.app.use('/api/trading', tradingRoutes)
    this.app.use('/api/portfolio', portfolioRoutes)
    this.app.use('/api/analysis', unifiedAnalysisRoutes)

    // Legacy API Routes (for backward compatibility)
    this.app.get('/api/current-analysis', async (req, res) => {
      try {
        if (!this.lastAnalysis) {
          this.lastAnalysis = await this.bot.runCompleteAnalysis()
        }
        res.json(this.lastAnalysis)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    this.app.get('/api/performance', (req, res) => {
      res.json({
        data: this.performanceData,
        summary: this.calculatePerformanceSummary()
      })
    })

    this.app.get('/api/alerts', (req, res) => {
      res.json(this.alertsHistory)
    })

    this.app.post('/api/trigger-analysis', async (req, res) => {
      try {
        console.log('🔄 Manual analysis triggered from dashboard')
        const analysis = await this.bot.runCompleteAnalysis()
        this.lastAnalysis = analysis

        // Broadcast to all connected clients
        this.io.emit('analysis-update', analysis)

        res.json({ success: true, analysis })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    this.app.post('/api/update-settings', (req, res) => {
      try {
        const { settings } = req.body
        // Store settings logic here
        res.json({ success: true })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('📱 Client connected to dashboard')
      this.connectedClients.add(socket.id)

      // Send current data to new client
      if (this.lastAnalysis) {
        socket.emit('analysis-update', this.lastAnalysis)
      }

      socket.on('request-update', async () => {
        try {
          const analysis = await this.bot.runQuickSignal()
          socket.emit('analysis-update', analysis)
        } catch (error) {
          socket.emit('error', error.message)
        }
      })

      socket.on('disconnect', () => {
        console.log('📱 Client disconnected from dashboard')
        this.connectedClients.delete(socket.id)
      })
    })
  }

  async startRealTimeMonitoring() {
    console.log('🔄 Starting real-time monitoring for dashboard...')

    const updateInterval = 5 * 60 * 1000 // 5 minutes

    const monitor = async () => {
      try {
        console.log('📊 Running scheduled analysis...')
        const analysis = await this.bot.runCompleteAnalysis()
        this.lastAnalysis = analysis

        // Store performance data
        this.performanceData.push({
          timestamp: new Date().toISOString(),
          price: analysis.marketData.price.price,
          signal: analysis.signal.signal,
          confidence: analysis.signal.confidence,
          sentiment: this.extractSentiment(analysis.marketData)
        })

        // Keep only last 100 records
        if (this.performanceData.length > 100) {
          this.performanceData = this.performanceData.slice(-100)
        }

        // Check for significant alerts
        const alert = this.checkForSignificantChanges(analysis)
        if (alert) {
          this.alertsHistory.push(alert)
          if (this.alertsHistory.length > 50) {
            this.alertsHistory = this.alertsHistory.slice(-50)
          }
        }

        // Broadcast to all connected clients
        this.io.emit('analysis-update', analysis)
        this.io.emit('performance-update', {
          data: this.performanceData,
          summary: this.calculatePerformanceSummary()
        })

        if (alert) {
          this.io.emit('alert', alert)
        }
      } catch (error) {
        console.error('❌ Real-time monitoring error:', error.message)
        this.io.emit('error', error.message)
      }
    }

    // Run initial analysis
    await monitor()

    // Set up interval
    setInterval(monitor, updateInterval)
  }

  extractSentiment(marketData) {
    const bullish = marketData.summary.bullishNews || 0
    const bearish = marketData.summary.bearishNews || 0
    const total = bullish + bearish

    if (total === 0) return 'neutral'

    const bullishRatio = bullish / total
    if (bullishRatio > 0.6) return 'bullish'
    if (bullishRatio < 0.4) return 'bearish'
    return 'neutral'
  }

  checkForSignificantChanges(analysis) {
    if (this.performanceData.length < 2) return null

    const current = this.performanceData[this.performanceData.length - 1]
    const previous = this.performanceData[this.performanceData.length - 2]

    // Check for signal changes
    if (current.signal !== previous.signal) {
      return {
        type: 'signal_change',
        message: `Trading signal changed from ${previous.signal} to ${current.signal}`,
        timestamp: new Date().toISOString(),
        severity: this.calculateSeverity(current.signal, previous.signal)
      }
    }

    // Check for high confidence signals
    if (analysis.signal.confidence >= 8) {
      return {
        type: 'high_confidence',
        message: `High confidence ${analysis.signal.signal} signal (${analysis.signal.confidence}/10)`,
        timestamp: new Date().toISOString(),
        severity: 'high'
      }
    }

    return null
  }

  calculateSeverity(currentSignal, previousSignal) {
    const signalStrength = {
      STRONG_SELL: -2,
      SELL: -1,
      HOLD: 0,
      BUY: 1,
      STRONG_BUY: 2
    }

    const currentStrength = signalStrength[currentSignal] || 0
    const previousStrength = signalStrength[previousSignal] || 0
    const change = Math.abs(currentStrength - previousStrength)

    if (change >= 3) return 'critical'
    if (change >= 2) return 'high'
    if (change >= 1) return 'medium'
    return 'low'
  }

  calculatePerformanceSummary() {
    if (this.performanceData.length === 0) {
      return {
        totalSignals: 0,
        buySignals: 0,
        sellSignals: 0,
        avgConfidence: 0,
        lastUpdate: null
      }
    }

    const buySignals = this.performanceData.filter((d) => d.signal === 'BUY' || d.signal === 'STRONG_BUY').length

    const sellSignals = this.performanceData.filter((d) => d.signal === 'SELL' || d.signal === 'STRONG_SELL').length

    const avgConfidence = this.performanceData.reduce((sum, d) => sum + d.confidence, 0) / this.performanceData.length

    return {
      totalSignals: this.performanceData.length,
      buySignals,
      sellSignals,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      lastUpdate: this.performanceData[this.performanceData.length - 1]?.timestamp
    }
  }

  async start(port = 3000) {
    await this.init()

    this.server.listen(port, () => {
      console.log(`🌐 Trading Dashboard running on http://localhost:${port}`)
      console.log('📊 Features available:')
      console.log('   • Real-time market analysis')
      console.log('   • Live trading signals')
      console.log('   • Performance tracking')
      console.log('   • Alert notifications')
      console.log('   • Manual analysis triggers')
    })

    // Start real-time monitoring
    await this.startRealTimeMonitoring()
  }

  async cleanup() {
    await this.tradingSystem.cleanup()
    await this.bot.cleanup()
  }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new TradingDashboard()

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down dashboard...')
    await dashboard.cleanup()
    process.exit(0)
  })

  dashboard.start().catch(console.error)
}

export { TradingDashboard }
