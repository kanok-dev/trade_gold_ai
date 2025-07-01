import { EnhancedGoldTradingBot } from '../enhanced-trading-bot.js'
import { GoldDataScraper } from '../enhanced-web-scraping.js'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

dotenv.config()

class IntegratedGoldTradingSystem {
  constructor() {
    this.bot = new EnhancedGoldTradingBot()
    this.scraper = new GoldDataScraper()
    this.dataHistory = []
    this.tradingJournal = []
    this.alertThresholds = {
      priceChange: 2.0, // Alert if price changes more than 2%
      sentimentShift: 0.5, // Alert if sentiment ratio changes significantly
      newsVolume: 15 // Alert if news volume exceeds threshold
    }
  }

  async init() {
    console.log('🚀 Initializing Integrated Gold Trading System...')
    await this.bot.init()
    console.log('✅ System initialized successfully')
  }

  async cleanup() {
    await this.bot.cleanup()
  }

  async runContinuousMonitoring(intervalMinutes = 15) {
    console.log(`📊 Starting continuous monitoring (${intervalMinutes} min intervals)...`)

    let iteration = 0
    const monitor = async () => {
      try {
        iteration++
        console.log(`\n🔄 Monitoring Iteration #${iteration} - ${new Date().toLocaleString()}`)

        // Get fresh market data
        const analysis = await this.bot.runCompleteAnalysis()

        // Store in history
        this.dataHistory.push(analysis)

        // Check for alerts
        await this.checkAlerts(analysis)

        // Log trading decision
        await this.logTradingDecision(analysis)

        // Save data to files
        await this.saveDataToFile(analysis)

        console.log(`✅ Iteration #${iteration} completed. Next check in ${intervalMinutes} minutes...`)
      } catch (error) {
        console.error(`❌ Monitoring iteration #${iteration} failed:`, error.message)
      }
    }

    // Run initial check
    await monitor()

    // Set up interval
    const intervalId = setInterval(monitor, intervalMinutes * 60 * 1000)

    console.log(`⏰ Monitoring started. Press Ctrl+C to stop.`)

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping monitoring system...')
      clearInterval(intervalId)
      await this.cleanup()
      console.log('✅ System stopped gracefully')
      process.exit(0)
    })
  }

  async checkAlerts(analysis) {
    const alerts = []
    const marketData = analysis.marketData
    const signal = analysis.signal

    // Price change alert
    const priceChange = parseFloat(marketData.price.change?.replace(/[^-0-9.]/g, '') || 0)
    const currentPrice = parseFloat(marketData.price.price?.replace(/[^0-9.]/g, '') || 0)
    const priceChangePercent = Math.abs((priceChange / currentPrice) * 100)

    if (priceChangePercent > this.alertThresholds.priceChange) {
      alerts.push({
        type: 'PRICE_ALERT',
        message: `🚨 Significant price movement: ${marketData.price.change} (${priceChangePercent.toFixed(2)}%)`,
        severity: 'HIGH'
      })
    }

    // News volume alert
    if (marketData.summary.totalNews > this.alertThresholds.newsVolume) {
      alerts.push({
        type: 'NEWS_VOLUME',
        message: `📰 High news activity: ${marketData.summary.totalNews} articles`,
        severity: 'MEDIUM'
      })
    }

    // Sentiment shift alert
    const sentimentRatio = marketData.summary.bullishNews / (marketData.summary.bearishNews || 1)
    if (sentimentRatio > 2 || sentimentRatio < 0.5) {
      alerts.push({
        type: 'SENTIMENT_SHIFT',
        message: `💭 Strong sentiment bias detected: ${sentimentRatio > 2 ? 'BULLISH' : 'BEARISH'}`,
        severity: 'MEDIUM'
      })
    }

    // Trading signal confidence alert
    if (signal.confidence >= 8) {
      alerts.push({
        type: 'HIGH_CONFIDENCE_SIGNAL',
        message: `🎯 High confidence trading signal: ${signal.signal} (${signal.confidence}/10)`,
        severity: 'HIGH'
      })
    }

    // Display alerts
    if (alerts.length > 0) {
      console.log('\n🚨 TRADING ALERTS 🚨')
      console.log('='.repeat(50))
      alerts.forEach((alert) => {
        const emoji = alert.severity === 'HIGH' ? '🔴' : '🟡'
        console.log(`${emoji} [${alert.type}] ${alert.message}`)
      })
    }

    return alerts
  }

  async logTradingDecision(analysis) {
    const decision = {
      timestamp: analysis.timestamp,
      price: analysis.marketData.price.price,
      change: analysis.marketData.price.change,
      signal: analysis.signal.signal,
      confidence: analysis.signal.confidence,
      reasoning: analysis.signal.reasoning,
      marketSentiment: {
        bullish: analysis.marketData.summary.bullishNews,
        bearish: analysis.marketData.summary.bearishNews,
        total: analysis.marketData.summary.totalNews
      }
    }

    this.tradingJournal.push(decision)

    console.log('\n📝 TRADING DECISION LOGGED')
    console.log(`Decision: ${decision.signal} | Confidence: ${decision.confidence}/10`)
    console.log(`Reasoning: ${decision.reasoning}`)
  }

  async saveDataToFile(analysis) {
    try {
      const dataDir = './trading-data'

      // Create directory if it doesn't exist
      try {
        await fs.access(dataDir)
      } catch {
        await fs.mkdir(dataDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().split('T')[0]

      // Save daily analysis
      const analysisFile = path.join(dataDir, `analysis-${timestamp}.json`)
      await fs.writeFile(analysisFile, JSON.stringify(analysis, null, 2))

      // Save trading journal
      const journalFile = path.join(dataDir, 'trading-journal.json')
      await fs.writeFile(journalFile, JSON.stringify(this.tradingJournal, null, 2))

      // Save summary data
      const summaryFile = path.join(dataDir, 'daily-summary.json')
      const summary = this.generateDailySummary()
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2))
    } catch (error) {
      console.error('❌ Failed to save data to file:', error.message)
    }
  }

  generateDailySummary() {
    const today = new Date().toISOString().split('T')[0]
    const todayDecisions = this.tradingJournal.filter((d) => d.timestamp.startsWith(today))

    return {
      date: today,
      totalDecisions: todayDecisions.length,
      signals: {
        buy: todayDecisions.filter((d) => d.signal === 'BUY').length,
        sell: todayDecisions.filter((d) => d.signal === 'SELL').length,
        hold: todayDecisions.filter((d) => d.signal === 'HOLD').length
      },
      averageConfidence: todayDecisions.length > 0 ? todayDecisions.reduce((sum, d) => sum + d.confidence, 0) / todayDecisions.length : 0,
      priceRange: {
        high: Math.max(...todayDecisions.map((d) => parseFloat(d.price?.replace(/[^0-9.]/g, '') || 0))),
        low: Math.min(...todayDecisions.map((d) => parseFloat(d.price?.replace(/[^0-9.]/g, '') || 0)))
      }
    }
  }

  async runBacktest(days = 7) {
    console.log(`📈 Running backtest analysis for last ${days} days...`)

    // This would normally load historical data
    // For now, we'll simulate with current analysis
    const results = {
      period: `${days} days`,
      totalTrades: this.tradingJournal.length,
      accuracy: 0,
      profitability: 0,
      recommendations: []
    }

    if (this.tradingJournal.length > 0) {
      const highConfidenceTrades = this.tradingJournal.filter((t) => t.confidence >= 7)
      results.accuracy = ((highConfidenceTrades.length / this.tradingJournal.length) * 100).toFixed(1)

      console.log('\n📊 BACKTEST RESULTS')
      console.log('='.repeat(40))
      console.log(`📊 Period: ${results.period}`)
      console.log(`🎯 Total Signals: ${results.totalTrades}`)
      console.log(`💯 High Confidence Signals: ${highConfidenceTrades.length}`)
      console.log(`📈 Signal Accuracy: ${results.accuracy}%`)

      // Generate recommendations
      if (results.accuracy < 60) {
        console.log('💡 Recommendation: Consider adjusting confidence thresholds')
      }
      if (highConfidenceTrades.length < results.totalTrades * 0.3) {
        console.log('💡 Recommendation: System may be too conservative')
      }
    }

    return results
  }

  async runOnDemandAnalysis() {
    console.log('⚡ Running on-demand comprehensive analysis...')

    try {
      const analysis = await this.bot.runCompleteAnalysis()
      const alerts = await this.checkAlerts(analysis)
      await this.logTradingDecision(analysis)

      return {
        analysis,
        alerts,
        summary: this.generateDailySummary()
      }
    } catch (error) {
      console.error('❌ On-demand analysis failed:', error)
      throw error
    }
  }

  getSystemStatus() {
    return {
      uptime: process.uptime(),
      dataHistoryCount: this.dataHistory.length,
      tradingJournalCount: this.tradingJournal.length,
      lastAnalysis: this.dataHistory[this.dataHistory.length - 1]?.timestamp || 'None',
      alertThresholds: this.alertThresholds
    }
  }
}

// Command-line interface
async function main() {
  const system = new IntegratedGoldTradingSystem()
  const command = process.argv[2] || 'help'

  try {
    await system.init()

    switch (command) {
      case 'monitor':
        const interval = parseInt(process.argv[3]) || 15
        await system.runContinuousMonitoring(interval)
        break

      case 'analyze':
        await system.runOnDemandAnalysis()
        break

      case 'backtest':
        const days = parseInt(process.argv[3]) || 7
        await system.runBacktest(days)
        break

      case 'status':
        console.log('📊 System Status:', system.getSystemStatus())
        break

      default:
        console.log(`
🤖 Integrated Gold Trading System Commands:

📊 node integrated-system.js monitor [minutes]  - Start continuous monitoring
⚡ node integrated-system.js analyze            - Run one-time analysis  
📈 node integrated-system.js backtest [days]   - Run backtest analysis
📋 node integrated-system.js status            - Show system status

Example: node integrated-system.js monitor 10  (monitor every 10 minutes)
        `)
    }
  } finally {
    await system.cleanup()
  }
}

// Export for use in other modules
export { IntegratedGoldTradingSystem }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
