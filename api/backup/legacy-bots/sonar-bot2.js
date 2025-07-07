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
        content:
          'You are a financial analyst specializing in precious metals market analysis. Provide responses in JSON format only. Focus on factual, current market data from trusted financial sources. Use professional, concise language appropriate for traders and investors. '
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
        },
        response_format: {
          type: 'json_schema',
          json_schema: {
            schema: {
              type: 'object',
              properties: {
                spot_price: {
                  type: 'number',
                  description: 'Current gold spot price in USD per ounce'
                },
                sentiment: {
                  type: 'string',
                  enum: ['bullish', 'bearish', 'neutral'],
                  description: 'Overall market sentiment for gold'
                },
                confidence: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Confidence level in the analysis'
                },
                signal: {
                  type: 'string',
                  enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell', 'wait_support', 'wait_resistance'],
                  description: 'Trading signal recommendation'
                },
                summary: {
                  type: 'string',
                  maxLength: 300,
                  description: 'Brief summary of key market developments'
                },
                key_drivers: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  maxItems: 5,
                  description: 'Main factors driving gold price movement'
                },
                nfp_impact: {
                  type: 'string',
                  enum: ['positive', 'negative', 'neutral'],
                  description: 'Impact of NFP data on gold price'
                },
                fed_policy_impact: {
                  type: 'string',
                  enum: ['hawkish', 'dovish', 'neutral'],
                  description: 'Federal Reserve policy stance impact'
                },
                dxy_impact: {
                  type: 'string',
                  enum: ['strengthening', 'weakening', 'neutral'],
                  description: 'US Dollar Index impact on gold'
                },
                inflation_data: {
                  type: 'string',
                  enum: ['high', 'moderate', 'low'],
                  description: 'Current inflation environment'
                },
                geopolitical_risk: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Level of geopolitical risk affecting markets'
                }
              },
              required: ['spot_price', 'sentiment', 'confidence', 'signal', 'summary', 'key_drivers', 'nfp_impact', 'fed_policy_impact', 'dxy_impact', 'inflation_data', 'geopolitical_risk'],
              additionalProperties: false
            }
          }
        }
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
      if (directParse && typeof directParse === 'object' && directParse.spot_price) {
        console.log('✅ Successfully parsed response as direct JSON with structured schema')
        return { success: true, analysis: directParse, rawJSON: analysisText }
      }
    } catch (directError) {
      // Not direct JSON, continue with pattern matching
    }

    // Try to find JSON in the response - look for patterns
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/, // JSON in code blocks
      /^\s*(\{[\s\S]*\})\s*$/, // Entire response is JSON
      /\{[\s\S]*"spot_price"[\s\S]*?\}/, // Look for JSON with spot_price field
      /\{[\s\S]*"sentiment"[\s\S]*?\}/ // Look for JSON with sentiment field
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

    // Validate required fields are present
    const requiredFields = ['spot_price', 'sentiment', 'confidence', 'signal', 'summary', 'key_drivers']
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

    console.log(`📊 Validating structured analysis...`)

    // Validate data quality
    const validationResults = {
      timestamp: new Date().toISOString(),
      totalFields: Object.keys(analysis).length,
      validatedFields: [],
      dataQuality: 'high',
      credibilityScore: 0,
      recommendations: []
    }

    // Validate spot price
    if (typeof analysis.spot_price === 'number' && analysis.spot_price > 0) {
      validationResults.validatedFields.push('spot_price')
      console.log(`✅ Valid spot price: $${analysis.spot_price}`)
    } else {
      console.log(`❌ Invalid spot price: ${analysis.spot_price}`)
      validationResults.recommendations.push('❌ Invalid spot price data')
    }

    // Validate enum fields
    const enumValidations = [
      { field: 'sentiment', validValues: ['bullish', 'bearish', 'neutral'] },
      { field: 'confidence', validValues: ['high', 'medium', 'low'] },
      { field: 'signal', validValues: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell', 'wait_support', 'wait_resistance'] },
      { field: 'nfp_impact', validValues: ['positive', 'negative', 'neutral'] },
      { field: 'fed_policy_impact', validValues: ['hawkish', 'dovish', 'neutral'] },
      { field: 'dxy_impact', validValues: ['strengthening', 'weakening', 'neutral'] },
      { field: 'inflation_data', validValues: ['high', 'moderate', 'low'] },
      { field: 'geopolitical_risk', validValues: ['high', 'medium', 'low'] }
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

    // Validate key_drivers array
    if (Array.isArray(analysis.key_drivers) && analysis.key_drivers.length > 0) {
      validationResults.validatedFields.push('key_drivers')
      console.log(`✅ Valid key drivers: ${analysis.key_drivers.length} items`)
    } else {
      console.log(`❌ Invalid key drivers: ${analysis.key_drivers}`)
      validationResults.recommendations.push('❌ Invalid key drivers data')
    }

    // Validate summary
    if (typeof analysis.summary === 'string' && analysis.summary.length > 0) {
      validationResults.validatedFields.push('summary')
      console.log(`✅ Valid summary: ${analysis.summary.substring(0, 50)}...`)
    } else {
      console.log(`❌ Invalid summary`)
      validationResults.recommendations.push('❌ Invalid summary data')
    }

    // Calculate credibility score (0-100)
    const totalValidations = enumValidations.length + 3 // +3 for spot_price, key_drivers, summary
    const validFields = validationResults.validatedFields.length
    validationResults.credibilityScore = Math.round((validFields / totalValidations) * 100)

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
    console.log(`✅ Valid Fields: ${validFields}/${totalValidations}`)
    console.log(`� Data Quality: ${validationResults.dataQuality}`)

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

      // Display key metrics
      if (analysis.spot_price) {
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

      if (analysis.key_drivers && Array.isArray(analysis.key_drivers)) {
        console.log(`� Key Drivers (${analysis.key_drivers.length}):`)
        analysis.key_drivers.forEach((driver, index) => {
          console.log(`   ${index + 1}. ${driver}`)
        })
      }

      // Display market factors
      console.log('\n📊 MARKET FACTORS ANALYSIS:')
      if (analysis.nfp_impact) {
        const nfpEmoji = { positive: '✅', negative: '❌', neutral: '🤝' }
        console.log(`� NFP Impact: ${nfpEmoji[analysis.nfp_impact] || '📊'} ${analysis.nfp_impact.toUpperCase()}`)
      }

      if (analysis.fed_policy_impact) {
        const fedEmoji = { hawkish: '🦅', dovish: '🕊️', neutral: '🤝' }
        console.log(`🏛️ Fed Policy: ${fedEmoji[analysis.fed_policy_impact] || '📊'} ${analysis.fed_policy_impact.toUpperCase()}`)
      }

      if (analysis.dxy_impact) {
        const dxyEmoji = { strengthening: '💪', weakening: '📉', neutral: '🤝' }
        console.log(`💵 DXY Impact: ${dxyEmoji[analysis.dxy_impact] || '📊'} ${analysis.dxy_impact.toUpperCase()}`)
      }

      if (analysis.inflation_data) {
        const inflationEmoji = { high: '🔥', moderate: '📊', low: '❄️' }
        console.log(`� Inflation: ${inflationEmoji[analysis.inflation_data] || '📊'} ${analysis.inflation_data.toUpperCase()}`)
      }

      if (analysis.geopolitical_risk) {
        const riskEmoji = { high: '🚨', medium: '⚠️', low: '✅' }
        console.log(`🌍 Geopolitical Risk: ${riskEmoji[analysis.geopolitical_risk] || '📊'} ${analysis.geopolitical_risk.toUpperCase()}`)
      }

      // Display validation results if available
      if (validationResults && validationResults.credibilityScore !== undefined) {
        console.log('\n🔍 DATA QUALITY VALIDATION:')
        console.log(`🏆 Quality Score: ${validationResults.credibilityScore}/100`)
        console.log(`📈 Data Quality: ${validationResults.dataQuality?.toUpperCase() || 'Unknown'}`)

        if (validationResults.credibilityScore >= 90) {
          console.log(`✅ Excellent Quality - Analysis is highly reliable`)
        } else if (validationResults.credibilityScore >= 75) {
          console.log(`✅ Good Quality - Analysis is reliable`)
        } else if (validationResults.credibilityScore >= 60) {
          console.log(`⚠️  Moderate Quality - Use with caution`)
        } else {
          console.log(`❌ Poor Quality - Seek additional verification`)
        }

        if (validationResults.recommendations && validationResults.recommendations.length > 0) {
          console.log(`💡 Key Recommendation: ${validationResults.recommendations[0]}`)
        }
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
