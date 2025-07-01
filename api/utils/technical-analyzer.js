class TechnicalAnalyzer {
  constructor() {
    this.priceHistory = []
    this.indicators = {}
    this.patterns = []
    this.supportLevels = []
    this.resistanceLevels = []
  }

  // Add price data point
  addPriceData(price, timestamp = new Date()) {
    const priceValue = parseFloat(price.replace(/[^\d.-]/g, ''))

    this.priceHistory.push({
      price: priceValue,
      timestamp: timestamp,
      high: priceValue, // Simplified - in real implementation these would be OHLC
      low: priceValue,
      open: priceValue,
      close: priceValue,
      volume: 1000000 // Placeholder volume
    })

    // Keep only last 200 data points for efficiency
    if (this.priceHistory.length > 200) {
      this.priceHistory.shift()
    }

    this.calculateAllIndicators()
    this.detectPatterns()
    this.updateSupportResistance()
  }

  // Calculate all technical indicators
  calculateAllIndicators() {
    if (this.priceHistory.length < 20) return

    this.indicators = {
      sma: this.calculateSMA(),
      ema: this.calculateEMA(),
      rsi: this.calculateRSI(),
      macd: this.calculateMACD(),
      bollingerBands: this.calculateBollingerBands(),
      stochastic: this.calculateStochastic(),
      atr: this.calculateATR(),
      adx: this.calculateADX(),
      fibonacci: this.calculateFibonacci()
    }
  }

  // Simple Moving Averages
  calculateSMA() {
    const periods = [5, 10, 20, 50, 100, 200]
    const sma = {}

    periods.forEach((period) => {
      if (this.priceHistory.length >= period) {
        const sum = this.priceHistory.slice(-period).reduce((sum, candle) => sum + candle.close, 0)
        sma[`sma${period}`] = sum / period
      }
    })

    return sma
  }

  // Exponential Moving Averages
  calculateEMA() {
    const periods = [5, 10, 20, 50, 100, 200]
    const ema = {}

    periods.forEach((period) => {
      if (this.priceHistory.length >= period) {
        const multiplier = 2 / (period + 1)
        let emaValue = this.priceHistory[this.priceHistory.length - period].close

        for (let i = this.priceHistory.length - period + 1; i < this.priceHistory.length; i++) {
          emaValue = this.priceHistory[i].close * multiplier + emaValue * (1 - multiplier)
        }

        ema[`ema${period}`] = emaValue
      }
    })

    return ema
  }

  // Relative Strength Index
  calculateRSI(period = 14) {
    if (this.priceHistory.length < period + 1) return null

    let gains = 0
    let losses = 0

    // Calculate initial average gain and loss
    for (let i = this.priceHistory.length - period; i < this.priceHistory.length; i++) {
      const change = this.priceHistory[i].close - this.priceHistory[i - 1].close
      if (change > 0) {
        gains += change
      } else {
        losses += Math.abs(change)
      }
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)

    return {
      value: rsi,
      signal: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL',
      strength: rsi > 80 || rsi < 20 ? 'STRONG' : rsi > 70 || rsi < 30 ? 'MODERATE' : 'WEAK'
    }
  }

  // MACD (Moving Average Convergence Divergence)
  calculateMACD(fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (this.priceHistory.length < slowPeriod) return null

    const emaFast = this.calculateEMAForPeriod(fastPeriod)
    const emaSlow = this.calculateEMAForPeriod(slowPeriod)

    if (!emaFast || !emaSlow) return null

    const macdLine = emaFast - emaSlow

    // Calculate signal line (EMA of MACD line)
    // Simplified calculation for demonstration
    const signalLine = macdLine * 0.9 // Placeholder

    const histogram = macdLine - signalLine

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
      trend: histogram > 0 ? 'BULLISH' : 'BEARISH',
      strength: Math.abs(histogram) > 10 ? 'STRONG' : Math.abs(histogram) > 5 ? 'MODERATE' : 'WEAK'
    }
  }

  calculateEMAForPeriod(period) {
    if (this.priceHistory.length < period) return null

    const multiplier = 2 / (period + 1)
    let ema = this.priceHistory[this.priceHistory.length - period].close

    for (let i = this.priceHistory.length - period + 1; i < this.priceHistory.length; i++) {
      ema = this.priceHistory[i].close * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  // Bollinger Bands
  calculateBollingerBands(period = 20, multiplier = 2) {
    if (this.priceHistory.length < period) return null

    const prices = this.priceHistory.slice(-period).map((candle) => candle.close)
    const sma = prices.reduce((sum, price) => sum + price, 0) / period

    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    const upperBand = sma + stdDev * multiplier
    const lowerBand = sma - stdDev * multiplier
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close

    return {
      upper: upperBand,
      middle: sma,
      lower: lowerBand,
      width: upperBand - lowerBand,
      position: currentPrice > upperBand ? 'ABOVE_UPPER' : currentPrice < lowerBand ? 'BELOW_LOWER' : 'WITHIN_BANDS',
      squeeze: upperBand - lowerBand < sma * 0.02 // Less than 2% of price
    }
  }

  // Stochastic Oscillator
  calculateStochastic(kPeriod = 14, dPeriod = 3) {
    if (this.priceHistory.length < kPeriod) return null

    const recentCandles = this.priceHistory.slice(-kPeriod)
    const highestHigh = Math.max(...recentCandles.map((c) => c.high))
    const lowestLow = Math.min(...recentCandles.map((c) => c.low))
    const currentClose = this.priceHistory[this.priceHistory.length - 1].close

    const kPercent = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
    const dPercent = kPercent * 0.9 // Simplified D% calculation

    return {
      k: kPercent,
      d: dPercent,
      signal: kPercent > 80 ? 'OVERBOUGHT' : kPercent < 20 ? 'OVERSOLD' : 'NEUTRAL',
      crossover: kPercent > dPercent ? 'BULLISH' : 'BEARISH'
    }
  }

  // Average True Range
  calculateATR(period = 14) {
    if (this.priceHistory.length < period + 1) return null

    let trSum = 0
    for (let i = this.priceHistory.length - period; i < this.priceHistory.length; i++) {
      const current = this.priceHistory[i]
      const previous = this.priceHistory[i - 1]

      const tr = Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close))

      trSum += tr
    }

    const atr = trSum / period
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close

    return {
      value: atr,
      percentage: (atr / currentPrice) * 100,
      volatility: atr > currentPrice * 0.02 ? 'HIGH' : atr > currentPrice * 0.01 ? 'MEDIUM' : 'LOW'
    }
  }

  // Average Directional Index
  calculateADX(period = 14) {
    if (this.priceHistory.length < period + 1) return null

    // Simplified ADX calculation
    let upMoves = 0
    let downMoves = 0

    for (let i = this.priceHistory.length - period; i < this.priceHistory.length; i++) {
      const change = this.priceHistory[i].close - this.priceHistory[i - 1].close
      if (change > 0) upMoves += change
      if (change < 0) downMoves += Math.abs(change)
    }

    const totalMoves = upMoves + downMoves
    const adx = totalMoves > 0 ? (Math.abs(upMoves - downMoves) / totalMoves) * 100 : 0

    return {
      value: adx,
      trend: adx > 25 ? 'STRONG' : adx > 20 ? 'MODERATE' : 'WEAK',
      direction: upMoves > downMoves ? 'BULLISH' : 'BEARISH'
    }
  }

  // Fibonacci Retracement Levels
  calculateFibonacci() {
    if (this.priceHistory.length < 50) return null

    // Find recent swing high and low
    const recent50 = this.priceHistory.slice(-50)
    const high = Math.max(...recent50.map((c) => c.high))
    const low = Math.min(...recent50.map((c) => c.low))
    const range = high - low

    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]

    return {
      high: high,
      low: low,
      range: range,
      levels: fibLevels.map((fib) => ({
        level: fib,
        price: low + range * fib,
        label: `${(fib * 100).toFixed(1)}%`
      })),
      currentPosition: this.getCurrentFibPosition(low, high, range)
    }
  }

  getCurrentFibPosition(low, high, range) {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close
    const position = (currentPrice - low) / range

    if (position < 0.236) return 'BELOW_23.6%'
    if (position < 0.382) return 'BETWEEN_23.6%_38.2%'
    if (position < 0.5) return 'BETWEEN_38.2%_50%'
    if (position < 0.618) return 'BETWEEN_50%_61.8%'
    if (position < 0.786) return 'BETWEEN_61.8%_78.6%'
    if (position < 1.0) return 'BETWEEN_78.6%_100%'
    return 'ABOVE_100%'
  }

  // Pattern Detection
  detectPatterns() {
    if (this.priceHistory.length < 20) return

    this.patterns = []

    // Double Top/Bottom
    this.detectDoubleTopBottom()

    // Head and Shoulders
    this.detectHeadAndShoulders()

    // Triangle Patterns
    this.detectTriangles()

    // Flag and Pennant
    this.detectFlagPennant()

    // Candlestick Patterns
    this.detectCandlestickPatterns()
  }

  detectDoubleTopBottom() {
    const recent20 = this.priceHistory.slice(-20)
    const highs = recent20.map((c) => c.high)
    const lows = recent20.map((c) => c.low)

    // Simplified double top detection
    const maxHigh = Math.max(...highs)
    const maxIndices = highs.map((high, index) => (high === maxHigh ? index : -1)).filter((i) => i !== -1)

    if (maxIndices.length >= 2 && maxIndices[maxIndices.length - 1] - maxIndices[0] > 5) {
      this.patterns.push({
        type: 'DOUBLE_TOP',
        confidence: 0.7,
        prediction: 'BEARISH',
        timeframe: 'SHORT_TERM'
      })
    }

    // Simplified double bottom detection
    const minLow = Math.min(...lows)
    const minIndices = lows.map((low, index) => (low === minLow ? index : -1)).filter((i) => i !== -1)

    if (minIndices.length >= 2 && minIndices[minIndices.length - 1] - minIndices[0] > 5) {
      this.patterns.push({
        type: 'DOUBLE_BOTTOM',
        confidence: 0.7,
        prediction: 'BULLISH',
        timeframe: 'SHORT_TERM'
      })
    }
  }

  detectHeadAndShoulders() {
    if (this.priceHistory.length < 15) return

    const recent15 = this.priceHistory.slice(-15)
    const highs = recent15.map((c) => c.high)

    // Find three peaks
    const peaks = []
    for (let i = 1; i < highs.length - 1; i++) {
      if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1]) {
        peaks.push({ index: i, value: highs[i] })
      }
    }

    if (peaks.length >= 3) {
      const [leftShoulder, head, rightShoulder] = peaks.slice(-3)

      if (head.value > leftShoulder.value && head.value > rightShoulder.value && Math.abs(leftShoulder.value - rightShoulder.value) / leftShoulder.value < 0.02) {
        this.patterns.push({
          type: 'HEAD_AND_SHOULDERS',
          confidence: 0.8,
          prediction: 'BEARISH',
          timeframe: 'MEDIUM_TERM',
          neckline: Math.min(leftShoulder.value, rightShoulder.value) * 0.98
        })
      }
    }
  }

  detectTriangles() {
    if (this.priceHistory.length < 10) return

    const recent10 = this.priceHistory.slice(-10)
    const highs = recent10.map((c) => c.high)
    const lows = recent10.map((c) => c.low)

    // Ascending triangle
    const highTrend = this.calculateTrend(highs)
    const lowTrend = this.calculateTrend(lows)

    if (Math.abs(highTrend) < 0.001 && lowTrend > 0.01) {
      this.patterns.push({
        type: 'ASCENDING_TRIANGLE',
        confidence: 0.6,
        prediction: 'BULLISH',
        timeframe: 'SHORT_TERM'
      })
    }

    // Descending triangle
    if (Math.abs(lowTrend) < 0.001 && highTrend < -0.01) {
      this.patterns.push({
        type: 'DESCENDING_TRIANGLE',
        confidence: 0.6,
        prediction: 'BEARISH',
        timeframe: 'SHORT_TERM'
      })
    }

    // Symmetrical triangle
    if (highTrend < -0.01 && lowTrend > 0.01) {
      this.patterns.push({
        type: 'SYMMETRICAL_TRIANGLE',
        confidence: 0.5,
        prediction: 'NEUTRAL',
        timeframe: 'SHORT_TERM'
      })
    }
  }

  calculateTrend(data) {
    const n = data.length
    const sumX = (n * (n - 1)) / 2
    const sumY = data.reduce((sum, val) => sum + val, 0)
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  detectFlagPennant() {
    // Simplified flag/pennant detection
    if (this.priceHistory.length < 15) return

    const recent15 = this.priceHistory.slice(-15)
    const first5 = recent15.slice(0, 5)
    const last10 = recent15.slice(5)

    const strongMove = Math.abs(first5[4].close - first5[0].close) / first5[0].close > 0.05
    const consolidation = Math.max(...last10.map((c) => c.high)) - Math.min(...last10.map((c) => c.low))
    const consolidationRange = consolidation / last10[0].close < 0.03

    if (strongMove && consolidationRange) {
      const direction = first5[4].close > first5[0].close ? 'BULLISH' : 'BEARISH'
      this.patterns.push({
        type: direction === 'BULLISH' ? 'BULL_FLAG' : 'BEAR_FLAG',
        confidence: 0.6,
        prediction: direction,
        timeframe: 'SHORT_TERM'
      })
    }
  }

  detectCandlestickPatterns() {
    if (this.priceHistory.length < 3) return

    const last3 = this.priceHistory.slice(-3)
    const [prev2, prev1, current] = last3

    // Doji
    const isDoji = Math.abs(current.close - current.open) / current.open < 0.001
    if (isDoji) {
      this.patterns.push({
        type: 'DOJI',
        confidence: 0.5,
        prediction: 'REVERSAL',
        timeframe: 'SHORT_TERM'
      })
    }

    // Hammer
    const bodySize = Math.abs(current.close - current.open)
    const lowerShadow = current.open > current.close ? current.close - current.low : current.open - current.low
    const upperShadow = current.high - Math.max(current.open, current.close)

    if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
      this.patterns.push({
        type: 'HAMMER',
        confidence: 0.7,
        prediction: 'BULLISH',
        timeframe: 'SHORT_TERM'
      })
    }

    // Shooting Star
    if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
      this.patterns.push({
        type: 'SHOOTING_STAR',
        confidence: 0.7,
        prediction: 'BEARISH',
        timeframe: 'SHORT_TERM'
      })
    }
  }

  // Support and Resistance Levels
  updateSupportResistance() {
    if (this.priceHistory.length < 20) return

    this.supportLevels = this.findSupportLevels()
    this.resistanceLevels = this.findResistanceLevels()
  }

  findSupportLevels() {
    const supports = []
    const recent50 = this.priceHistory.slice(-50)

    // Find local lows
    for (let i = 2; i < recent50.length - 2; i++) {
      const current = recent50[i].low
      const isLocalLow = recent50.slice(i - 2, i + 3).every((candle, idx) => idx === 2 || candle.low >= current)

      if (isLocalLow) {
        supports.push({
          price: current,
          strength: this.calculateLevelStrength(current, 'support'),
          timestamp: recent50[i].timestamp
        })
      }
    }

    // Sort by strength and return top 5
    return supports.sort((a, b) => b.strength - a.strength).slice(0, 5)
  }

  findResistanceLevels() {
    const resistances = []
    const recent50 = this.priceHistory.slice(-50)

    // Find local highs
    for (let i = 2; i < recent50.length - 2; i++) {
      const current = recent50[i].high
      const isLocalHigh = recent50.slice(i - 2, i + 3).every((candle, idx) => idx === 2 || candle.high <= current)

      if (isLocalHigh) {
        resistances.push({
          price: current,
          strength: this.calculateLevelStrength(current, 'resistance'),
          timestamp: recent50[i].timestamp
        })
      }
    }

    // Sort by strength and return top 5
    return resistances.sort((a, b) => b.strength - a.strength).slice(0, 5)
  }

  calculateLevelStrength(level, type) {
    let touches = 0
    let strength = 0

    this.priceHistory.forEach((candle) => {
      const tolerance = level * 0.002 // 0.2% tolerance

      if (type === 'support' && candle.low <= level + tolerance && candle.low >= level - tolerance) {
        touches++
        strength += candle.low < level ? 2 : 1 // Stronger if price actually bounced
      } else if (type === 'resistance' && candle.high >= level - tolerance && candle.high <= level + tolerance) {
        touches++
        strength += candle.high > level ? 2 : 1
      }
    })

    return touches * strength
  }

  // Generate comprehensive technical analysis
  generateTechnicalAnalysis() {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1]?.close

    if (!currentPrice) {
      return { error: 'Insufficient price data for analysis' }
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      currentPrice: currentPrice,
      indicators: this.indicators,
      patterns: this.patterns,
      supportLevels: this.supportLevels,
      resistanceLevels: this.resistanceLevels,
      signals: this.generateTradingSignals(),
      priceTargets: this.calculatePriceTargets(),
      riskLevels: this.calculateRiskLevels(),
      timeframeAnalysis: this.analyzeTimeframes(),
      marketStructure: this.analyzeMarketStructure(),
      momentum: this.analyzeMomentum()
    }

    return analysis
  }

  generateTradingSignals() {
    const signals = []

    // RSI signals
    if (this.indicators.rsi) {
      if (this.indicators.rsi.signal === 'OVERSOLD') {
        signals.push({ type: 'BUY', source: 'RSI', strength: 'MODERATE', reason: 'RSI oversold' })
      } else if (this.indicators.rsi.signal === 'OVERBOUGHT') {
        signals.push({ type: 'SELL', source: 'RSI', strength: 'MODERATE', reason: 'RSI overbought' })
      }
    }

    // MACD signals
    if (this.indicators.macd) {
      if (this.indicators.macd.trend === 'BULLISH') {
        signals.push({ type: 'BUY', source: 'MACD', strength: this.indicators.macd.strength, reason: 'MACD bullish crossover' })
      } else if (this.indicators.macd.trend === 'BEARISH') {
        signals.push({ type: 'SELL', source: 'MACD', strength: this.indicators.macd.strength, reason: 'MACD bearish crossover' })
      }
    }

    // Bollinger Bands signals
    if (this.indicators.bollingerBands) {
      if (this.indicators.bollingerBands.position === 'BELOW_LOWER') {
        signals.push({ type: 'BUY', source: 'BOLLINGER', strength: 'MODERATE', reason: 'Price below lower Bollinger Band' })
      } else if (this.indicators.bollingerBands.position === 'ABOVE_UPPER') {
        signals.push({ type: 'SELL', source: 'BOLLINGER', strength: 'MODERATE', reason: 'Price above upper Bollinger Band' })
      }
    }

    // Pattern signals
    this.patterns.forEach((pattern) => {
      if (pattern.prediction !== 'NEUTRAL') {
        signals.push({
          type: pattern.prediction === 'BULLISH' ? 'BUY' : 'SELL',
          source: 'PATTERN',
          strength: pattern.confidence > 0.7 ? 'STRONG' : 'MODERATE',
          reason: `${pattern.type} pattern detected`
        })
      }
    })

    return signals
  }

  calculatePriceTargets() {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close
    const atr = this.indicators.atr?.value || currentPrice * 0.02

    return {
      bullishTargets: [
        { level: currentPrice + atr, probability: 0.7, timeframe: 'SHORT' },
        { level: currentPrice + atr * 2, probability: 0.5, timeframe: 'MEDIUM' },
        { level: currentPrice + atr * 3, probability: 0.3, timeframe: 'LONG' }
      ],
      bearishTargets: [
        { level: currentPrice - atr, probability: 0.7, timeframe: 'SHORT' },
        { level: currentPrice - atr * 2, probability: 0.5, timeframe: 'MEDIUM' },
        { level: currentPrice - atr * 3, probability: 0.3, timeframe: 'LONG' }
      ]
    }
  }

  calculateRiskLevels() {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close
    const atr = this.indicators.atr?.value || currentPrice * 0.02

    return {
      stopLoss: {
        conservative: currentPrice - atr * 1.5,
        moderate: currentPrice - atr,
        aggressive: currentPrice - atr * 0.5
      },
      takeProfit: {
        conservative: currentPrice + atr,
        moderate: currentPrice + atr * 2,
        aggressive: currentPrice + atr * 3
      }
    }
  }

  analyzeTimeframes() {
    return {
      shortTerm: this.analyzeTimeframe('SHORT'),
      mediumTerm: this.analyzeTimeframe('MEDIUM'),
      longTerm: this.analyzeTimeframe('LONG')
    }
  }

  analyzeTimeframe(timeframe) {
    const periods = {
      SHORT: 5,
      MEDIUM: 20,
      LONG: 50
    }

    const period = periods[timeframe]
    if (this.priceHistory.length < period) return { trend: 'INSUFFICIENT_DATA' }

    const recentData = this.priceHistory.slice(-period)
    const startPrice = recentData[0].close
    const endPrice = recentData[recentData.length - 1].close
    const change = (endPrice - startPrice) / startPrice

    const highs = recentData.map((c) => c.high)
    const lows = recentData.map((c) => c.low)
    const volatility = (Math.max(...highs) - Math.min(...lows)) / startPrice

    return {
      trend: change > 0.02 ? 'BULLISH' : change < -0.02 ? 'BEARISH' : 'SIDEWAYS',
      strength: Math.abs(change) > 0.05 ? 'STRONG' : Math.abs(change) > 0.02 ? 'MODERATE' : 'WEAK',
      volatility: volatility > 0.1 ? 'HIGH' : volatility > 0.05 ? 'MEDIUM' : 'LOW',
      change: (change * 100).toFixed(2) + '%'
    }
  }

  analyzeMarketStructure() {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close

    return {
      nearestSupport: this.supportLevels[0] || null,
      nearestResistance: this.resistanceLevels[0] || null,
      pricePosition: this.determinePricePosition(currentPrice),
      marketPhase: this.determineMarketPhase()
    }
  }

  determinePricePosition(currentPrice) {
    const nearestSupport = this.supportLevels[0]?.price || 0
    const nearestResistance = this.resistanceLevels[0]?.price || Infinity

    if (nearestSupport && nearestResistance) {
      const position = (currentPrice - nearestSupport) / (nearestResistance - nearestSupport)
      if (position < 0.3) return 'NEAR_SUPPORT'
      if (position > 0.7) return 'NEAR_RESISTANCE'
      return 'MIDDLE_RANGE'
    }

    return 'UNKNOWN'
  }

  determineMarketPhase() {
    if (this.priceHistory.length < 20) return 'INSUFFICIENT_DATA'

    const recent20 = this.priceHistory.slice(-20)
    const highs = recent20.map((c) => c.high)
    const lows = recent20.map((c) => c.low)

    const highsIncreasing = highs[highs.length - 1] > highs[0]
    const lowsIncreasing = lows[lows.length - 1] > lows[0]

    if (highsIncreasing && lowsIncreasing) return 'UPTREND'
    if (!highsIncreasing && !lowsIncreasing) return 'DOWNTREND'
    return 'SIDEWAYS'
  }

  analyzeMomentum() {
    const momentum = {
      shortTerm: this.calculateMomentum(5),
      mediumTerm: this.calculateMomentum(10),
      longTerm: this.calculateMomentum(20)
    }

    return {
      ...momentum,
      divergence: this.detectMomentumDivergence(),
      acceleration: this.calculateMomentumAcceleration()
    }
  }

  calculateMomentum(period) {
    if (this.priceHistory.length < period + 1) return null

    const current = this.priceHistory[this.priceHistory.length - 1].close
    const previous = this.priceHistory[this.priceHistory.length - 1 - period].close

    const momentum = ((current - previous) / previous) * 100

    return {
      value: momentum,
      direction: momentum > 0 ? 'POSITIVE' : 'NEGATIVE',
      strength: Math.abs(momentum) > 5 ? 'STRONG' : Math.abs(momentum) > 2 ? 'MODERATE' : 'WEAK'
    }
  }

  detectMomentumDivergence() {
    // Simplified divergence detection
    if (this.priceHistory.length < 20) return 'INSUFFICIENT_DATA'

    const recent10 = this.priceHistory.slice(-10)
    const priceTrend = recent10[9].close > recent10[0].close ? 'UP' : 'DOWN'

    const rsi = this.indicators.rsi
    if (!rsi) return 'NO_DATA'

    // This would normally compare RSI trend with price trend
    // Simplified for demonstration
    return Math.random() > 0.8 ? 'BEARISH_DIVERGENCE' : Math.random() > 0.8 ? 'BULLISH_DIVERGENCE' : 'NO_DIVERGENCE'
  }

  calculateMomentumAcceleration() {
    const shortMomentum = this.calculateMomentum(5)
    const mediumMomentum = this.calculateMomentum(10)

    if (!shortMomentum || !mediumMomentum) return 'NO_DATA'

    const acceleration = shortMomentum.value - mediumMomentum.value

    return {
      value: acceleration,
      direction: acceleration > 0 ? 'ACCELERATING' : 'DECELERATING',
      significance: Math.abs(acceleration) > 2 ? 'HIGH' : 'LOW'
    }
  }

  // Get formatted analysis summary
  getAnalysisSummary() {
    const analysis = this.generateTechnicalAnalysis()

    return {
      timestamp: analysis.timestamp,
      currentPrice: analysis.currentPrice,
      overallTrend: this.determineOverallTrend(analysis),
      keyLevels: {
        support: analysis.supportLevels[0]?.price,
        resistance: analysis.resistanceLevels[0]?.price
      },
      signals: analysis.signals,
      riskReward: this.calculateRiskReward(analysis),
      confidence: this.calculateAnalysisConfidence(analysis)
    }
  }

  determineOverallTrend(analysis) {
    const signals = analysis.signals
    const bullishSignals = signals.filter((s) => s.type === 'BUY').length
    const bearishSignals = signals.filter((s) => s.type === 'SELL').length

    if (bullishSignals > bearishSignals) return 'BULLISH'
    if (bearishSignals > bullishSignals) return 'BEARISH'
    return 'NEUTRAL'
  }

  calculateRiskReward(analysis) {
    const currentPrice = analysis.currentPrice
    const support = analysis.supportLevels[0]?.price
    const resistance = analysis.resistanceLevels[0]?.price

    if (!support || !resistance) return null

    const risk = currentPrice - support
    const reward = resistance - currentPrice

    return {
      risk: risk,
      reward: reward,
      ratio: reward / risk,
      quality: reward / risk > 2 ? 'EXCELLENT' : reward / risk > 1.5 ? 'GOOD' : 'POOR'
    }
  }

  calculateAnalysisConfidence(analysis) {
    let confidence = 50 // Base confidence

    // Add confidence based on number of confluent signals
    const signalCount = analysis.signals.length
    confidence += Math.min(signalCount * 5, 25)

    // Add confidence based on pattern strength
    const strongPatterns = analysis.patterns.filter((p) => p.confidence > 0.7).length
    confidence += strongPatterns * 10

    // Add confidence based on clear support/resistance
    if (analysis.supportLevels.length > 0 && analysis.resistanceLevels.length > 0) {
      confidence += 15
    }

    return Math.min(100, confidence)
  }
}

export { TechnicalAnalyzer }
