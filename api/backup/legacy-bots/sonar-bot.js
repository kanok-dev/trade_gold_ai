import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory (two levels up from current location)
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Perplexity API configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

// Enhanced Configuration Options
const CONFIG = {
  PRICE_ALERT_THRESHOLD: 50, // Alert if price moves more than $50
  VOLUME_SPIKE_THRESHOLD: 1.5, // Alert if volume is 1.5x average
  VOLATILITY_THRESHOLD: 2.0, // Alert if 24h change > 2%
  SAVE_HISTORICAL_DATA: true,
  AUTO_GENERATE_ALERTS: true,
  MULTI_TIMEFRAME_ANALYSIS: true
}

// Gold Trading AI Analysis with Perplexity Sonar
async function analyzeGoldMarket() {
  try {
    console.log('🚀 Starting Enhanced Gold Market Analysis with Perplexity Sonar...')
    console.log('📊 Searching for real-time data from multiple sources...')

    // Get current date for dynamic searching
    const currentDate = new Date()
    const todayDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const currentMonth = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })

    const messages = [
      {
        role: 'system',
        content: `You are a professional gold market analyst providing comprehensive trading analysis. Format your response with clear sections and provide actionable trading insights with specific price levels and risk management guidance.`
      },
      {
        role: 'user',
        content: `Search for comprehensive gold market data today ${todayDate}:

REQUIRED SEARCHES:
1. "gold spot price XAU USD current TradingView MarketWatch Bloomberg Reuters real time"
2. "gold futures COMEX price change 24h weekly volume latest"
3. "Federal Reserve rate cuts gold impact latest Bloomberg Reuters CNBC"
4. "gold ETF flows GLD IAU institutional buying MarketWatch Reuters"
5. "central bank gold purchases China India reserves Reuters Financial Times"
6. "USD dollar index DXY gold correlation current Bloomberg"
7. "gold technical analysis RSI MACD support resistance TradingView"
8. "geopolitical tensions safe haven gold demand WSJ Reuters"

RESPONSE FORMAT: Provide analysis followed by COMPLETE JSON structure.

MANDATORY JSON OUTPUT with ALL fields completed (no undefined/null values):

{
  "timestamp": "2025-07-02T${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}:00Z",
  "priceData": {
    "spotPrice": <exact_number>,
    "change24h": <exact_dollar_amount>,
    "changePercent24h": <exact_percentage>,
    "changeWeekly": <exact_percentage>,
    "volume24h": <number_or_estimate>,
    "sources": [
      {"name": "TradingView", "price": <number>, "time": "HH:MM UTC"},
      {"name": "MarketWatch", "price": <number>, "time": "HH:MM UTC"}, 
      {"name": "Bloomberg", "price": <number>, "time": "HH:MM UTC"},
      {"name": "Reuters", "price": <number>, "time": "HH:MM UTC"},
      {"name": "Yahoo Finance", "price": <number>, "time": "HH:MM UTC"}
    ]
  },
  "news24h": [
    {
      "headline": "exact headline from verified source",
      "source": "Bloomberg|Reuters|MarketWatch|CNBC|Financial Times|WSJ|TradingView",
      "originalUrl": "https://complete-verified-url.com",
      "timePublished": "07/02/2025 HH:MM",
      "sentiment": "bullish|bearish|neutral",
      "impact": "high|medium|low"
    }
  ],
  "technicalView": {
    "trend": "bullish|bearish|neutral",
    "supportLevels": [<number>, <number>, <number>],
    "resistanceLevels": [<number>, <number>, <number>],
    "rsi": <number_between_0_100>,
    "macd": <number>,
    "stochastic": <number_between_0_100>,
    "ma20": <number>,
    "ma50": <number>,
    "ma200": <number>
  },
  "fedData": {
    "currentRate": <number>,
    "nextMeeting": "MM/DD/YYYY",
    "rateCutProbability": <percentage_number>,
    "impact": "detailed explanation of Fed impact on gold"
  },
  "usdData": {
    "dxyLevel": <number>,
    "dxyChange24h": <percentage>,
    "correlation": <number_between_-1_and_1>
  },
  "sentiment": "bullish|bearish|neutral",
  "confidence": "high|medium|low",
  "signal": "strong_buy|buy|hold|sell|strong_sell",
  "riskLevel": "high|medium|low", 
  "timeHorizon": "short-term|medium-term|long-term",
  "entryPoint": <exact_number>,
  "stopLoss": <exact_number>,
  "takeProfit": [<number>, <number>],
  "summary": "detailed trading recommendation with specific reasoning"
}

CRITICAL REQUIREMENTS:
- ALL JSON fields must have actual values (no undefined, null, or placeholder text)
- All news must be from trusted financial sources with valid URLs
- All prices must be current real-time data
- Technical indicators must be actual current values
- Include minimum 3 news items from last 24 hours
- Every news item must have complete URL and timestamp

{
  "timestamp": "2025-07-02T00:00:00Z",
  "priceData": {
    "spotPrice": <exact_number>,
    "change24h": <exact_number>,
    "changePercent24h": <exact_percentage>,
    "changeWeekly": <exact_percentage>,
    "volume24h": <number>,
    "sources": [
      {"name": "TradingView", "price": <number>, "time": "HH:MM UTC"},
      {"name": "MarketWatch", "price": <number>, "time": "HH:MM UTC"},
      {"name": "Bloomberg", "price": <number>, "time": "HH:MM UTC"},
      {"name": "Reuters", "price": <number>, "time": "HH:MM UTC"},
      {"name": "Yahoo Finance", "price": <number>, "time": "HH:MM UTC"}
    ]
  },
  "news24h": [
    {
      "headline": "exact headline from Bloomberg/Reuters/MarketWatch only",
      "source": "Bloomberg|Reuters|MarketWatch|CNBC|Financial Times|WSJ",
      "originalUrl": "https://full-verified-url.com",
      "timePublished": "MM/DD/YYYY HH:MM",
      "sentiment": "bullish|bearish|neutral",
      "impact": "high|medium|low"
    }
  ],
  "technicalView": {
    "trend": "bullish|bearish|neutral",
    "supportLevels": [<number>, <number>, <number>],
    "resistanceLevels": [<number>, <number>, <number>],
    "rsi": <exact_number>,
    "macd": <number>,
    "stochastic": <number>,
    "ma20": <number>,
    "ma50": <number>,
    "ma200": <number>
  },
  "fedData": {
    "currentRate": <number>,
    "nextMeeting": "MM/DD/YYYY",
    "rateCutProbability": <percentage>,
    "impact": "detailed explanation"
  },
  "usdData": {
    "dxyLevel": <number>,
    "dxyChange24h": <percentage>,
    "correlation": <number>
  },
  "sentiment": "bullish|bearish|neutral",
  "confidence": "high|medium|low",
  "signal": "strong_buy|buy|hold|sell|strong_sell",
  "riskLevel": "high|medium|low",
  "timeHorizon": "short-term|medium-term|long-term",
  "entryPoint": <exact_number>,
  "stopLoss": <exact_number>,
  "takeProfit": [<number>, <number>],
  "summary": "detailed trading recommendation with reasoning"
}`
      }
    ]

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: messages,
        temperature: 0.1, // Keep default for web search models
        max_tokens: 6000, // Increased for more comprehensive data
        stream: false,
        // Optimize for financial research with trusted sources
        search_domain_filter: ['bloomberg.com', 'reuters.com', 'tradingview.com', 'marketwatch.com', 'cnbc.com', 'ft.com', 'wsj.com', 'finance.yahoo.com'],
        search_recency_filter: 'day', // Focus on recent content
        return_citations: true,
        return_images: false,
        search_context_size: 'high' // Get more comprehensive search results
      })
    }

    console.log('🔍 Calling Perplexity Sonar API...')
    const response = await fetch(PERPLEXITY_API_URL, options)

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from Perplexity API')
    }

    const analysisText = data.choices[0].message.content

    console.log('✅ Analysis completed successfully')

    // Validate news credibility and accuracy
    const validationResults = await validateNewsCredibility(analysisText)

    // Save results with validation
    await saveAnalysisWithValidation(data, validationResults)

    // Also save original format for compatibility
    await saveAnalysisResults(data)

    // Extract and display key findings
    displayKeyFindings(analysisText, validationResults)
  } catch (error) {
    console.error('❌ Error analyzing gold market:', error.message)

    // Save error results with validation placeholder
    const errorResults = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    }

    const errorValidation = {
      timestamp: new Date().toISOString(),
      validated: false,
      reason: 'Analysis failed - no data to validate',
      credibilityScore: 0
    }

    await saveAnalysisWithValidation(errorResults, errorValidation)
    await saveAnalysisResults(errorResults)
  }
}

// Save analysis results to file
async function saveAnalysisResults(response) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `sonar-analysis-${timestamp}.json`
    const dataDir = path.join(__dirname, '../../data')
    const outputPath = path.join(dataDir, filename)

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const results = {
      timestamp: new Date().toISOString(),
      response: response,
      status: response.error ? 'failed' : 'success',
      model: 'sonar',
      provider: 'perplexity',
      analysis_type: 'enhanced_gold_market'
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`💾 Results saved to: ${outputPath}`)

    // Also save as latest
    const latestPath = path.join(dataDir, 'latest_sonar_analysis.json')
    fs.writeFileSync(latestPath, JSON.stringify(results, null, 2))
    console.log(`📄 Latest Sonar analysis updated`)
  } catch (saveError) {
    console.error('❌ Error saving results:', saveError.message)
  }
}

// Enhanced JSON extraction with better parsing
function extractAndValidateJSON(analysisText) {
  try {
    // The Perplexity response often comes as pure JSON string, so try parsing directly first
    try {
      const directParse = JSON.parse(analysisText)
      if (directParse && typeof directParse === 'object' && directParse.timestamp) {
        console.log('✅ Successfully parsed response as direct JSON')
        return { success: true, analysis: directParse, rawJSON: analysisText }
      }
    } catch (directError) {
      // Not direct JSON, continue with pattern matching
    }

    // Try to find JSON in the response - look for patterns
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/, // JSON in code blocks
      /^\s*(\{[\s\S]*\})\s*$/, // Entire response is JSON
      /\{[\s\S]*"timestamp"[\s\S]*?\}/, // Look for JSON with timestamp field
      /\{[\s\S]*"priceData"[\s\S]*?\}/ // Look for JSON with priceData field
    ]

    let analysis = null
    let jsonText = null

    // Try each pattern
    for (const pattern of jsonPatterns) {
      const match = analysisText.match(pattern)
      if (match) {
        jsonText = match[1] || match[0]
        try {
          analysis = JSON.parse(jsonText)
          if (analysis && typeof analysis === 'object') {
            console.log('✅ Successfully extracted and parsed JSON using pattern matching')
            break
          }
        } catch (parseError) {
          console.log(`⚠️  Pattern matched but JSON parsing failed: ${parseError.message}`)
          continue
        }
      }
    }

    // If still no valid JSON, return success with null analysis
    if (!analysis) {
      console.log('🚨 No valid JSON found')
      return {
        success: false,
        error: 'No valid JSON structure found',
        analysis: null,
        rawJSON: null
      }
    }

    return { success: true, analysis, rawJSON: jsonText }
  } catch (error) {
    console.error('❌ JSON extraction failed:', error.message)
    return {
      success: false,
      error: error.message,
      analysis: null,
      rawJSON: null
    }
  }
}

// News validation and credibility checker
async function validateNewsCredibility(analysisText) {
  try {
    console.log('\n🔍 VALIDATING NEWS CREDIBILITY...')
    console.log('='.repeat(40))

    // Use enhanced JSON extraction
    const extractionResult = extractAndValidateJSON(analysisText)

    if (!extractionResult.success || !extractionResult.analysis) {
      console.log('⚠️  No valid JSON analysis found to validate')
      return {
        validated: false,
        reason: 'No JSON data found',
        credibilityScore: 0,
        recommendations: ['❌ JSON extraction failed - manual verification required']
      }
    }

    const analysis = extractionResult.analysis
    const newsItems = analysis.news24h || []

    if (newsItems.length === 0) {
      console.log('⚠️  No news items found to validate')
      return {
        validated: false,
        reason: 'No news items found',
        credibilityScore: 0,
        recommendations: ['⚠️  No news data for validation']
      }
    }

    console.log(`📊 Validating ${newsItems.length} news items...`)

    // Define trusted sources
    const trustedSources = [
      'reuters.com',
      'bloomberg.com',
      'tradingview.com',
      'marketwatch.com',
      'yahoo finance',
      'cnbc.com',
      'financial times',
      'wsj.com',
      'ft.com',
      'investing.com',
      'fxstreet.com',
      'kitco.com',
      'reuters',
      'bloomberg',
      'tradingview',
      'marketwatch',
      'cnbc',
      'wall street journal'
    ]

    // Validate each news item
    const validationResults = {
      timestamp: new Date().toISOString(),
      totalItems: newsItems.length,
      validatedItems: [],
      trustedSources: 0,
      untrustedSources: 0,
      missingUrls: 0,
      recentNews: 0,
      outdatedNews: 0,
      credibilityScore: 0,
      recommendations: []
    }

    for (let i = 0; i < newsItems.length; i++) {
      const item = newsItems[i]
      const validation = {
        index: i + 1,
        headline: item.headline,
        source: item.source,
        originalUrl: item.originalUrl,
        timePublished: item.timePublished,
        isTrustedSource: false,
        hasValidUrl: false,
        isRecent: false,
        credibilityIssues: []
      }

      // Check if source is trusted
      const sourceText = (item.source || '').toLowerCase()
      validation.isTrustedSource = trustedSources.some((trusted) => sourceText.includes(trusted.toLowerCase()))

      if (validation.isTrustedSource) {
        validationResults.trustedSources++
      } else {
        validationResults.untrustedSources++
        validation.credibilityIssues.push('Source not in trusted list')
      }

      // Check if URL is provided and valid
      if (item.originalUrl && item.originalUrl.startsWith('http')) {
        validation.hasValidUrl = true
      } else {
        validationResults.missingUrls++
        validation.credibilityIssues.push('Missing or invalid URL')
      }

      // Check if news is recent (within 48 hours)
      if (item.timePublished) {
        try {
          const publishTime = new Date(item.timePublished)
          const currentTime = new Date()
          const hoursDiff = (currentTime - publishTime) / (1000 * 60 * 60)

          if (hoursDiff <= 48) {
            validation.isRecent = true
            validationResults.recentNews++
          } else {
            validationResults.outdatedNews++
            validation.credibilityIssues.push(`News is ${Math.round(hoursDiff)} hours old`)
          }
        } catch (dateError) {
          validation.credibilityIssues.push('Invalid date format')
        }
      } else {
        validation.credibilityIssues.push('Missing publication time')
      }

      validationResults.validatedItems.push(validation)
    }

    // Calculate credibility score (0-100)
    const sourceScore = (validationResults.trustedSources / validationResults.totalItems) * 40
    const urlScore = ((validationResults.totalItems - validationResults.missingUrls) / validationResults.totalItems) * 30
    const recencyScore = (validationResults.recentNews / validationResults.totalItems) * 30

    validationResults.credibilityScore = Math.round(sourceScore + urlScore + recencyScore)

    // Generate recommendations
    if (validationResults.untrustedSources > 0) {
      validationResults.recommendations.push(`⚠️  ${validationResults.untrustedSources} news items from untrusted sources - verify independently`)
    }

    if (validationResults.missingUrls > 0) {
      validationResults.recommendations.push(`🔗 ${validationResults.missingUrls} news items missing source URLs - cannot verify authenticity`)
    }

    if (validationResults.outdatedNews > 0) {
      validationResults.recommendations.push(`📅 ${validationResults.outdatedNews} news items are older than 48 hours - may not reflect current market`)
    }

    if (validationResults.credibilityScore >= 80) {
      validationResults.recommendations.push('✅ High credibility - analysis can be trusted')
    } else if (validationResults.credibilityScore >= 60) {
      validationResults.recommendations.push('⚠️  Moderate credibility - use with caution')
    } else {
      validationResults.recommendations.push('❌ Low credibility - seek additional sources')
    }

    // Display validation results
    console.log(`📊 CREDIBILITY VALIDATION RESULTS:`)
    console.log(`🏆 Credibility Score: ${validationResults.credibilityScore}/100`)
    console.log(`✅ Trusted Sources: ${validationResults.trustedSources}/${validationResults.totalItems}`)
    console.log(`🔗 Valid URLs: ${validationResults.totalItems - validationResults.missingUrls}/${validationResults.totalItems}`)
    console.log(`📅 Recent News: ${validationResults.recentNews}/${validationResults.totalItems}`)

    console.log('\n💡 RECOMMENDATIONS:')
    validationResults.recommendations.forEach((rec) => console.log(rec))

    // Show detailed issues if any
    const itemsWithIssues = validationResults.validatedItems.filter((item) => item.credibilityIssues.length > 0)
    if (itemsWithIssues.length > 0) {
      console.log('\n⚠️  ITEMS WITH CREDIBILITY ISSUES:')
      itemsWithIssues.forEach((item) => {
        console.log(`${item.index}. ${item.headline.substring(0, 60)}...`)
        console.log(`   Source: ${item.source}`)
        console.log(`   Issues: ${item.credibilityIssues.join(', ')}`)
      })
    }

    return validationResults
  } catch (error) {
    console.error('❌ Error validating news credibility:', error.message)
    console.log('📊 Error details:', {
      errorType: error.name,
      errorMessage: error.message,
      stackTrace: error.stack?.substring(0, 200) + '...'
    })

    return {
      validated: false,
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
      credibilityScore: 0,
      recommendations: ['❌ Validation failed - manual verification required']
    }
  }
}

// Enhanced save function with validation results
async function saveAnalysisWithValidation(response, validationResults) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `sonar-analysis-validated-${timestamp}.json`
    const dataDir = path.join(__dirname, '../../data')
    const outputPath = path.join(dataDir, filename)

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const results = {
      timestamp: new Date().toISOString(),
      response: response,
      validation: validationResults,
      status: response.error ? 'failed' : 'success',
      model: 'sonar',
      provider: 'perplexity',
      analysis_type: 'enhanced_gold_market_with_validation',
      credibilityScore: validationResults?.credibilityScore || 0,
      recommendedAction: validationResults?.credibilityScore >= 70 ? 'proceed' : 'verify_sources'
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`💾 Validated results saved to: ${outputPath}`)

    // Also save as latest validated
    const latestValidatedPath = path.join(dataDir, 'latest_sonar_validated_analysis.json')

    // Compare with previous analysis if it exists
    let previousAnalysis = null
    if (fs.existsSync(latestValidatedPath)) {
      try {
        const previousData = fs.readFileSync(latestValidatedPath, 'utf8')
        previousAnalysis = JSON.parse(previousData)
      } catch (error) {
        console.log('⚠️  Could not read previous analysis for comparison')
      }
    }

    fs.writeFileSync(latestValidatedPath, JSON.stringify(results, null, 2))
    console.log(`📄 Latest validated Sonar analysis updated`)

    // Generate change detection report
    if (previousAnalysis && previousAnalysis.response && previousAnalysis.response.choices) {
      generateChangeDetectionReport(results, previousAnalysis)
    }

    return outputPath
  } catch (saveError) {
    console.error('❌ Error saving validated results:', saveError.message)
    return null
  }
}

// Change detection between current and previous analysis
function generateChangeDetectionReport(currentResults, previousResults) {
  try {
    console.log('\n📊 CHANGE DETECTION REPORT:')
    console.log('='.repeat(40))

    // Extract analysis data from both results
    const getCurrentAnalysis = (results) => {
      try {
        const content = results.response.choices[0].message.content
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null
      } catch (error) {
        return null
      }
    }

    const current = getCurrentAnalysis(currentResults)
    const previous = getCurrentAnalysis(previousResults)

    if (!current || !previous) {
      console.log('⚠️  Cannot compare - missing analysis data')
      return
    }

    // Price change detection
    if (current.priceData && previous.priceData) {
      const priceDiff = current.priceData.spotPrice - previous.priceData.spotPrice
      const priceChangePercent = ((priceDiff / previous.priceData.spotPrice) * 100).toFixed(2)

      console.log(`💰 Price Change: $${previous.priceData.spotPrice} → $${current.priceData.spotPrice} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%)`)

      if (Math.abs(priceChangePercent) >= 1) {
        console.log(`🚨 SIGNIFICANT PRICE MOVEMENT: ${Math.abs(priceChangePercent)}% change since last analysis`)
      }
    }

    // Signal change detection
    if (current.signal && previous.signal) {
      if (current.signal !== previous.signal) {
        console.log(`🎯 SIGNAL CHANGE: ${previous.signal.toUpperCase()} → ${current.signal.toUpperCase()}`)

        // Determine if this is an upgrade or downgrade
        const signalRanking = { strong_sell: 1, sell: 2, hold: 3, buy: 4, strong_buy: 5 }
        const currentRank = signalRanking[current.signal] || 3
        const previousRank = signalRanking[previous.signal] || 3

        if (currentRank > previousRank) {
          console.log(`📈 Signal upgraded (more bullish)`)
        } else if (currentRank < previousRank) {
          console.log(`📉 Signal downgraded (more bearish)`)
        }
      }
    }

    // Confidence change detection
    if (current.confidence && previous.confidence && current.confidence !== previous.confidence) {
      console.log(`🔒 Confidence Change: ${previous.confidence} → ${current.confidence}`)
    }

    // Technical trend change
    if (current.technicalView && previous.technicalView) {
      if (current.technicalView.trend !== previous.technicalView.trend) {
        console.log(`📈 Technical Trend Change: ${previous.technicalView.trend} → ${current.technicalView.trend}`)
      }

      // RSI change
      if (current.technicalView.rsi && previous.technicalView.rsi) {
        const rsiDiff = current.technicalView.rsi - previous.technicalView.rsi
        if (Math.abs(rsiDiff) >= 10) {
          console.log(`📊 Significant RSI Change: ${previous.technicalView.rsi} → ${current.technicalView.rsi} (${rsiDiff >= 0 ? '+' : ''}${rsiDiff.toFixed(1)})`)
        }
      }
    }

    // New news detection
    if (current.news24h && previous.news24h) {
      const newHeadlines = current.news24h.filter((currentNews) => !previous.news24h.some((prevNews) => prevNews.headline === currentNews.headline))

      if (newHeadlines.length > 0) {
        console.log(`📰 NEW NEWS DETECTED: ${newHeadlines.length} fresh headlines`)
        newHeadlines.slice(0, 2).forEach((news, index) => {
          console.log(`   ${index + 1}. ${news.headline.substring(0, 80)}...`)
        })
      }
    }

    console.log('='.repeat(40))
  } catch (error) {
    console.log('⚠️  Change detection failed - manual comparison recommended')
  }
}

// Advanced alert generation system
function generateTradingAlerts(outputText) {
  try {
    console.log('\n🚨 AUTOMATED TRADING ALERTS:')
    console.log('='.repeat(40))

    const jsonMatch = outputText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return

    const analysis = JSON.parse(jsonMatch[0])

    // Price movement alerts
    if (analysis.priceData) {
      const change24h = Math.abs(analysis.priceData.changePercent24h)

      if (change24h >= CONFIG.VOLATILITY_THRESHOLD) {
        console.log(`🔥 HIGH VOLATILITY ALERT: ${change24h}% move in 24h`)
        console.log(`📊 Current Price: $${analysis.priceData.spotPrice}`)
      }

      if (analysis.priceData.volume24h) {
        // Note: This is a simplified check - in real implementation, you'd compare to historical average
        console.log(`📈 Volume: ${analysis.priceData.volume24h} contracts`)
      }
    }

    // Technical signal alerts
    if (analysis.signal) {
      const signalEmoji = {
        strong_buy: '🚀',
        buy: '📈',
        hold: '🤝',
        sell: '📉',
        strong_sell: '🔻'
      }

      console.log(`${signalEmoji[analysis.signal] || '🎯'} TRADING SIGNAL: ${analysis.signal.toUpperCase()}`)
      console.log(`🔒 Confidence: ${analysis.confidence}`)

      if (analysis.entryPoint) {
        console.log(`💡 Suggested Entry: $${analysis.entryPoint}`)
        console.log(`🛡️ Stop Loss: $${analysis.stopLoss}`)

        if (Array.isArray(analysis.takeProfit)) {
          console.log(`🎯 Take Profit Levels: $${analysis.takeProfit.join(', $')}`)
        }
      }
    }

    // News sentiment alert
    if (analysis.news24h && analysis.news24h.length > 0) {
      const bullishNews = analysis.news24h.filter((n) => n.sentiment === 'bullish').length
      const bearishNews = analysis.news24h.filter((n) => n.sentiment === 'bearish').length

      if (bullishNews > bearishNews * 2) {
        console.log(`📰 STRONG BULLISH SENTIMENT: ${bullishNews} bullish vs ${bearishNews} bearish news`)
      } else if (bearishNews > bullishNews * 2) {
        console.log(`📰 STRONG BEARISH SENTIMENT: ${bearishNews} bearish vs ${bullishNews} bullish news`)
      }
    }

    // Fed policy alert
    if (analysis.fedData && analysis.fedData.rateCutProbability >= 60) {
      console.log(`🏛️ FED ALERT: ${analysis.fedData.rateCutProbability}% rate cut probability`)
      console.log(`📅 Next Meeting: ${analysis.fedData.nextMeeting}`)
    }

    console.log('='.repeat(40))
  } catch (error) {
    console.log('⚠️  Alert generation failed - manual review recommended')
  }
}

// Display key findings from analysis
function displayKeyFindings(outputText, validationResults = null) {
  try {
    console.log('\n📈 KEY SONAR ANALYSIS FINDINGS:')
    console.log('='.repeat(50))

    // Use enhanced JSON extraction
    const extractionResult = extractAndValidateJSON(outputText)

    if (extractionResult.success && extractionResult.analysis) {
      const analysis = extractionResult.analysis

      // Display extracted JSON for verification
      console.log('\n📋 EXTRACTED JSON ANALYSIS:')
      console.log('='.repeat(30))
      console.log(JSON.stringify(analysis, null, 2))
      console.log('='.repeat(30))

      if (analysis.priceData) {
        console.log(`💰 Current Gold Price: $${analysis.priceData.spotPrice}`)
        console.log(`📊 24h Change: ${analysis.priceData.changePercent24h}%`)
        console.log(`📈 Weekly Change: ${analysis.priceData.changeWeekly}%`)

        if (analysis.priceData.sources) {
          console.log(`🔍 Price Sources: ${analysis.priceData.sources.length} verified`)
        }
      }

      if (analysis.signal) {
        console.log(`🎯 Trading Signal: ${analysis.signal}`)
        console.log(`🔒 Confidence: ${analysis.confidence}`)
        console.log(`⚖️ Risk Level: ${analysis.riskLevel}`)
      }

      if (analysis.entryPoint) {
        console.log(`💡 Entry Point: $${analysis.entryPoint}`)
        console.log(`🛡️ Stop Loss: $${analysis.stopLoss}`)
        console.log(`🎯 Take Profit: $${analysis.takeProfit}`)
      }

      if (analysis.news24h && analysis.news24h.length > 0) {
        console.log(`📰 Latest News (24h): ${analysis.news24h.length} items`)
        console.log(`📄 Top Headline: ${analysis.news24h[0].headline}`)
        if (analysis.news24h[0].originalUrl) {
          console.log(`🔗 Source URL: ${analysis.news24h[0].originalUrl}`)
        }
        console.log(`📊 Sentiment: ${analysis.news24h[0].sentiment} | Impact: ${analysis.news24h[0].impact}`)

        // Show additional headlines if available
        if (analysis.news24h.length > 1) {
          console.log(`📄 Second Headline: ${analysis.news24h[1].headline}`)
        }
        if (analysis.news24h.length > 2) {
          console.log(`📄 Third Headline: ${analysis.news24h[2].headline}`)
        }
        if (analysis.news24h.length > 3) {
          console.log(`... and ${analysis.news24h.length - 3} more news items`)
        }
      }

      if (analysis.technicalView) {
        console.log(`📈 Technical Trend: ${analysis.technicalView.trend}`)
        if (analysis.technicalView.supportLevels) {
          console.log(`🛡️ Support: $${analysis.technicalView.supportLevels[0]}`)
        }
        if (analysis.technicalView.resistanceLevels) {
          console.log(`⚡ Resistance: $${analysis.technicalView.resistanceLevels[0]}`)
        }
      }

      // Display validation results if available
      if (validationResults && validationResults.credibilityScore !== undefined) {
        console.log('\n🔍 NEWS CREDIBILITY VALIDATION:')
        console.log(`🏆 Credibility Score: ${validationResults.credibilityScore}/100`)

        if (validationResults.credibilityScore >= 80) {
          console.log(`✅ High Credibility - Analysis is highly reliable`)
        } else if (validationResults.credibilityScore >= 60) {
          console.log(`⚠️  Moderate Credibility - Use with caution`)
        } else {
          console.log(`❌ Low Credibility - Seek additional verification`)
        }

        console.log(`✅ Trusted Sources: ${validationResults.trustedSources}/${validationResults.totalItems}`)
        console.log(`🔗 Sources with URLs: ${validationResults.totalItems - validationResults.missingUrls}/${validationResults.totalItems}`)
        console.log(`📅 Recent News: ${validationResults.recentNews}/${validationResults.totalItems}`)

        if (validationResults.recommendations && validationResults.recommendations.length > 0) {
          console.log(`💡 Key Recommendation: ${validationResults.recommendations[0]}`)
        }
      }

      // Generate automatic alerts and notifications
      generateTradingAlerts(outputText)
    } else {
      console.log('📊 Analysis completed - check saved file for detailed results')
      if (extractionResult.error) {
        console.log(`❌ JSON extraction error: ${extractionResult.error}`)
      }
    }

    console.log('='.repeat(50))
  } catch (error) {
    console.log('📊 Analysis completed - check saved file for detailed results')
    console.log(`❌ Display error: ${error.message}`)
  }
}

// Execute the analysis
analyzeGoldMarket()
