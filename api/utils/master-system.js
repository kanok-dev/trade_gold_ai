import { EnhancedGoldTradingBot } from '../enhanced-trading-bot.js'
import { GoldDataScraper } from '../enhanced-web-scraping.js'
import { AdvancedRiskManager } from './risk-manager.js'
import { PortfolioOptimizer } from './portfolio-optimizer.js'
import { TechnicalAnalyzer } from './technical-analyzer.js'
import { TradingDashboard } from '../server.js'
import dotenv from 'dotenv'
import fs from 'fs/promises'

dotenv.config()

class MasterTradingSystem {
  constructor() {
    this.bot = new EnhancedGoldTradingBot()
    this.scraper = new GoldDataScraper()
    this.riskManager = new AdvancedRiskManager()
    this.portfolioOptimizer = new PortfolioOptimizer()
    this.technicalAnalyzer = new TechnicalAnalyzer()
    this.dashboard = new TradingDashboard()

    this.systemState = {
      isRunning: false,
      lastAnalysis: null,
      performance: {
        totalTrades: 0,
        successfulTrades: 0,
        totalPnL: 0,
        maxDrawdown: 0,
        winRate: 0
      },
      alerts: [],
      systemHealth: 'HEALTHY'
    }

    this.config = {
      analysisInterval: 15 * 60 * 1000, // 15 minutes
      enableDashboard: true,
      enableRealTimeTrading: false,
      riskLevel: 'MODERATE', // CONSERVATIVE, MODERATE, AGGRESSIVE
      maxDailyTrades: 5,
      enableAlerts: true
    }
  }

  async init() {
    console.log('🚀 Initializing Master Trading System...')
    console.log('='.repeat(60))

    try {
      // Initialize all components
      await this.bot.init()
      console.log('✅ Enhanced Trading Bot initialized')

      await this.scraper.init()
      console.log('✅ Robust Web Scraper initialized')

      // Load previous risk data if available
      try {
        await this.riskManager.loadRiskData('risk_data_latest.json')
        console.log('✅ Risk Manager initialized with historical data')
      } catch {
        console.log('✅ Risk Manager initialized with default settings')
      }

      console.log('✅ Portfolio Optimizer initialized')
      console.log('✅ Technical Analyzer initialized')

      if (this.config.enableDashboard) {
        // Dashboard will be started separately
        console.log('📊 Dashboard ready to start')
      }

      console.log('='.repeat(60))
      console.log('🎯 Master Trading System ready!')
      console.log(`📈 Analysis interval: ${this.config.analysisInterval / 60000} minutes`)
      console.log(`⚖️ Risk level: ${this.config.riskLevel}`)
      console.log(`🎯 Max daily trades: ${this.config.maxDailyTrades}`)
    } catch (error) {
      console.error('❌ System initialization failed:', error.message)
      throw error
    }
  }

  async runCompleteAnalysis() {
    console.log('\n🔄 Running Complete Market Analysis...')
    console.log('-'.repeat(50))

    const startTime = Date.now()

    try {
      // Step 1: Get market data
      console.log('📊 Step 1: Gathering market data...')
      const marketData = await this.scraper.getMarketData()

      // Step 2: Update technical analysis
      console.log('📈 Step 2: Updating technical analysis...')
      this.technicalAnalyzer.addPriceData(marketData.price.price)
      const technicalAnalysis = this.technicalAnalyzer.generateTechnicalAnalysis()

      // Step 3: Generate AI analysis
      console.log('🧠 Step 3: Generating AI analysis...')
      const aiAnalysis = await this.bot.generateTradingAnalysis(marketData)

      // Step 4: Generate trading signal
      console.log('🎯 Step 4: Generating trading signal...')
      const tradingSignal = await this.bot.generateTradingSignal(marketData, aiAnalysis)

      // Step 5: Risk assessment
      console.log('⚖️ Step 5: Performing risk assessment...')
      const riskRecommendation = this.riskManager.generateTradeRecommendation(tradingSignal.signal, tradingSignal.confidence, aiAnalysis, marketData)

      // Step 6: Portfolio optimization
      console.log('💼 Step 6: Optimizing portfolio allocation...')
      const portfolioRecommendation = this.portfolioOptimizer.generatePortfolioRecommendation(tradingSignal.signal, tradingSignal.confidence, marketData)

      // Step 7: Synthesize recommendations
      console.log('🔬 Step 7: Synthesizing recommendations...')
      const finalRecommendation = this.synthesizeRecommendations(marketData, technicalAnalysis, aiAnalysis, tradingSignal, riskRecommendation, portfolioRecommendation)

      const executionTime = Date.now() - startTime
      console.log(`✅ Analysis completed in ${(executionTime / 1000).toFixed(2)}s`)

      this.systemState.lastAnalysis = finalRecommendation

      return finalRecommendation
    } catch (error) {
      console.error('❌ Analysis failed:', error.message)
      this.addAlert('ANALYSIS_ERROR', `Complete analysis failed: ${error.message}`, 'HIGH')
      throw error
    }
  }

  synthesizeRecommendations(marketData, technical, ai, signal, risk, portfolio) {
    const synthesis = {
      timestamp: new Date().toISOString(),
      marketData,
      analyses: {
        technical: {
          trend: technical.timeframeAnalysis?.mediumTerm?.trend || 'UNKNOWN',
          momentum: technical.momentum?.mediumTerm?.direction || 'UNKNOWN',
          patterns: technical.patterns.length,
          signals: technical.signals.length,
          supportLevel: technical.supportLevels[0]?.price || null,
          resistanceLevel: technical.resistanceLevels[0]?.price || null
        },
        fundamental: {
          aiAnalysis: ai,
          newsCount: marketData.summary.totalNews || 0,
          sentimentScore: this.calculateSentimentScore(marketData),
          marketRegime: this.detectMarketRegime(marketData)
        },
        risk: {
          validated: risk.validated,
          riskScore: risk.riskScore,
          violations: risk.violations,
          recommendation: risk.recommendation
        },
        portfolio: {
          currentAllocation: portfolio.currentAllocations,
          recommendedAllocation: portfolio.recommendations.finalRecommendation,
          riskMetrics: portfolio.riskAssessment
        }
      },
      finalDecision: this.makeFinalDecision(technical, signal, risk, portfolio),
      confidence: this.calculateOverallConfidence(technical, signal, risk, portfolio),
      executionPlan: null, // Will be filled if decision is to trade
      alerts: this.generateAnalysisAlerts(technical, signal, risk, portfolio)
    }

    // Generate execution plan if decision is to trade
    if (synthesis.finalDecision.action === 'EXECUTE') {
      synthesis.executionPlan = this.generateExecutionPlan(synthesis)
    }

    return synthesis
  }

  makeFinalDecision(technical, signal, risk, portfolio) {
    const decisions = []

    // Technical analysis decision
    const technicalSignals = technical.signals || []
    const bullishTechnical = technicalSignals.filter((s) => s.type === 'BUY').length
    const bearishTechnical = technicalSignals.filter((s) => s.type === 'SELL').length

    if (bullishTechnical > bearishTechnical) {
      decisions.push({ source: 'TECHNICAL', action: 'BUY', weight: 0.3, confidence: technical.confidence || 50 })
    } else if (bearishTechnical > bullishTechnical) {
      decisions.push({ source: 'TECHNICAL', action: 'SELL', weight: 0.3, confidence: technical.confidence || 50 })
    } else {
      decisions.push({ source: 'TECHNICAL', action: 'HOLD', weight: 0.3, confidence: 30 })
    }

    // AI signal decision
    decisions.push({
      source: 'AI',
      action: signal.signal,
      weight: 0.4,
      confidence: signal.confidence * 10
    })

    // Risk management decision
    if (!risk.validated) {
      decisions.push({ source: 'RISK', action: 'AVOID', weight: 0.3, confidence: 90 })
    } else {
      decisions.push({
        source: 'RISK',
        action: risk.recommendation.action === 'EXECUTE' ? signal.signal : risk.recommendation.action,
        weight: 0.3,
        confidence: 100 - risk.riskScore * 10
      })
    }

    // Calculate weighted decision
    const weightedDecision = this.calculateWeightedDecision(decisions)

    return {
      action: weightedDecision.action,
      confidence: weightedDecision.confidence,
      reasoning: weightedDecision.reasoning,
      consensus: this.calculateConsensus(decisions),
      decisions: decisions
    }
  }

  calculateWeightedDecision(decisions) {
    const actions = ['BUY', 'SELL', 'HOLD', 'AVOID']
    const scores = {}

    actions.forEach((action) => {
      scores[action] = decisions.filter((d) => d.action === action || (action === 'BUY' && d.action.includes('BUY')) || (action === 'SELL' && d.action.includes('SELL'))).reduce((sum, d) => sum + d.weight * d.confidence, 0)
    })

    const maxScore = Math.max(...Object.values(scores))
    const bestAction = Object.keys(scores).find((action) => scores[action] === maxScore)

    const totalWeight = decisions.reduce((sum, d) => sum + d.weight, 0)
    const avgConfidence = decisions.reduce((sum, d) => sum + d.weight * d.confidence, 0) / totalWeight

    return {
      action: maxScore > 0 ? bestAction : 'HOLD',
      confidence: Math.round(avgConfidence),
      reasoning: `Weighted analysis: ${Object.entries(scores)
        .map(([action, score]) => `${action}: ${score.toFixed(1)}`)
        .join(', ')}`,
      scores
    }
  }

  calculateConsensus(decisions) {
    const uniqueActions = [...new Set(decisions.map((d) => d.action))]

    if (uniqueActions.length === 1) return 'UNANIMOUS'
    if (uniqueActions.length === 2) return 'MAJORITY'
    return 'DIVIDED'
  }

  calculateOverallConfidence(technical, signal, risk, portfolio) {
    const confidences = [technical.confidence || 50, signal.confidence * 10, risk.validated ? 100 - risk.riskScore * 10 : 20, portfolio.recommendations.finalRecommendation.confidence * 10]

    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length

    // Lower variance = higher overall confidence
    const variancePenalty = Math.sqrt(variance) / 10

    return Math.max(10, Math.min(100, Math.round(avgConfidence - variancePenalty)))
  }

  calculateSentimentScore(marketData) {
    const bullish = marketData.summary.bullishNews || 0
    const bearish = marketData.summary.bearishNews || 0
    const total = bullish + bearish

    if (total === 0) return 50 // Neutral

    return Math.round((bullish / total) * 100)
  }

  detectMarketRegime(marketData) {
    const sentimentScore = this.calculateSentimentScore(marketData)
    const newsVolume = marketData.summary.totalNews || 0

    if (newsVolume > 20) return 'HIGH_VOLATILITY'
    if (sentimentScore > 70) return 'BULLISH'
    if (sentimentScore < 30) return 'BEARISH'
    if (newsVolume < 5) return 'LOW_ACTIVITY'
    return 'NEUTRAL'
  }

  generateExecutionPlan(synthesis) {
    const decision = synthesis.finalDecision
    const marketData = synthesis.marketData
    const riskLevels = synthesis.analyses.risk

    return {
      action: decision.action,
      symbol: 'XAUUSD',
      size: synthesis.analyses.portfolio.recommendedAllocation.positionSize.dollarAmount,
      entryPrice: marketData.price.price,
      stopLoss: this.calculateStopLoss(marketData.price.price, decision.action),
      takeProfit: this.calculateTakeProfit(marketData.price.price, decision.action),
      timeframe: 'INTRADAY',
      maxRisk: '2%',
      executionType: decision.confidence > 80 ? 'MARKET' : 'LIMIT',
      notes: decision.reasoning
    }
  }

  calculateStopLoss(entryPrice, action) {
    const price = parseFloat(entryPrice.replace(/[^\d.-]/g, ''))
    const stopPercentage = 0.015 // 1.5%

    if (action.includes('BUY')) {
      return price * (1 - stopPercentage)
    } else if (action.includes('SELL')) {
      return price * (1 + stopPercentage)
    }
    return null
  }

  calculateTakeProfit(entryPrice, action) {
    const price = parseFloat(entryPrice.replace(/[^\d.-]/g, ''))
    const profitPercentage = 0.03 // 3%

    if (action.includes('BUY')) {
      return price * (1 + profitPercentage)
    } else if (action.includes('SELL')) {
      return price * (1 - profitPercentage)
    }
    return null
  }

  generateAnalysisAlerts(technical, signal, risk, portfolio) {
    const alerts = []

    // High confidence signal
    if (signal.confidence >= 8) {
      alerts.push({
        type: 'HIGH_CONFIDENCE_SIGNAL',
        message: `High confidence ${signal.signal} signal (${signal.confidence}/10)`,
        severity: 'HIGH'
      })
    }

    // Risk violations
    if (!risk.validated) {
      alerts.push({
        type: 'RISK_VIOLATION',
        message: `Trade blocked: ${risk.violations.join(', ')}`,
        severity: 'CRITICAL'
      })
    }

    // Technical pattern detected
    if (technical.patterns && technical.patterns.length > 0) {
      const strongPatterns = technical.patterns.filter((p) => p.confidence > 0.7)
      if (strongPatterns.length > 0) {
        alerts.push({
          type: 'PATTERN_DETECTED',
          message: `Strong pattern detected: ${strongPatterns[0].type}`,
          severity: 'MEDIUM'
        })
      }
    }

    // Portfolio rebalance needed
    if (portfolio.recommendations.optimizedAllocation.rebalanceNeeded) {
      alerts.push({
        type: 'REBALANCE_NEEDED',
        message: 'Portfolio rebalancing recommended',
        severity: 'LOW'
      })
    }

    return alerts
  }

  addAlert(type, message, severity = 'MEDIUM') {
    const alert = {
      id: `alert_${Date.now()}`,
      type,
      message,
      severity,
      timestamp: new Date().toISOString()
    }

    this.systemState.alerts.push(alert)

    // Keep only last 50 alerts
    if (this.systemState.alerts.length > 50) {
      this.systemState.alerts = this.systemState.alerts.slice(-50)
    }

    console.log(`🚨 ${severity} Alert: ${message}`)
  }

  async startContinuousOperation() {
    if (this.systemState.isRunning) {
      console.log('⚠️ System is already running')
      return
    }

    console.log('🔄 Starting continuous operation...')
    this.systemState.isRunning = true

    const runCycle = async () => {
      if (!this.systemState.isRunning) return

      try {
        const analysis = await this.runCompleteAnalysis()

        // Log key metrics
        console.log(`\n📊 Analysis Summary:`)
        console.log(`   Signal: ${analysis.finalDecision.action}`)
        console.log(`   Confidence: ${analysis.confidence}%`)
        console.log(`   Risk Score: ${analysis.analyses.risk.riskScore}/10`)
        console.log(`   Alerts: ${analysis.alerts.length}`)

        // Save analysis to file
        await this.saveAnalysisToFile(analysis)

        // Update system performance
        this.updateSystemPerformance(analysis)

        // Schedule next cycle
        setTimeout(runCycle, this.config.analysisInterval)
      } catch (error) {
        console.error('❌ Analysis cycle failed:', error.message)
        this.addAlert('SYSTEM_ERROR', `Analysis cycle failed: ${error.message}`, 'HIGH')

        // Retry after shorter interval
        setTimeout(runCycle, 60000) // 1 minute retry
      }
    }

    // Start first cycle
    runCycle()

    console.log(`✅ Continuous operation started (${this.config.analysisInterval / 60000} min intervals)`)
  }

  async stopContinuousOperation() {
    console.log('🛑 Stopping continuous operation...')
    this.systemState.isRunning = false

    // Save final state
    await this.saveSystemState()

    console.log('✅ Continuous operation stopped')
  }

  async saveAnalysisToFile(analysis) {
    const filename = `analysis_${new Date().toISOString().split('T')[0]}.json`
    const data = {
      timestamp: analysis.timestamp,
      analysis: analysis,
      systemState: this.systemState
    }

    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Failed to save analysis:', error.message)
    }
  }

  async saveSystemState() {
    const filename = 'system_state.json'
    try {
      await fs.writeFile(filename, JSON.stringify(this.systemState, null, 2))
      await this.riskManager.saveRiskData()
    } catch (error) {
      console.error('Failed to save system state:', error.message)
    }
  }

  updateSystemPerformance(analysis) {
    // This would normally track actual trade results
    // For now, we'll track analysis performance
    this.systemState.performance.totalTrades++

    if (analysis.confidence > 70) {
      this.systemState.performance.successfulTrades++
    }

    this.systemState.performance.winRate = this.systemState.performance.successfulTrades / this.systemState.performance.totalTrades
  }

  async startWithDashboard() {
    await this.init()

    if (this.config.enableDashboard) {
      // Start dashboard server
      this.dashboard.start(3000).catch(console.error)
    }

    await this.startContinuousOperation()
  }

  async cleanup() {
    await this.stopContinuousOperation()
    await this.bot.cleanup()
    await this.scraper.close()
    await this.dashboard.cleanup()
    console.log('🧹 System cleanup completed')
  }

  // Generate comprehensive system report
  generateSystemReport() {
    return {
      timestamp: new Date().toISOString(),
      systemState: this.systemState,
      configuration: this.config,
      lastAnalysis: this.systemState.lastAnalysis,
      performance: this.systemState.performance,
      riskMetrics: this.riskManager.generateRiskReport(),
      portfolioStatus: this.portfolioOptimizer.generatePerformanceReport(),
      technicalStatus: this.technicalAnalyzer.getAnalysisSummary(),
      alerts: this.systemState.alerts.slice(-10), // Last 10 alerts
      systemHealth: this.assessSystemHealth()
    }
  }

  assessSystemHealth() {
    const issues = []

    // Check last analysis time
    if (this.systemState.lastAnalysis) {
      const lastAnalysisTime = new Date(this.systemState.lastAnalysis.timestamp).getTime()
      const timeSinceLastAnalysis = Date.now() - lastAnalysisTime

      if (timeSinceLastAnalysis > this.config.analysisInterval * 2) {
        issues.push('STALE_ANALYSIS')
      }
    }

    // Check error rate
    const recentErrorAlerts = this.systemState.alerts.filter((a) => a.type.includes('ERROR') && Date.now() - new Date(a.timestamp).getTime() < 3600000) // Last hour

    if (recentErrorAlerts.length > 3) {
      issues.push('HIGH_ERROR_RATE')
    }

    // Check win rate
    if (this.systemState.performance.winRate < 0.3 && this.systemState.performance.totalTrades > 10) {
      issues.push('LOW_WIN_RATE')
    }

    return {
      status: issues.length === 0 ? 'HEALTHY' : issues.length < 3 ? 'WARNING' : 'CRITICAL',
      issues: issues,
      uptime: this.systemState.isRunning ? 'RUNNING' : 'STOPPED'
    }
  }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const masterSystem = new MasterTradingSystem()

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Master Trading System...')
    await masterSystem.cleanup()
    process.exit(0)
  })

  // Start with dashboard
  masterSystem.startWithDashboard().catch(console.error)
}

export { MasterTradingSystem }
