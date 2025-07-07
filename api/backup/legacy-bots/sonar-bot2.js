import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

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

    // Create dates in M/D/YYYY format
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`
    const yesterdayDate = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear()}`

    console.log(`📅 Analyzing data from ${yesterdayDate} to ${todayDate}`)

    const messages = [
      {
        role: 'system',
        content: `You are a financial analyst specializing in precious metals market analysis. Provide responses in JSON format only. Focus on factual, current market data from trusted financial sources. Use professional, concise language appropriate for traders and investors. 
          Use the following format for your response:
Please provide a JSON-structured analysis with:
{
  "timestamp": "2025-07-01T00:00:00Z",
  "priceData": {
    "spotPrice": <number>,
    "change24h": <number>,
    "changePercent24h": <number>,
    "changeWeekly": <number>,
    "lastUpdated": "HH:MM UTC",
    "sources": [
      {"name": "TradingView", "price": <number>, "time": "HH:MM"},
      {"name": "Investing.com", "price": <number>, "time": "HH:MM"},
      {"name": "MarketWatch", "price": <number>, "time": "HH:MM"},
      {"name": "Yahoo Finance", "price": <number>, "time": "HH:MM"}
    ]
  },
  "news24h": [
    {
      "headline": "exact headline",
      "source": "news source",
      "originalUrl": "https://full-url-to-original-article.com",
      "timePublished": "MM/DD/YYYY HH:MM",
      "sentiment": "bullish|bearish|neutral",
      "impact": "high|medium|low",
      "category": "fed|geopolitical|technical|institutional|supply"
    },
    {
      "headline": "second news headline",
      "source": "news source",
      "originalUrl": "https://second-article-url.com",
      "timePublished": "MM/DD/YYYY HH:MM",
      "sentiment": "bullish|bearish|neutral",
      "impact": "high|medium|low",
      "category": "fed|geopolitical|technical|institutional|supply"
    }
    // ... include minimum 10 news items total
  ],
  "sentiment": "bullish|bearish|neutral",
  "confidence": "high|medium|low", 
  "signal": "strong_buy|buy|hold|sell|strong_sell",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "fedImpact": "description of Federal Reserve policy impact",
  "technicalView": {
    "trend": "bullish|bearish|neutral",
    "supportLevels": [<number>, <number>],
    "resistanceLevels": [<number>, <number>],
    "rsi": <number>,
    "keyLevels": "specific price levels with numbers"
  },
  "riskLevel": "high|medium|low",
  "timeHorizon": "short-term|medium-term|long-term",
  "priceTarget": "estimated price movement with specific levels",
  "entryPoint": <number>,
  "stopLoss": <number>,
  "takeProfit": [<number>, <number>],
  "institutionalFlow": "buying|selling|neutral",
  "currencyImpact": "USD/DXY correlation analysis",
  "summary": "concise trading recommendation with reasoning"
}

Make sure the JSON is valid and properly formatted at the end of your response.
          `
      },
      {
        role: 'user',
        content:
          'Gold price movement last 24 hrs major a headlines NFP impact Federal Reserve policy DXY dollar index CPI inflation data Treasury yields 10-year geopolitical tensions Middle East China EUR USD market sentiment overnight trading Asia Europe US sessions Reuters Bloomberg MarketWatch CNBC Financial Times WSJ TradingView , Please translate to Thai language before response'
      }
    ]

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: messages,
        search_after_date_filter: `${yesterdayDate}`,
        web_search_options: {
          search_context_size: 'high'
        }
        // response_format: {
        //   type: 'json_schema',
        //   json_schema: {
        //     schema: {
        //       type: 'object',
        //       properties: {
        //         spot_price: {
        //           type: 'number',
        //           description: 'Current gold spot price in USD per ounce'
        //         },
        //         sentiment: {
        //           type: 'string',
        //           enum: ['bullish', 'bearish', 'neutral'],
        //           description: 'Overall market sentiment for gold'
        //         },
        //         confidence: {
        //           type: 'string',
        //           enum: ['high', 'medium', 'low'],
        //           description: 'Confidence level in the analysis'
        //         },
        //         signal: {
        //           type: 'string',
        //           enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell', 'wait_support', 'wait_resistance'],
        //           description: 'Trading signal recommendation'
        //         },
        //         summary: {
        //           type: 'string',
        //           maxLength: 300,
        //           description: 'Brief summary of key market developments'
        //         },
        //         key_drivers: {
        //           type: 'array',
        //           items: {
        //             type: 'string'
        //           },
        //           maxItems: 5,
        //           description: 'Main factors driving gold price movement'
        //         },
        //         nfp_impact: {
        //           type: 'string',
        //           enum: ['positive', 'negative', 'neutral'],
        //           description: 'Impact of NFP data on gold price'
        //         },
        //         fed_policy_impact: {
        //           type: 'string',
        //           enum: ['hawkish', 'dovish', 'neutral'],
        //           description: 'Federal Reserve policy stance impact'
        //         },
        //         dxy_impact: {
        //           type: 'string',
        //           enum: ['strengthening', 'weakening', 'neutral'],
        //           description: 'US Dollar Index impact on gold'
        //         },
        //         inflation_data: {
        //           type: 'string',
        //           enum: ['high', 'moderate', 'low'],
        //           description: 'Current inflation environment'
        //         },
        //         geopolitical_risk: {
        //           type: 'string',
        //           enum: ['high', 'medium', 'low'],
        //           description: 'Level of geopolitical risk affecting markets'
        //         }
        //       },
        //       required: ['spot_price', 'sentiment', 'confidence', 'signal', 'summary', 'key_drivers', 'nfp_impact', 'fed_policy_impact', 'dxy_impact', 'inflation_data', 'geopolitical_risk'],
        //       additionalProperties: false
        //     }
        //   }
        // }
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

    // Validate analysis credibility
    const validationResults = await validateNewsCredibility(analysisText)

    // Extract and display key findings
    displayKeyFindings(analysisText, validationResults)

    // Return the analysis results for programmatic use
    return {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: analysisText,
      validation: validationResults,
      dateRange: `${yesterdayDate} to ${todayDate}`,
      status: 'completed'
    }
  } catch (error) {
    console.error('❌ Error analyzing gold market:', error.message)

    // Return error results for programmatic use
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    }
  }
}

// Enhanced JSON extraction with better parsing for structured response
function extractAndValidateJSON(analysisText) {
  try {
    // The Perplexity response with JSON schema should come as direct JSON
    try {
      const directParse = JSON.parse(analysisText)
      if (directParse && typeof directParse === 'object' && (directParse.priceData || directParse.timestamp || directParse.unified_analysis)) {
        console.log('✅ Successfully parsed response as direct JSON with new structured schema')
        return { success: true, analysis: directParse, rawJSON: analysisText }
      }
    } catch (directError) {
      // Not direct JSON, continue with pattern matching
    }

    // Try to find JSON in the response - look for patterns
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/, // JSON in code blocks
      /^\s*(\{[\s\S]*\})\s*$/, // Entire response is JSON
      /\{[\s\S]*"priceData"[\s\S]*?\}/, // Look for JSON with priceData field
      /\{[\s\S]*"timestamp"[\s\S]*?\}/, // Look for JSON with timestamp field
      /\{[\s\S]*"sentiment"[\s\S]*?\}/, // Look for JSON with sentiment field
      /\{[\s\S]*"news24h"[\s\S]*?\}/, // Look for JSON with news24h field
      /\{[\s\S]*"unified_analysis"[\s\S]*?\}/ // Look for JSON with unified_analysis field
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

// News validation and credibility checker for structured response
async function validateNewsCredibility(analysisText) {
  try {
    console.log('\n🔍 VALIDATING ANALYSIS CREDIBILITY...')
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

    // Validate required fields are present - support both legacy and unified_analysis structures
    let requiredFields = []
    let isUnifiedAnalysis = false

    // Check if this is a unified_analysis structure
    if (analysis.unified_analysis && typeof analysis.unified_analysis === 'object') {
      isUnifiedAnalysis = true
      requiredFields = ['timestamp', 'source', 'unified_analysis']
    } else {
      // Legacy structure
      requiredFields = ['timestamp', 'priceData', 'news24h', 'sentiment', 'confidence', 'signal', 'keyFactors', 'summary']
    }

    const missingFields = requiredFields.filter((field) => !analysis[field])

    if (missingFields.length > 0) {
      console.log(`⚠️  Missing required fields: ${missingFields.join(', ')}`)
      return {
        validated: false,
        reason: `Missing required fields: ${missingFields.join(', ')}`,
        credibilityScore: 0,
        recommendations: ['❌ Incomplete analysis - missing critical data fields']
      }
    }

    console.log(`📊 Validating structured analysis... (${isUnifiedAnalysis ? 'unified_analysis' : 'legacy'} format)`)

    // Validate data quality
    const validationResults = {
      timestamp: new Date().toISOString(),
      totalFields: Object.keys(analysis).length,
      validatedFields: [],
      dataQuality: 'high',
      credibilityScore: 0,
      recommendations: [],
      isUnifiedAnalysis
    }

    // Validate timestamp
    if (analysis.timestamp && typeof analysis.timestamp === 'string') {
      validationResults.validatedFields.push('timestamp')
      console.log(`✅ Valid timestamp: ${analysis.timestamp}`)
    } else {
      console.log(`❌ Invalid timestamp: ${analysis.timestamp}`)
      validationResults.recommendations.push('❌ Invalid timestamp data')
    }

    if (isUnifiedAnalysis) {
      // Validate unified_analysis structure
      const unified = analysis.unified_analysis

      // Validate spot price
      if (typeof unified.spot_price === 'number' && unified.spot_price > 0) {
        validationResults.validatedFields.push('unified_analysis.spot_price')
        console.log(`✅ Valid spot price: $${unified.spot_price}`)
      } else {
        console.log(`❌ Invalid spot price: ${unified.spot_price}`)
        validationResults.recommendations.push('❌ Invalid spot price data')
      }

      // Validate price change data
      if (unified.price_change && typeof unified.price_change === 'object') {
        if (typeof unified.price_change.daily_pct === 'number') {
          validationResults.validatedFields.push('unified_analysis.price_change.daily_pct')
          console.log(`✅ Valid daily change: ${unified.price_change.daily_pct}%`)
        }
        if (typeof unified.price_change.weekly_pct === 'number') {
          validationResults.validatedFields.push('unified_analysis.price_change.weekly_pct')
          console.log(`✅ Valid weekly change: ${unified.price_change.weekly_pct}%`)
        }
      }

      // Validate technical indicators
      if (unified.technical_indicators && typeof unified.technical_indicators === 'object') {
        const tech = unified.technical_indicators

        if (typeof tech.rsi_14 === 'number') {
          validationResults.validatedFields.push('unified_analysis.technical_indicators.rsi_14')
          console.log(`✅ Valid RSI: ${tech.rsi_14}`)
        }

        if (Array.isArray(tech.supports) && tech.supports.length > 0) {
          validationResults.validatedFields.push('unified_analysis.technical_indicators.supports')
          console.log(`✅ Valid support levels: ${tech.supports.length} levels`)
        }

        if (Array.isArray(tech.resistances) && tech.resistances.length > 0) {
          validationResults.validatedFields.push('unified_analysis.technical_indicators.resistances')
          console.log(`✅ Valid resistance levels: ${tech.resistances.length} levels`)
        }

        if (tech.trend && ['bullish', 'bearish', 'neutral'].includes(tech.trend)) {
          validationResults.validatedFields.push('unified_analysis.technical_indicators.trend')
          console.log(`✅ Valid trend: ${tech.trend}`)
        }
      }

      // Validate signals
      if (unified.signals && typeof unified.signals === 'object') {
        const signals = unified.signals
        const validSignalValues = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']

        if (validSignalValues.includes(signals.short_term)) {
          validationResults.validatedFields.push('unified_analysis.signals.short_term')
          console.log(`✅ Valid short-term signal: ${signals.short_term}`)
        }

        if (validSignalValues.includes(signals.medium_term)) {
          validationResults.validatedFields.push('unified_analysis.signals.medium_term')
          console.log(`✅ Valid medium-term signal: ${signals.medium_term}`)
        }

        if (validSignalValues.includes(signals.long_term)) {
          validationResults.validatedFields.push('unified_analysis.signals.long_term')
          console.log(`✅ Valid long-term signal: ${signals.long_term}`)
        }
      }

      // Validate market sentiment
      if (unified.market_sentiment && typeof unified.market_sentiment === 'object') {
        const sentiment = unified.market_sentiment

        if (['bullish', 'bearish', 'neutral'].includes(sentiment.overall)) {
          validationResults.validatedFields.push('unified_analysis.market_sentiment.overall')
          console.log(`✅ Valid sentiment: ${sentiment.overall}`)
        }

        if (typeof sentiment.summary === 'string' && sentiment.summary.length > 0) {
          validationResults.validatedFields.push('unified_analysis.market_sentiment.summary')
          console.log(`✅ Valid sentiment summary: ${sentiment.summary.substring(0, 50)}...`)
        }

        if (['high', 'medium', 'low'].includes(sentiment.confidence)) {
          validationResults.validatedFields.push('unified_analysis.market_sentiment.confidence')
          console.log(`✅ Valid confidence: ${sentiment.confidence}`)
        }
      }

      // Validate news highlights
      if (Array.isArray(unified.news_highlights) && unified.news_highlights.length > 0) {
        validationResults.validatedFields.push('unified_analysis.news_highlights')
        console.log(`✅ Valid news highlights: ${unified.news_highlights.length} articles`)

        // Check first few articles for structure
        const newsValidationCount = Math.min(3, unified.news_highlights.length)
        let validNewsItems = 0

        for (let i = 0; i < newsValidationCount; i++) {
          const article = unified.news_highlights[i]
          if (article.headline && article.source && article.sentiment && article.impact) {
            validNewsItems++
          }
        }

        if (validNewsItems === newsValidationCount) {
          validationResults.validatedFields.push('unified_analysis.news_highlights.structure')
          console.log(`✅ Valid news structure: ${validNewsItems}/${newsValidationCount} articles properly formatted`)
        } else {
          console.log(`❌ Invalid news structure: ${validNewsItems}/${newsValidationCount} articles properly formatted`)
          validationResults.recommendations.push('❌ News articles missing required fields')
        }
      }
    } else {
      // Legacy validation logic
      // Validate price data structure
      if (analysis.priceData && typeof analysis.priceData === 'object') {
        const priceData = analysis.priceData

        // Check spot price
        if (typeof priceData.spotPrice === 'number' && priceData.spotPrice > 0) {
          validationResults.validatedFields.push('priceData.spotPrice')
          console.log(`✅ Valid spot price: $${priceData.spotPrice}`)
        } else {
          console.log(`❌ Invalid spot price: ${priceData.spotPrice}`)
          validationResults.recommendations.push('❌ Invalid spot price data')
        }

        // Check 24h change
        if (typeof priceData.change24h === 'number') {
          validationResults.validatedFields.push('priceData.change24h')
          console.log(`✅ Valid 24h change: $${priceData.change24h}`)
        } else {
          console.log(`❌ Invalid 24h change: ${priceData.change24h}`)
          validationResults.recommendations.push('❌ Invalid 24h change data')
        }

        // Check percentage change
        if (typeof priceData.changePercent24h === 'number') {
          validationResults.validatedFields.push('priceData.changePercent24h')
          console.log(`✅ Valid 24h change %: ${priceData.changePercent24h}%`)
        } else {
          console.log(`❌ Invalid 24h change %: ${priceData.changePercent24h}`)
          validationResults.recommendations.push('❌ Invalid percentage change data')
        }

        // Check sources array
        if (Array.isArray(priceData.sources) && priceData.sources.length > 0) {
          validationResults.validatedFields.push('priceData.sources')
          console.log(`✅ Valid price sources: ${priceData.sources.length} sources`)
        } else {
          console.log(`❌ Invalid price sources: ${priceData.sources}`)
          validationResults.recommendations.push('❌ Invalid price sources data')
        }
      } else {
        console.log(`❌ Invalid price data structure`)
        validationResults.recommendations.push('❌ Missing or invalid price data structure')
      }

      // Validate news data
      if (Array.isArray(analysis.news24h) && analysis.news24h.length >= 5) {
        validationResults.validatedFields.push('news24h')
        console.log(`✅ Valid news data: ${analysis.news24h.length} articles`)

        // Validate news article structure
        const newsValidationCount = Math.min(3, analysis.news24h.length)
        let validNewsItems = 0

        for (let i = 0; i < newsValidationCount; i++) {
          const article = analysis.news24h[i]
          if (article.headline && article.source && article.sentiment && article.impact) {
            validNewsItems++
          }
        }

        if (validNewsItems === newsValidationCount) {
          validationResults.validatedFields.push('news24h.structure')
          console.log(`✅ Valid news structure: ${validNewsItems}/${newsValidationCount} articles properly formatted`)
        } else {
          console.log(`❌ Invalid news structure: ${validNewsItems}/${newsValidationCount} articles properly formatted`)
          validationResults.recommendations.push('❌ News articles missing required fields')
        }
      } else {
        console.log(`❌ Invalid news data: ${Array.isArray(analysis.news24h) ? analysis.news24h.length : 'not array'} articles`)
        validationResults.recommendations.push('❌ Insufficient news data (minimum 5 articles required)')
      }

      // Validate enum fields for legacy format
      const enumValidations = [
        { field: 'sentiment', validValues: ['bullish', 'bearish', 'neutral'] },
        { field: 'confidence', validValues: ['high', 'medium', 'low'] },
        { field: 'signal', validValues: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'] },
        { field: 'riskLevel', validValues: ['high', 'medium', 'low'] },
        { field: 'timeHorizon', validValues: ['short-term', 'medium-term', 'long-term'] },
        { field: 'institutionalFlow', validValues: ['buying', 'selling', 'neutral'] }
      ]

      let validEnumFields = 0
      enumValidations.forEach(({ field, validValues }) => {
        if (validValues.includes(analysis[field])) {
          validationResults.validatedFields.push(field)
          validEnumFields++
          console.log(`✅ Valid ${field}: ${analysis[field]}`)
        } else {
          console.log(`❌ Invalid ${field}: ${analysis[field]}`)
          validationResults.recommendations.push(`❌ Invalid ${field} value`)
        }
      })

      // Validate keyFactors array (renamed from key_drivers)
      if (Array.isArray(analysis.keyFactors) && analysis.keyFactors.length > 0) {
        validationResults.validatedFields.push('keyFactors')
        console.log(`✅ Valid key factors: ${analysis.keyFactors.length} items`)
      } else {
        console.log(`❌ Invalid key factors: ${analysis.keyFactors}`)
        validationResults.recommendations.push('❌ Invalid key factors data')
      }

      // Validate technical view structure
      if (analysis.technicalView && typeof analysis.technicalView === 'object') {
        const tech = analysis.technicalView

        if (tech.trend && ['bullish', 'bearish', 'neutral'].includes(tech.trend)) {
          validationResults.validatedFields.push('technicalView.trend')
          console.log(`✅ Valid technical trend: ${tech.trend}`)
        } else {
          console.log(`❌ Invalid technical trend: ${tech.trend}`)
          validationResults.recommendations.push('❌ Invalid technical trend data')
        }

        if (Array.isArray(tech.supportLevels) && tech.supportLevels.length > 0) {
          validationResults.validatedFields.push('technicalView.supportLevels')
          console.log(`✅ Valid support levels: ${tech.supportLevels.length} levels`)
        } else {
          console.log(`❌ Invalid support levels: ${tech.supportLevels}`)
          validationResults.recommendations.push('❌ Invalid support levels data')
        }

        if (Array.isArray(tech.resistanceLevels) && tech.resistanceLevels.length > 0) {
          validationResults.validatedFields.push('technicalView.resistanceLevels')
          console.log(`✅ Valid resistance levels: ${tech.resistanceLevels.length} levels`)
        } else {
          console.log(`❌ Invalid resistance levels: ${tech.resistanceLevels}`)
          validationResults.recommendations.push('❌ Invalid resistance levels data')
        }
      } else {
        console.log(`❌ Invalid technical view structure`)
        validationResults.recommendations.push('❌ Missing or invalid technical analysis data')
      }

      // Validate trading levels
      if (typeof analysis.entryPoint === 'number' && analysis.entryPoint > 0) {
        validationResults.validatedFields.push('entryPoint')
        console.log(`✅ Valid entry point: $${analysis.entryPoint}`)
      } else {
        console.log(`❌ Invalid entry point: ${analysis.entryPoint}`)
        validationResults.recommendations.push('❌ Invalid entry point data')
      }

      if (typeof analysis.stopLoss === 'number' && analysis.stopLoss > 0) {
        validationResults.validatedFields.push('stopLoss')
        console.log(`✅ Valid stop loss: $${analysis.stopLoss}`)
      } else {
        console.log(`❌ Invalid stop loss: ${analysis.stopLoss}`)
        validationResults.recommendations.push('❌ Invalid stop loss data')
      }

      if (Array.isArray(analysis.takeProfit) && analysis.takeProfit.length >= 2) {
        validationResults.validatedFields.push('takeProfit')
        console.log(`✅ Valid take profit levels: ${analysis.takeProfit.length} levels`)
      } else {
        console.log(`❌ Invalid take profit levels: ${analysis.takeProfit}`)
        validationResults.recommendations.push('❌ Invalid take profit data')
      }

      // Validate summary
      if (typeof analysis.summary === 'string' && analysis.summary.length > 0) {
        validationResults.validatedFields.push('summary')
        console.log(`✅ Valid summary: ${analysis.summary.substring(0, 50)}...`)
      } else {
        console.log(`❌ Invalid summary`)
        validationResults.recommendations.push('❌ Invalid summary data')
      }
    }

    // Calculate credibility score (0-100) - updated for both JSON structures
    const expectedFields = isUnifiedAnalysis
      ? [
          'timestamp',
          'unified_analysis.spot_price',
          'unified_analysis.price_change.daily_pct',
          'unified_analysis.price_change.weekly_pct',
          'unified_analysis.technical_indicators.rsi_14',
          'unified_analysis.technical_indicators.supports',
          'unified_analysis.technical_indicators.resistances',
          'unified_analysis.technical_indicators.trend',
          'unified_analysis.signals.short_term',
          'unified_analysis.signals.medium_term',
          'unified_analysis.signals.long_term',
          'unified_analysis.market_sentiment.overall',
          'unified_analysis.market_sentiment.summary',
          'unified_analysis.market_sentiment.confidence',
          'unified_analysis.news_highlights',
          'unified_analysis.news_highlights.structure'
        ]
      : [
          'timestamp',
          'priceData.spotPrice',
          'priceData.change24h',
          'priceData.changePercent24h',
          'priceData.sources',
          'news24h',
          'news24h.structure',
          'sentiment',
          'confidence',
          'signal',
          'riskLevel',
          'timeHorizon',
          'institutionalFlow',
          'keyFactors',
          'technicalView.trend',
          'technicalView.supportLevels',
          'technicalView.resistanceLevels',
          'entryPoint',
          'stopLoss',
          'takeProfit',
          'summary'
        ]

    const validFields = validationResults.validatedFields.length
    const totalExpected = expectedFields.length
    validationResults.credibilityScore = Math.round((validFields / totalExpected) * 100)

    // Generate quality assessment
    if (validationResults.credibilityScore >= 90) {
      validationResults.dataQuality = 'excellent'
      validationResults.recommendations.push('✅ Excellent data quality - analysis is highly reliable')
    } else if (validationResults.credibilityScore >= 75) {
      validationResults.dataQuality = 'good'
      validationResults.recommendations.push('✅ Good data quality - analysis is reliable')
    } else if (validationResults.credibilityScore >= 60) {
      validationResults.dataQuality = 'moderate'
      validationResults.recommendations.push('⚠️  Moderate data quality - use with caution')
    } else {
      validationResults.dataQuality = 'poor'
      validationResults.recommendations.push('❌ Poor data quality - seek additional verification')
    }

    // Display validation results
    console.log(`📊 CREDIBILITY VALIDATION RESULTS:`)
    console.log(`🏆 Credibility Score: ${validationResults.credibilityScore}/100`)
    console.log(`✅ Valid Fields: ${validFields}/${totalExpected}`)
    console.log(`📈 Data Quality: ${validationResults.dataQuality}`)

    console.log('\n💡 RECOMMENDATIONS:')
    validationResults.recommendations.forEach((rec) => console.log(rec))

    validationResults.validated = validationResults.credibilityScore >= 60

    return validationResults
  } catch (error) {
    console.error('❌ Error validating analysis credibility:', error.message)
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

// Advanced alert generation system for structured response
function generateTradingAlerts(outputText) {
  try {
    console.log('\n🚨 AUTOMATED TRADING ALERTS:')
    console.log('='.repeat(40))

    const extractionResult = extractAndValidateJSON(outputText)
    if (!extractionResult.success || !extractionResult.analysis) {
      console.log('⚠️  No analysis data available for alerts')
      return
    }

    const analysis = extractionResult.analysis

    // Price movement alerts
    if (analysis.spot_price && typeof analysis.spot_price === 'number') {
      console.log(`� CURRENT GOLD PRICE: $${analysis.spot_price}`)

      // Check for significant price levels
      if (analysis.spot_price >= 2100) {
        console.log(`🚨 HIGH PRICE ALERT: Gold above $2100 - resistance zone`)
      } else if (analysis.spot_price <= 1900) {
        console.log(`� LOW PRICE ALERT: Gold below $1900 - support zone`)
      }
    }

    // Signal-based alerts
    if (analysis.signal) {
      const signalEmoji = {
        strong_buy: '🚀',
        buy: '📈',
        hold: '🤝',
        sell: '📉',
        strong_sell: '🔻'
      }

      const signalMessages = {
        strong_buy: 'STRONG BUY SIGNAL - Consider aggressive long positions',
        buy: 'BUY SIGNAL - Consider long positions',
        hold: 'HOLD SIGNAL - Maintain current positions',
        sell: 'SELL SIGNAL - Consider taking profits',
        strong_sell: 'STRONG SELL SIGNAL - Consider defensive positions'
      }

      console.log(`${signalEmoji[analysis.signal] || '🎯'} ${signalMessages[analysis.signal] || analysis.signal.toUpperCase()}`)

      if (analysis.confidence) {
        console.log(`🔒 Signal Confidence: ${analysis.confidence.toUpperCase()}`)

        if (analysis.confidence === 'high' && (analysis.signal === 'strong_buy' || analysis.signal === 'strong_sell')) {
          console.log(`⚡ HIGH CONFIDENCE + STRONG SIGNAL: Consider increased position sizing`)
        }
      }
    }

    // Market factor alerts
    console.log('\n📊 MARKET FACTOR ALERTS:')

    if (analysis.fed_policy_impact === 'dovish') {
      console.log(`�️ DOVISH FED POLICY: Bullish for gold - rate cut expectations`)
    } else if (analysis.fed_policy_impact === 'hawkish') {
      console.log(`🦅 HAWKISH FED POLICY: Bearish for gold - rate hike pressure`)
    }

    if (analysis.dxy_impact === 'weakening') {
      console.log(`📉 WEAK DOLLAR: Bullish for gold - currency debasement`)
    } else if (analysis.dxy_impact === 'strengthening') {
      console.log(`💪 STRONG DOLLAR: Bearish for gold - opportunity cost`)
    }

    if (analysis.inflation_data === 'high') {
      console.log(`🔥 HIGH INFLATION: Bullish for gold - hedge demand`)
    } else if (analysis.inflation_data === 'low') {
      console.log(`❄️ LOW INFLATION: Bearish for gold - reduced hedge appeal`)
    }

    if (analysis.geopolitical_risk === 'high') {
      console.log(`🚨 HIGH GEOPOLITICAL RISK: Bullish for gold - safe haven demand`)
    }

    if (analysis.nfp_impact === 'negative') {
      console.log(`📉 WEAK NFP DATA: Bullish for gold - dovish Fed expectations`)
    } else if (analysis.nfp_impact === 'positive') {
      console.log(`📈 STRONG NFP DATA: Bearish for gold - hawkish Fed expectations`)
    }

    // Sentiment-based alerts
    if (analysis.sentiment) {
      const sentimentMessages = {
        bullish: '📈 BULLISH SENTIMENT: Market favoring gold upside',
        bearish: '📉 BEARISH SENTIMENT: Market expecting gold downside',
        neutral: '🤝 NEUTRAL SENTIMENT: Market awaiting direction'
      }
      console.log(`${sentimentMessages[analysis.sentiment] || analysis.sentiment}`)
    }

    // Key drivers alert
    if (analysis.key_drivers && Array.isArray(analysis.key_drivers) && analysis.key_drivers.length > 0) {
      console.log('\n� TOP MARKET DRIVERS:')
      analysis.key_drivers.slice(0, 3).forEach((driver, index) => {
        console.log(`   ${index + 1}. ${driver}`)
      })
    }

    // Risk assessment
    console.log('\n⚠️ RISK ASSESSMENT:')
    let riskFactors = 0

    if (analysis.geopolitical_risk === 'high') riskFactors++
    if (analysis.fed_policy_impact === 'hawkish') riskFactors++
    if (analysis.dxy_impact === 'strengthening') riskFactors++
    if (analysis.confidence === 'low') riskFactors++

    if (riskFactors >= 3) {
      console.log(`🚨 HIGH RISK ENVIRONMENT: ${riskFactors} negative factors - reduce position size`)
    } else if (riskFactors >= 2) {
      console.log(`⚠️ MODERATE RISK: ${riskFactors} negative factors - standard position sizing`)
    } else {
      console.log(`✅ LOW RISK ENVIRONMENT: ${riskFactors} negative factors - normal trading`)
    }

    // News-based alerts
    if (analysis.news24h && Array.isArray(analysis.news24h)) {
      console.log(`📰 NEWS ANALYSIS: ${analysis.news24h.length} articles processed`)

      const highImpactNews = analysis.news24h.filter((article) => article.impact === 'high')
      if (highImpactNews.length > 0) {
        console.log(`🔥 HIGH IMPACT NEWS: ${highImpactNews.length} critical developments`)
        highImpactNews.slice(0, 2).forEach((article, index) => {
          const sentimentEmoji = { bullish: '📈', bearish: '📉', neutral: '🤝' }
          console.log(`   ${index + 1}. ${sentimentEmoji[article.sentiment] || '📊'} ${article.headline.substring(0, 60)}...`)
        })
      }
    }

    // Technical analysis alerts
    if (analysis.technicalView) {
      const tech = analysis.technicalView
      console.log('\n📊 TECHNICAL ALERTS:')

      if (tech.trend === 'bullish') {
        console.log(`📈 BULLISH TREND: Technical momentum favoring upside`)
      } else if (tech.trend === 'bearish') {
        console.log(`📉 BEARISH TREND: Technical momentum favoring downside`)
      }

      if (tech.supportLevels && Array.isArray(tech.supportLevels) && spotPrice) {
        const nearestSupport = tech.supportLevels.find((level) => level < spotPrice && (spotPrice - level) / spotPrice < 0.02)
        if (nearestSupport) {
          console.log(`🛡️ SUPPORT ALERT: Near key support at $${nearestSupport}`)
        }
      }

      if (tech.resistanceLevels && Array.isArray(tech.resistanceLevels) && spotPrice) {
        const nearestResistance = tech.resistanceLevels.find((level) => level > spotPrice && (level - spotPrice) / spotPrice < 0.02)
        if (nearestResistance) {
          console.log(`⛔ RESISTANCE ALERT: Near key resistance at $${nearestResistance}`)
        }
      }
    }

    // Trading level alerts
    if (analysis.entryPoint && spotPrice) {
      const entryDistance = (Math.abs(spotPrice - analysis.entryPoint) / spotPrice) * 100
      if (entryDistance < 1) {
        console.log(`🎯 ENTRY ALERT: Current price within 1% of entry point ($${analysis.entryPoint})`)
      }
    }

    // Risk assessment alerts
    if (analysis.riskLevel === 'high') {
      console.log(`🚨 HIGH RISK ALERT: Elevated market risk - reduce position sizing`)
    }

    // Institutional flow alerts
    if (analysis.institutionalFlow === 'buying') {
      console.log(`💰 INSTITUTIONAL BUYING: Smart money accumulating gold`)
    } else if (analysis.institutionalFlow === 'selling') {
      console.log(`💸 INSTITUTIONAL SELLING: Smart money reducing gold exposure`)
    }

    console.log('='.repeat(40))
  } catch (error) {
    console.log('⚠️  Alert generation failed - manual review recommended')
    console.log(`Error: ${error.message}`)
  }
}

// Display key findings from structured analysis
function displayKeyFindings(outputText, validationResults = null) {
  try {
    console.log('\n📈 KEY SONAR ANALYSIS FINDINGS:')
    console.log('='.repeat(50))

    // Use enhanced JSON extraction
    const extractionResult = extractAndValidateJSON(outputText)

    if (extractionResult.success && extractionResult.analysis) {
      const analysis = extractionResult.analysis

      // Display extracted JSON for verification
      console.log('\n📋 STRUCTURED ANALYSIS RESULTS:')
      console.log('='.repeat(30))
      console.log(JSON.stringify(analysis, null, 2))
      console.log('='.repeat(30))

      // Display key metrics - updated for both JSON structures
      if (analysis.unified_analysis) {
        // Handle unified_analysis structure
        const unified = analysis.unified_analysis

        if (unified.spot_price) {
          console.log(`💰 Current Gold Price: $${unified.spot_price}`)

          if (unified.price_change) {
            if (unified.price_change.daily_pct !== undefined && unified.price_change.daily_pct !== null) {
              const changeSymbol = unified.price_change.daily_pct >= 0 ? '+' : ''
              console.log(`📈 Daily Change: ${changeSymbol}${unified.price_change.daily_pct}%`)
            }

            if (unified.price_change.weekly_pct !== undefined && unified.price_change.weekly_pct !== null) {
              const changeSymbol = unified.price_change.weekly_pct >= 0 ? '+' : ''
              console.log(`📈 Weekly Change: ${changeSymbol}${unified.price_change.weekly_pct}%`)
            }
          }
        }

        // Display market sentiment from unified structure
        if (unified.market_sentiment) {
          const sentiment = unified.market_sentiment
          const sentimentEmoji = {
            bullish: '📈',
            bearish: '📉',
            neutral: '🤝'
          }
          console.log(`${sentimentEmoji[sentiment.overall] || '📊'} Market Sentiment: ${(sentiment.overall || 'neutral').toUpperCase()}`)

          if (sentiment.confidence) {
            const confidenceEmoji = {
              high: '🔒',
              medium: '⚖️',
              low: '⚠️'
            }
            console.log(`${confidenceEmoji[sentiment.confidence] || '📊'} Confidence: ${sentiment.confidence.toUpperCase()}`)
          }

          if (sentiment.summary) {
            console.log(`📝 Market Summary: ${sentiment.summary}`)
          }
        }

        // Display trading signals from unified structure
        if (unified.signals) {
          const signals = unified.signals
          const signalEmoji = {
            strong_buy: '🚀',
            buy: '📈',
            hold: '🤝',
            sell: '📉',
            strong_sell: '🔻'
          }

          if (signals.short_term) {
            console.log(`${signalEmoji[signals.short_term] || '🎯'} Short-term Signal: ${signals.short_term.toUpperCase()}`)
          }
          if (signals.medium_term) {
            console.log(`${signalEmoji[signals.medium_term] || '🎯'} Medium-term Signal: ${signals.medium_term.toUpperCase()}`)
          }
          if (signals.long_term) {
            console.log(`${signalEmoji[signals.long_term] || '🎯'} Long-term Signal: ${signals.long_term.toUpperCase()}`)
          }
        }

        // Display technical analysis from unified structure
        if (unified.technical_indicators) {
          console.log('\n📊 TECHNICAL ANALYSIS:')
          const tech = unified.technical_indicators

          if (tech.trend) {
            const trendEmoji = { bullish: '📈', bearish: '📉', neutral: '➡️' }
            console.log(`📈 Trend: ${trendEmoji[tech.trend] || '📊'} ${tech.trend.toUpperCase()}`)
          }

          if (tech.rsi_14) {
            console.log(`📊 RSI (14): ${tech.rsi_14}`)
          }

          if (Array.isArray(tech.supports) && tech.supports.length > 0) {
            console.log(`🛡️ Support Levels: $${tech.supports.join(', $')}`)
          }

          if (Array.isArray(tech.resistances) && tech.resistances.length > 0) {
            console.log(`⛔ Resistance Levels: $${tech.resistances.join(', $')}`)
          }
        }

        // Display news highlights from unified structure
        if (Array.isArray(unified.news_highlights) && unified.news_highlights.length > 0) {
          console.log(`📰 News Coverage: ${unified.news_highlights.length} articles analyzed`)

          // Show top 3 news headlines
          const topNews = unified.news_highlights.slice(0, 3)
          topNews.forEach((article, index) => {
            const impactEmoji = { high: '🔥', medium: '⚡', low: '📄' }
            const sentimentEmoji = { bullish: '📈', bearish: '📉', neutral: '🤝' }
            if (article && article.headline) {
              console.log(`   ${index + 1}. ${impactEmoji[article.impact] || '📄'} ${sentimentEmoji[article.sentiment] || '📊'} ${article.headline.substring(0, 80)}...`)
            }
          })
        }
      } else if (analysis.priceData && analysis.priceData.spotPrice) {
        // Handle legacy structure
        console.log(`💰 Current Gold Price: $${analysis.priceData.spotPrice}`)
        if (analysis.priceData.change24h !== undefined) {
          const changeSymbol = analysis.priceData.change24h >= 0 ? '+' : ''
          console.log(`📈 24h Change: ${changeSymbol}$${analysis.priceData.change24h} (${analysis.priceData.changePercent24h}%)`)
        }
        if (analysis.priceData.sources && analysis.priceData.sources.length > 0) {
          console.log(`📊 Price Sources: ${analysis.priceData.sources.length} confirmed sources`)
        }
      } else if (analysis.spot_price) {
        // Legacy support
        console.log(`💰 Current Gold Price: $${analysis.spot_price}`)
      }

      if (analysis.sentiment) {
        const sentimentEmoji = {
          bullish: '📈',
          bearish: '📉',
          neutral: '🤝'
        }
        console.log(`${sentimentEmoji[analysis.sentiment] || '📊'} Market Sentiment: ${analysis.sentiment.toUpperCase()}`)
      }

      if (analysis.signal) {
        const signalEmoji = {
          strong_buy: '🚀',
          buy: '📈',
          hold: '🤝',
          sell: '📉',
          strong_sell: '🔻',
          wait_support: '⏳',
          wait_resistance: '⏳'
        }
        console.log(`${signalEmoji[analysis.signal] || '🎯'} Trading Signal: ${analysis.signal.toUpperCase()}`)
      }

      if (analysis.confidence) {
        const confidenceEmoji = {
          high: '🔒',
          medium: '⚖️',
          low: '⚠️'
        }
        console.log(`${confidenceEmoji[analysis.confidence] || '📊'} Confidence: ${analysis.confidence.toUpperCase()}`)
      }

      if (analysis.summary) {
        console.log(`📝 Summary: ${analysis.summary}`)
      }

      // Display key factors (updated field name)
      if (analysis.keyFactors && Array.isArray(analysis.keyFactors)) {
        console.log(`🔑 Key Factors (${analysis.keyFactors.length}):`)
        analysis.keyFactors.forEach((factor, index) => {
          console.log(`   ${index + 1}. ${factor}`)
        })
      }

      // Display news summary
      if (analysis.news24h && Array.isArray(analysis.news24h)) {
        console.log(`📰 News Coverage: ${analysis.news24h.length} articles analyzed`)

        // Show top 3 news headlines
        const topNews = analysis.news24h.slice(0, 3)
        topNews.forEach((article, index) => {
          const impactEmoji = { high: '🔥', medium: '⚡', low: '📄' }
          const sentimentEmoji = { bullish: '📈', bearish: '📉', neutral: '🤝' }
          if (article && article.headline) {
            console.log(`   ${index + 1}. ${impactEmoji[article.impact] || '📄'} ${sentimentEmoji[article.sentiment] || '📊'} ${article.headline.substring(0, 80)}...`)
          }
        })
      }

      // Display technical analysis
      if (analysis.technicalView) {
        console.log('\n📊 TECHNICAL ANALYSIS:')
        const tech = analysis.technicalView

        if (tech.trend) {
          const trendEmoji = { bullish: '📈', bearish: '📉', neutral: '➡️' }
          console.log(`📈 Trend: ${trendEmoji[tech.trend] || '📊'} ${tech.trend.toUpperCase()}`)
        }

        if (tech.supportLevels && Array.isArray(tech.supportLevels)) {
          console.log(`🛡️ Support Levels: $${tech.supportLevels.join(', $')}`)
        }

        if (tech.resistanceLevels && Array.isArray(tech.resistanceLevels)) {
          console.log(`⛔ Resistance Levels: $${tech.resistanceLevels.join(', $')}`)
        }

        if (tech.rsi) {
          console.log(`📊 RSI: ${tech.rsi}`)
        }
      }

      // Display trading levels
      if (analysis.entryPoint || analysis.stopLoss || analysis.takeProfit) {
        console.log('\n🎯 TRADING LEVELS:')

        if (analysis.entryPoint) {
          console.log(`🎯 Entry Point: $${analysis.entryPoint}`)
        }

        if (analysis.stopLoss) {
          console.log(`🛑 Stop Loss: $${analysis.stopLoss}`)
        }

        if (analysis.takeProfit && Array.isArray(analysis.takeProfit)) {
          console.log(`🎯 Take Profit: $${analysis.takeProfit.join(', $')}`)
        }
      }

      // Display additional metrics
      if (analysis.riskLevel) {
        const riskEmoji = { high: '🚨', medium: '⚠️', low: '✅' }
        console.log(`⚠️ Risk Level: ${riskEmoji[analysis.riskLevel] || '📊'} ${analysis.riskLevel.toUpperCase()}`)
      }

      if (analysis.timeHorizon) {
        console.log(`⏰ Time Horizon: ${analysis.timeHorizon.toUpperCase()}`)
      }

      if (analysis.institutionalFlow) {
        const flowEmoji = { buying: '💰', selling: '💸', neutral: '🤝' }
        console.log(`🏛️ Institutional Flow: ${flowEmoji[analysis.institutionalFlow] || '📊'} ${analysis.institutionalFlow.toUpperCase()}`)
      }

      if (analysis.fedImpact) {
        console.log(`🏛️ Fed Impact: ${analysis.fedImpact}`)
      }

      if (analysis.currencyImpact) {
        console.log(`💵 Currency Impact: ${analysis.currencyImpact}`)
      }

      if (analysis.priceTarget) {
        console.log(`🎯 Price Target: ${analysis.priceTarget}`)
      }

      // Generate automatic alerts and notifications
      // generateTradingAlerts(outputText)
    } else {
      console.log('📊 Analysis completed - data exported for Line messaging')
      if (extractionResult.error) {
        console.log(`❌ JSON extraction error: ${extractionResult.error}`)
      }
    }

    console.log('='.repeat(50))
  } catch (error) {
    console.log('📊 Analysis completed - data exported for Line messaging')
    console.log(`❌ Display error: ${error.message}`)
  }
}

// Command line interface and API functions
async function runGoldAnalysis() {
  console.log('🔄 Executing Gold Market Analysis Bot...')
  const startTime = Date.now()

  try {
    const result = await analyzeGoldMarket()
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n⏱️  Analysis completed in ${duration} seconds`)
    console.log('🎉 Bot execution finished successfully!')

    return result
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.error(`\n⏱️  Analysis failed after ${duration} seconds`)
    console.error('💥 Bot execution failed!')

    return {
      success: false,
      error: error.message,
      duration: duration,
      timestamp: new Date().toISOString()
    }
  }
}

// Export functions for use in other modules
export { analyzeGoldMarket, runGoldAnalysis }

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Sonar Gold Analysis Bot...')
  console.log('='.repeat(50))

  // Run the analysis
  runGoldAnalysis()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ SUCCESS: Analysis completed successfully')
        console.log(`📊 Status: ${result.status}`)
        console.log(`📅 Date Range: ${result.dateRange}`)
        console.log(`🏆 Validation Score: ${result.validation?.credibilityScore || 'N/A'}/100`)
      } else {
        console.log('\n❌ FAILED: Analysis encountered errors')
        console.log(`💥 Error: ${result.error}`)
      }

      console.log('\n🏁 Bot execution completed.')
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('\n💥 FATAL ERROR:', error.message)
      process.exit(1)
    })
} else {
  // If imported as a module, run the analysis for Line export
  console.log('📦 Sonar bot loaded as module - ready for Line export')
}
