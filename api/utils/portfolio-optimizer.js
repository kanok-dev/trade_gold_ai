import { AdvancedRiskManager } from './risk-manager.js'

class PortfolioOptimizer {
  constructor() {
    this.riskManager = new AdvancedRiskManager()
    this.portfolio = {
      cash: 100000,
      goldPosition: 0,
      totalValue: 100000,
      unrealizedPnL: 0,
      realizedPnL: 0
    }
    this.allocations = {
      gold: { target: 0.15, current: 0, min: 0, max: 0.25 },
      cash: { target: 0.85, current: 1, min: 0.75, max: 1 }
    }
    this.rebalanceThreshold = 0.05 // 5% deviation triggers rebalance
    this.performanceMetrics = {
      dailyReturns: [],
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      beta: 0 // vs gold benchmark
    }
  }

  // Optimize portfolio allocation based on signals and risk
  optimizeAllocation(signal, confidence, marketData, riskMetrics) {
    const recommendation = this.riskManager.generateTradeRecommendation(signal, confidence, null, marketData)

    // Base allocation adjustment on signal strength and risk
    let targetGoldAllocation = this.allocations.gold.target

    if (recommendation.validated && recommendation.riskScore <= 5) {
      if (signal.includes('STRONG_BUY')) {
        targetGoldAllocation = Math.min(this.allocations.gold.max, 0.25)
      } else if (signal.includes('BUY')) {
        targetGoldAllocation = Math.min(this.allocations.gold.max, 0.2)
      } else if (signal.includes('STRONG_SELL')) {
        targetGoldAllocation = Math.max(this.allocations.gold.min, 0.05)
      } else if (signal.includes('SELL')) {
        targetGoldAllocation = Math.max(this.allocations.gold.min, 0.1)
      }
    }

    // Adjust based on confidence
    const confidenceAdjustment = (confidence - 7) * 0.02 // +/- 2% per confidence point above/below 7
    targetGoldAllocation = Math.max(this.allocations.gold.min, Math.min(this.allocations.gold.max, targetGoldAllocation + confidenceAdjustment))

    // Adjust based on market volatility
    const volatility = this.riskManager.assessMarketVolatility(marketData)
    if (volatility > 7) {
      targetGoldAllocation *= 0.8 // Reduce exposure in high volatility
    }

    return {
      targetAllocation: {
        gold: targetGoldAllocation,
        cash: 1 - targetGoldAllocation
      },
      currentAllocation: {
        gold: this.allocations.gold.current,
        cash: this.allocations.cash.current
      },
      rebalanceNeeded: Math.abs(targetGoldAllocation - this.allocations.gold.current) > this.rebalanceThreshold,
      recommendation
    }
  }

  // Calculate Kelly Criterion optimal position size
  calculateKellyPosition(winRate, avgWin, avgLoss, confidence) {
    if (winRate <= 0 || avgLoss <= 0) return 0

    const b = avgWin / avgLoss // Win/loss ratio
    const p = winRate // Probability of winning
    const q = 1 - p // Probability of losing

    let kellyF = (b * p - q) / b

    // Apply confidence adjustment
    kellyF *= confidence / 10

    // Cap at reasonable levels
    kellyF = Math.max(0, Math.min(0.25, kellyF))

    return kellyF
  }

  // Modern Portfolio Theory optimization
  calculateOptimalWeights(expectedReturns, riskProfile = 'moderate') {
    const riskProfiles = {
      conservative: { riskTolerance: 0.05, returnTarget: 0.08 },
      moderate: { riskTolerance: 0.1, returnTarget: 0.12 },
      aggressive: { riskTolerance: 0.2, returnTarget: 0.18 }
    }

    const profile = riskProfiles[riskProfile]

    // Simplified MPT calculation
    const goldReturn = expectedReturns.gold || 0.1
    const cashReturn = 0.02 // Risk-free rate
    const goldVolatility = 0.2 // Assumed gold volatility

    // Calculate optimal gold weight using risk-return optimization
    const excessReturn = goldReturn - cashReturn
    const optimalWeight = Math.min((profile.riskTolerance / (goldVolatility * goldVolatility)) * excessReturn, this.allocations.gold.max)

    return {
      gold: Math.max(this.allocations.gold.min, optimalWeight),
      cash: 1 - optimalWeight,
      expectedReturn: optimalWeight * goldReturn + (1 - optimalWeight) * cashReturn,
      expectedRisk: optimalWeight * goldVolatility
    }
  }

  // Dynamic position sizing based on market regime
  calculateDynamicPosition(signal, confidence, marketData, portfolioMetrics) {
    const basePosition = this.riskManager.calculatePositionSize(signal, confidence, marketData.price.price)

    // Market regime detection
    const regime = this.detectMarketRegime(marketData)

    // Volatility adjustment
    const volatilityMultiplier = this.calculateVolatilityMultiplier(marketData)

    // Momentum adjustment
    const momentumMultiplier = this.calculateMomentumMultiplier(signal, marketData)

    // Portfolio heat adjustment (reduce size if portfolio is stressed)
    const portfolioHeatMultiplier = this.calculatePortfolioHeatMultiplier(portfolioMetrics)

    const adjustedPosition = {
      ...basePosition,
      percentage: basePosition.percentage * regime.multiplier * volatilityMultiplier * momentumMultiplier * portfolioHeatMultiplier,
      reasoning: `${basePosition.reasoning}, Regime: ${regime.type} (${(regime.multiplier * 100).toFixed(0)}%), Vol: ${(volatilityMultiplier * 100).toFixed(0)}%, Momentum: ${(momentumMultiplier * 100).toFixed(0)}%, Heat: ${(
        portfolioHeatMultiplier * 100
      ).toFixed(0)}%`
    }

    // Recalculate dollar amount
    adjustedPosition.dollarAmount = this.portfolio.totalValue * adjustedPosition.percentage
    adjustedPosition.shares = Math.floor(adjustedPosition.dollarAmount / parseFloat(marketData.price.price.replace(/[^\d.-]/g, '')))

    return adjustedPosition
  }

  detectMarketRegime(marketData) {
    const newsVolume = marketData.summary.totalNews || 0
    const sentimentMix = this.calculateSentimentMix(marketData)

    // High volatility regime
    if (newsVolume > 20 || sentimentMix.divergence > 0.8) {
      return { type: 'high_volatility', multiplier: 0.6 }
    }

    // Trending regime
    if (sentimentMix.dominant > 0.7) {
      return { type: 'trending', multiplier: 1.2 }
    }

    // Sideways/uncertain regime
    if (sentimentMix.divergence > 0.6) {
      return { type: 'sideways', multiplier: 0.8 }
    }

    // Normal regime
    return { type: 'normal', multiplier: 1.0 }
  }

  calculateSentimentMix(marketData) {
    const bullish = marketData.summary.bullishNews || 0
    const bearish = marketData.summary.bearishNews || 0
    const total = bullish + bearish

    if (total === 0) return { dominant: 0.5, divergence: 0 }

    const bullishRatio = bullish / total
    const dominant = Math.max(bullishRatio, 1 - bullishRatio)
    const divergence = Math.abs(bullishRatio - 0.5) * 2

    return { dominant, divergence }
  }

  calculateVolatilityMultiplier(marketData) {
    const volatility = this.riskManager.assessMarketVolatility(marketData)

    // Reduce position size as volatility increases
    if (volatility >= 8) return 0.5
    if (volatility >= 6) return 0.7
    if (volatility >= 4) return 0.9
    return 1.0
  }

  calculateMomentumMultiplier(signal, marketData) {
    // Check if signal aligns with news sentiment
    const sentimentMix = this.calculateSentimentMix(marketData)

    if (signal.includes('BUY') && sentimentMix.dominant > 0.7) {
      return 1.2 // Bullish signal with bullish sentiment
    }

    if (signal.includes('SELL') && sentimentMix.dominant > 0.7) {
      return 1.2 // Bearish signal with bearish sentiment
    }

    if (signal.includes('BUY') && sentimentMix.divergence < 0.3) {
      return 0.8 // Mixed sentiment for buy signal
    }

    return 1.0
  }

  calculatePortfolioHeatMultiplier(metrics) {
    const { currentDrawdown, consecutiveLosses } = metrics

    // Reduce position size during drawdowns
    if (currentDrawdown > 0.15) return 0.5 // Severe drawdown
    if (currentDrawdown > 0.1) return 0.7 // Moderate drawdown
    if (currentDrawdown > 0.05) return 0.9 // Minor drawdown

    // Reduce size after consecutive losses
    if (consecutiveLosses >= 3) return 0.6
    if (consecutiveLosses >= 2) return 0.8

    return 1.0
  }

  // Generate comprehensive portfolio recommendation
  generatePortfolioRecommendation(signal, confidence, marketData) {
    const optimizedAllocation = this.optimizeAllocation(signal, confidence, marketData, this.riskManager.riskMetrics)
    const dynamicPosition = this.calculateDynamicPosition(signal, confidence, marketData, this.riskManager.riskMetrics)
    const kellyPosition = this.calculateKellyPosition(
      this.riskManager.riskMetrics.winRate,
      0.06, // Assumed average win
      0.03, // Assumed average loss
      confidence
    )

    const mptWeights = this.calculateOptimalWeights({
      gold: this.estimateGoldReturn(signal, confidence, marketData)
    })

    return {
      timestamp: new Date().toISOString(),
      currentPortfolio: this.portfolio,
      currentAllocations: this.allocations,
      recommendations: {
        optimizedAllocation,
        dynamicPosition,
        kellyPosition: {
          percentage: kellyPosition,
          dollarAmount: this.portfolio.totalValue * kellyPosition,
          reasoning: `Kelly criterion based on win rate ${(this.riskManager.riskMetrics.winRate * 100).toFixed(1)}%`
        },
        mptWeights,
        finalRecommendation: this.synthesizeRecommendations(optimizedAllocation, dynamicPosition, kellyPosition, mptWeights)
      },
      riskAssessment: {
        portfolioRisk: this.calculatePortfolioRisk(),
        concentrationRisk: this.calculateConcentrationRisk(),
        liquidityRisk: this.calculateLiquidityRisk()
      }
    }
  }

  estimateGoldReturn(signal, confidence, marketData) {
    const baseReturn = 0.1 // 10% annual return assumption

    // Adjust based on signal
    let signalMultiplier = 1
    if (signal.includes('STRONG_BUY')) signalMultiplier = 1.5
    else if (signal.includes('BUY')) signalMultiplier = 1.2
    else if (signal.includes('SELL')) signalMultiplier = 0.8
    else if (signal.includes('STRONG_SELL')) signalMultiplier = 0.5

    // Adjust based on confidence
    const confidenceMultiplier = confidence / 10

    return baseReturn * signalMultiplier * confidenceMultiplier
  }

  synthesizeRecommendations(optimized, dynamic, kelly, mpt) {
    // Weight different approaches
    const weights = {
      optimized: 0.3,
      dynamic: 0.4,
      kelly: 0.2,
      mpt: 0.1
    }

    const weightedPosition = optimized.targetAllocation.gold * weights.optimized + dynamic.percentage * weights.dynamic + kelly * weights.kelly + mpt.gold * weights.mpt

    return {
      recommendedGoldAllocation: Math.round(weightedPosition * 1000) / 1000,
      positionSize: {
        percentage: weightedPosition,
        dollarAmount: this.portfolio.totalValue * weightedPosition,
        shares: Math.floor((this.portfolio.totalValue * weightedPosition) / 2000) // Assuming $2000/oz gold
      },
      confidence: this.calculateRecommendationConfidence(optimized, dynamic, kelly, mpt),
      reasoning: `Synthesized from: Optimized (${(optimized.targetAllocation.gold * 100).toFixed(1)}%), Dynamic (${(dynamic.percentage * 100).toFixed(1)}%), Kelly (${(kelly * 100).toFixed(1)}%), MPT (${(mpt.gold * 100).toFixed(1)}%)`
    }
  }

  calculateRecommendationConfidence(optimized, dynamic, kelly, mpt) {
    // Calculate variance between different methods
    const positions = [optimized.targetAllocation.gold, dynamic.percentage, kelly, mpt.gold]

    const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length
    const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length
    const standardDeviation = Math.sqrt(variance)

    // Lower variance = higher confidence
    const confidence = Math.max(1, 10 - standardDeviation * 50)
    return Math.round(confidence)
  }

  calculatePortfolioRisk() {
    const goldWeight = this.allocations.gold.current
    const goldVolatility = 0.2 // Assumed annual volatility

    return {
      annualVolatility: goldWeight * goldVolatility,
      valueAtRisk95: this.portfolio.totalValue * goldWeight * goldVolatility * 1.65, // 95% VaR
      maximumLoss: this.portfolio.totalValue * goldWeight * 0.5 // Stress test scenario
    }
  }

  calculateConcentrationRisk() {
    const goldConcentration = this.allocations.gold.current

    return {
      concentrationLevel: goldConcentration,
      riskLevel: goldConcentration > 0.3 ? 'HIGH' : goldConcentration > 0.2 ? 'MEDIUM' : 'LOW',
      recommendation: goldConcentration > 0.25 ? 'Consider diversification' : 'Acceptable concentration'
    }
  }

  calculateLiquidityRisk() {
    // Gold is generally liquid, but position size matters
    const positionSize = this.portfolio.goldPosition

    return {
      liquidityLevel: positionSize > 50000 ? 'MEDIUM' : 'HIGH',
      estimatedLiquidationTime: positionSize > 100000 ? '1-2 days' : 'Same day',
      impactCost: positionSize > 50000 ? '0.1-0.3%' : '<0.1%'
    }
  }

  // Update portfolio with new position
  updatePortfolio(trade) {
    if (trade.type === 'BUY') {
      this.portfolio.goldPosition += trade.shares * trade.price
      this.portfolio.cash -= trade.shares * trade.price
    } else if (trade.type === 'SELL') {
      this.portfolio.goldPosition -= trade.shares * trade.price
      this.portfolio.cash += trade.shares * trade.price
      this.portfolio.realizedPnL += trade.pnl || 0
    }

    this.portfolio.totalValue = this.portfolio.cash + this.portfolio.goldPosition
    this.updateAllocations()
  }

  updateAllocations() {
    this.allocations.gold.current = this.portfolio.goldPosition / this.portfolio.totalValue
    this.allocations.cash.current = this.portfolio.cash / this.portfolio.totalValue
  }

  // Generate performance report
  generatePerformanceReport() {
    return {
      timestamp: new Date().toISOString(),
      portfolio: this.portfolio,
      allocations: this.allocations,
      performanceMetrics: this.performanceMetrics,
      riskMetrics: this.calculatePortfolioRisk(),
      concentrationRisk: this.calculateConcentrationRisk(),
      liquidityRisk: this.calculateLiquidityRisk()
    }
  }
}

export { PortfolioOptimizer }
