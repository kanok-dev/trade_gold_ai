import fs from 'fs/promises'
import path from 'path'

class AdvancedRiskManager {
  constructor() {
    this.positions = []
    this.riskRules = {
      maxPositionSize: 0.1, // 10% of portfolio
      maxDailyLoss: 0.02, // 2% max daily loss
      maxOverallExposure: 0.2, // 20% max gold exposure
      minConfidenceForTrade: 6, // Minimum confidence score
      stopLossPercentage: 0.03, // 3% stop loss
      takeProfitPercentage: 0.06, // 6% take profit (2:1 ratio)
      maxConsecutiveLosses: 3, // Max 3 losses in a row
      positionTimeout: 24 * 60 * 60 * 1000 // 24 hours max position time
    }
    this.portfolioValue = 100000 // $100k default portfolio
    this.dailyPnL = 0
    this.tradingHistory = []
    this.riskMetrics = {
      currentDrawdown: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      consecutiveLosses: 0
    }
  }

  // Calculate position size based on risk parameters
  calculatePositionSize(signal, confidence, currentPrice) {
    const baseSize = this.riskRules.maxPositionSize

    // Adjust size based on confidence
    const confidenceMultiplier = confidence / 10

    // Adjust size based on signal strength
    let signalMultiplier = 1
    if (signal.includes('STRONG')) {
      signalMultiplier = 1.5
    }

    // Reduce size after consecutive losses
    const lossMultiplier = Math.max(0.5, 1 - this.riskMetrics.consecutiveLosses * 0.1)

    const adjustedSize = baseSize * confidenceMultiplier * signalMultiplier * lossMultiplier

    // Ensure we don't exceed portfolio limits
    const maxDollarAmount = this.portfolioValue * adjustedSize
    const position = Math.min(maxDollarAmount, this.portfolioValue * this.riskRules.maxOverallExposure)

    return {
      percentage: adjustedSize,
      dollarAmount: position,
      shares: Math.floor(position / parseFloat(currentPrice.replace(/[^\d.-]/g, ''))),
      reasoning: `Base: ${(baseSize * 100).toFixed(1)}%, Confidence: ${(confidenceMultiplier * 100).toFixed(1)}%, Signal: ${(signalMultiplier * 100).toFixed(1)}%, Loss adj: ${(lossMultiplier * 100).toFixed(1)}%`
    }
  }

  // Validate if trade should be executed based on risk rules
  validateTrade(signal, confidence, analysis, marketData) {
    const violations = []

    // Check minimum confidence
    if (confidence < this.riskRules.minConfidenceForTrade) {
      violations.push(`Confidence ${confidence} below minimum ${this.riskRules.minConfidenceForTrade}`)
    }

    // Check daily loss limit
    if (this.dailyPnL < -this.portfolioValue * this.riskRules.maxDailyLoss) {
      violations.push(`Daily loss limit exceeded: ${((this.dailyPnL / this.portfolioValue) * 100).toFixed(2)}%`)
    }

    // Check consecutive losses
    if (this.riskMetrics.consecutiveLosses >= this.riskRules.maxConsecutiveLosses) {
      violations.push(`Maximum consecutive losses reached: ${this.riskMetrics.consecutiveLosses}`)
    }

    // Check market conditions
    const volatilityScore = this.assessMarketVolatility(marketData)
    if (volatilityScore > 8) {
      violations.push(`Market volatility too high: ${volatilityScore}/10`)
    }

    // Check news sentiment contradiction
    const sentimentScore = this.assessSentimentRisk(signal, marketData)
    if (sentimentScore > 7) {
      violations.push(`Sentiment risk too high: ${sentimentScore}/10`)
    }

    return {
      allowed: violations.length === 0,
      violations,
      riskScore: this.calculateOverallRiskScore(confidence, volatilityScore, sentimentScore)
    }
  }

  // Assess market volatility based on news and price action
  assessMarketVolatility(marketData) {
    let volatilityScore = 5 // Base score

    // Check news volume (high news volume = high volatility)
    const newsCount = marketData.summary.totalNews || 0
    if (newsCount > 20) volatilityScore += 2
    else if (newsCount > 15) volatilityScore += 1

    // Check sentiment divergence
    const bullish = marketData.summary.bullishNews || 0
    const bearish = marketData.summary.bearishNews || 0
    const total = bullish + bearish
    if (total > 0) {
      const sentimentRatio = Math.abs(bullish - bearish) / total
      if (sentimentRatio < 0.3) volatilityScore += 2 // Mixed signals = higher volatility
    }

    // Check for key economic events
    const newsText = marketData.news?.map((n) => n.title.toLowerCase()).join(' ') || ''
    const volatileKeywords = ['fed', 'interest rate', 'inflation', 'crisis', 'emergency', 'war', 'election']
    const keywordMatches = volatileKeywords.filter((keyword) => newsText.includes(keyword)).length
    volatilityScore += keywordMatches

    return Math.min(10, Math.max(1, volatilityScore))
  }

  // Assess sentiment risk (signal vs news alignment)
  assessSentimentRisk(signal, marketData) {
    let riskScore = 1 // Base low risk

    const bullish = marketData.summary.bullishNews || 0
    const bearish = marketData.summary.bearishNews || 0
    const total = bullish + bearish

    if (total === 0) return 5 // Medium risk if no sentiment data

    const sentimentRatio = bullish / total

    // Check if signal aligns with sentiment
    if (signal.includes('BUY') && sentimentRatio < 0.4) {
      riskScore += 3 // Buying against bearish sentiment
    } else if (signal.includes('SELL') && sentimentRatio > 0.6) {
      riskScore += 3 // Selling against bullish sentiment
    }

    // Check sentiment strength
    if (Math.abs(sentimentRatio - 0.5) > 0.3) {
      riskScore += 1 // Strong sentiment in either direction
    }

    return Math.min(10, riskScore)
  }

  // Calculate overall risk score
  calculateOverallRiskScore(confidence, volatility, sentiment) {
    const confidenceRisk = 10 - confidence // Lower confidence = higher risk
    const averageRisk = (confidenceRisk + volatility + sentiment) / 3
    return Math.round(averageRisk * 10) / 10
  }

  // Generate stop loss and take profit levels
  generateRiskLevels(entryPrice, signal) {
    const price = parseFloat(entryPrice.replace(/[^\d.-]/g, ''))
    let stopLoss, takeProfit

    if (signal.includes('BUY')) {
      stopLoss = price * (1 - this.riskRules.stopLossPercentage)
      takeProfit = price * (1 + this.riskRules.takeProfitPercentage)
    } else if (signal.includes('SELL')) {
      stopLoss = price * (1 + this.riskRules.stopLossPercentage)
      takeProfit = price * (1 - this.riskRules.takeProfitPercentage)
    } else {
      return null // No levels for HOLD
    }

    return {
      entryPrice: price,
      stopLoss: Math.round(stopLoss * 100) / 100,
      takeProfit: Math.round(takeProfit * 100) / 100,
      riskRewardRatio: this.riskRules.takeProfitPercentage / this.riskRules.stopLossPercentage
    }
  }

  // Create a comprehensive trade recommendation
  generateTradeRecommendation(signal, confidence, analysis, marketData) {
    const validation = this.validateTrade(signal, confidence, analysis, marketData)
    const currentPrice = marketData.price.price
    const positionSize = this.calculatePositionSize(signal, confidence, currentPrice)
    const riskLevels = this.generateRiskLevels(currentPrice, signal)

    const recommendation = {
      timestamp: new Date().toISOString(),
      signal,
      confidence,
      validated: validation.allowed,
      violations: validation.violations,
      riskScore: validation.riskScore,
      marketConditions: {
        volatility: this.assessMarketVolatility(marketData),
        sentimentRisk: this.assessSentimentRisk(signal, marketData),
        price: currentPrice
      },
      positionSizing: positionSize,
      riskLevels,
      recommendation: this.generateFinalRecommendation(validation, signal, confidence, validation.riskScore)
    }

    return recommendation
  }

  generateFinalRecommendation(validation, signal, confidence, riskScore) {
    if (!validation.allowed) {
      return {
        action: 'AVOID',
        reason: `Trade rejected: ${validation.violations.join(', ')}`,
        priority: 'HIGH RISK'
      }
    }

    if (riskScore <= 3 && confidence >= 8) {
      return {
        action: 'EXECUTE',
        reason: 'High confidence, low risk - excellent setup',
        priority: 'HIGH PRIORITY'
      }
    } else if (riskScore <= 5 && confidence >= 7) {
      return {
        action: 'CONSIDER',
        reason: 'Good setup with manageable risk',
        priority: 'MEDIUM PRIORITY'
      }
    } else if (riskScore <= 7 && confidence >= 6) {
      return {
        action: 'CAUTION',
        reason: 'Acceptable but monitor closely',
        priority: 'LOW PRIORITY'
      }
    } else {
      return {
        action: 'AVOID',
        reason: `Risk too high (${riskScore}/10) or confidence too low (${confidence}/10)`,
        priority: 'HIGH RISK'
      }
    }
  }

  // Track trade execution and update metrics
  recordTrade(recommendation, actualExecution = null) {
    const trade = {
      id: `trade_${Date.now()}`,
      timestamp: recommendation.timestamp,
      signal: recommendation.signal,
      confidence: recommendation.confidence,
      riskScore: recommendation.riskScore,
      positionSize: recommendation.positionSizing.dollarAmount,
      executed: !!actualExecution,
      ...actualExecution
    }

    this.tradingHistory.push(trade)
    this.updateRiskMetrics()

    return trade
  }

  // Update risk metrics based on trading history
  updateRiskMetrics() {
    if (this.tradingHistory.length === 0) return

    const executedTrades = this.tradingHistory.filter((t) => t.executed)
    if (executedTrades.length === 0) return

    // Calculate win rate
    const winningTrades = executedTrades.filter((t) => (t.pnl || 0) > 0)
    this.riskMetrics.winRate = winningTrades.length / executedTrades.length

    // Calculate profit factor
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalLosses = Math.abs(executedTrades.filter((t) => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0))
    this.riskMetrics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0

    // Update consecutive losses
    let consecutiveLosses = 0
    for (let i = executedTrades.length - 1; i >= 0; i--) {
      if ((executedTrades[i].pnl || 0) < 0) {
        consecutiveLosses++
      } else {
        break
      }
    }
    this.riskMetrics.consecutiveLosses = consecutiveLosses

    // Calculate drawdown
    let peak = this.portfolioValue
    let maxDrawdown = 0
    let runningValue = this.portfolioValue

    for (const trade of executedTrades) {
      runningValue += trade.pnl || 0
      if (runningValue > peak) peak = runningValue
      const drawdown = (peak - runningValue) / peak
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    }

    this.riskMetrics.maxDrawdown = maxDrawdown
    this.riskMetrics.currentDrawdown = (peak - runningValue) / peak
  }

  // Generate risk report
  generateRiskReport() {
    return {
      timestamp: new Date().toISOString(),
      portfolioValue: this.portfolioValue,
      dailyPnL: this.dailyPnL,
      riskRules: this.riskRules,
      riskMetrics: this.riskMetrics,
      activePositions: this.positions.length,
      tradingHistory: {
        totalTrades: this.tradingHistory.length,
        executedTrades: this.tradingHistory.filter((t) => t.executed).length,
        recentTrades: this.tradingHistory.slice(-5)
      },
      recommendations: this.generateRiskRecommendations()
    }
  }

  generateRiskRecommendations() {
    const recommendations = []

    // Check win rate
    if (this.riskMetrics.winRate < 0.4) {
      recommendations.push({
        type: 'warning',
        message: 'Win rate below 40% - consider reducing position sizes or reviewing strategy'
      })
    }

    // Check drawdown
    if (this.riskMetrics.currentDrawdown > 0.1) {
      recommendations.push({
        type: 'alert',
        message: 'Current drawdown exceeds 10% - consider reducing risk'
      })
    }

    // Check consecutive losses
    if (this.riskMetrics.consecutiveLosses >= 2) {
      recommendations.push({
        type: 'caution',
        message: `${this.riskMetrics.consecutiveLosses} consecutive losses - consider pausing trading`
      })
    }

    // Check profit factor
    if (this.riskMetrics.profitFactor < 1.2) {
      recommendations.push({
        type: 'info',
        message: 'Profit factor below 1.2 - review entry/exit criteria'
      })
    }

    return recommendations
  }

  // Save risk data to file
  async saveRiskData() {
    const riskData = {
      timestamp: new Date().toISOString(),
      riskMetrics: this.riskMetrics,
      tradingHistory: this.tradingHistory,
      portfolioValue: this.portfolioValue,
      riskRules: this.riskRules
    }

    const filename = `risk_data_${new Date().toISOString().split('T')[0]}.json`
    await fs.writeFile(filename, JSON.stringify(riskData, null, 2))
    console.log(`💾 Risk data saved to ${filename}`)
  }

  // Load previous risk data
  async loadRiskData(filename) {
    try {
      const data = await fs.readFile(filename, 'utf8')
      const riskData = JSON.parse(data)

      this.riskMetrics = riskData.riskMetrics || this.riskMetrics
      this.tradingHistory = riskData.tradingHistory || []
      this.portfolioValue = riskData.portfolioValue || this.portfolioValue

      console.log(`📊 Risk data loaded from ${filename}`)
      this.updateRiskMetrics()
    } catch (error) {
      console.log(`⚠️ Could not load risk data: ${error.message}`)
    }
  }
}

export { AdvancedRiskManager }
