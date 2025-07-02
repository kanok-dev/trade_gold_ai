import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Perplexity API configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

// Enhanced Configuration Options for Sonar integration
const CONFIG = {
  PRICE_ALERT_THRESHOLD: 50, // Alert if price moves more than $50
  VOLUME_SPIKE_THRESHOLD: 1.5, // Alert if volume is 1.5x average
  VOLATILITY_THRESHOLD: 2.0, // Alert if 24h change > 2%
  SAVE_HISTORICAL_DATA: true,
  AUTO_GENERATE_ALERTS: true,
  MULTI_TIMEFRAME_ANALYSIS: true
}

let openai = null
let perplexity = null

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
} catch (error) {
  console.log('⚠️  OpenAI client initialization failed, will use fallback merge')
}

// Check Perplexity API availability
if (PERPLEXITY_API_KEY) {
  perplexity = { available: true, apiKey: PERPLEXITY_API_KEY }
  console.log('✅ Perplexity Sonar API available')
} else {
  console.log('⚠️  Perplexity API key not found, Sonar analysis will be skipped')
}

/**
 * OpenAI-powered Analysis Merger Bot
 * Merges Claude and OpenAI analysis data into unified format using AI reasoning
 */
class OpenAIAnalysisMerger {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data')
    this.outputFile = path.join(this.dataDir, 'unified_analysis.json')
    this.claudeFile = path.join(this.dataDir, 'latest_claude_analysis.json')
    this.openaiFile = path.join(this.dataDir, 'latest_openai_analysis.json')
    this.sonarFile = path.join(this.dataDir, 'latest_sonar_analysis.json')
  }

  /**
   * Load analysis data from files
   */
  async loadAnalysisData() {
    try {
      let claudeData = null
      let openaiData = null
      let sonarData = null

      // Load Claude analysis if exists
      if (fs.existsSync(this.claudeFile)) {
        const claudeRaw = await fs.promises.readFile(this.claudeFile, 'utf8')
        claudeData = JSON.parse(claudeRaw)
        console.log('✅ Claude analysis data loaded')
      }

      // Load OpenAI analysis if exists
      if (fs.existsSync(this.openaiFile)) {
        const openaiRaw = await fs.promises.readFile(this.openaiFile, 'utf8')
        openaiData = JSON.parse(openaiRaw)
        console.log('✅ OpenAI analysis data loaded')
      }

      // Load Sonar analysis if exists
      if (fs.existsSync(this.sonarFile)) {
        const sonarRaw = await fs.promises.readFile(this.sonarFile, 'utf8')
        sonarData = JSON.parse(sonarRaw)
        console.log('✅ Sonar analysis data loaded')
      }

      return { claudeData, openaiData, sonarData }
    } catch (error) {
      console.error('❌ Error loading analysis data:', error.message)
      return { claudeData: null, openaiData: null, sonarData: null }
    }
  }

  /**
   * Use OpenAI to intelligently merge analysis data
   */
  async mergeWithAI(claudeData, openaiData, sonarData) {
    if (!openai) {
      throw new Error('OpenAI client not available')
    }
    const prompt = `
You are an expert financial analyst tasked with merging gold market analysis data from multiple AI sources into a unified format.

IMPORTANT: All text content in the output must be in Thai language (ภาษาไทย). Use proper Thai financial terminology.

TASK: Merge the following analysis data into the exact JSON structure provided below. Use intelligent reasoning to:
1. Reconcile price differences by averaging or selecting most recent/reliable data
2. Combine technical indicators intelligently
3. Merge news highlights without duplication
4. Create consensus recommendations from all sources
5. Fill in missing data where possible

CLAUDE ANALYSIS DATA:
${claudeData ? JSON.stringify(claudeData, null, 2) : 'null'}

OPENAI ANALYSIS DATA:
${openaiData ? JSON.stringify(openaiData, null, 2) : 'null'}

SONAR ANALYSIS DATA (MOST RECENT):
${sonarData ? JSON.stringify(sonarData, null, 2) : 'null'}

OUTPUT FORMAT (copy this exact structure and fill with merged data):
{
  "timestamp": "ISO_DATETIME_NOW",
  "data_freshness_minutes": CALCULATE_MINUTES_FROM_MOST_RECENT_SOURCE,
  "source": "merged_ai" | "claude_only" | "openai_only" | "sonar_only" | "claude_openai" | "claude_sonar" | "openai_sonar",
  "unified_analysis": {
    "spot_price": NUMBER_OR_NULL,
    "price_change": {
      "daily_pct": NUMBER_OR_NULL,
      "weekly_pct": NUMBER_OR_NULL,
      "monthly_pct": NUMBER_OR_NULL
    },
    "technical_indicators": {
      "rsi_14": NUMBER_OR_NULL,
      "atr_14": NUMBER_OR_NULL,
      "supports": [ARRAY_OF_NUMBERS],
      "resistances": [ARRAY_OF_NUMBERS],
      "trend": "bullish|bearish|neutral|null",
      "momentum": "positive|negative|neutral|null"
    },
    "signals": {
      "short_term": "buy|sell|hold|null",
      "medium_term": "buy|sell|hold|null",
      "long_term": "buy|sell|hold|null"
    },
    "market_sentiment": {
      "overall": "bullish|bearish|neutral|null",
      "summary": "STRING_IN_THAI_OR_NULL",
      "confidence": "high|medium|low|null"
    },
    "news_highlights": [
      {
        "headline": "STRING_IN_THAI",
        "source": "STRING_IN_THAI",
        "sentiment": "bullish|bearish|neutral",
        "impact": "high|medium|low",
        "category": "STRING_IN_THAI"
      }
    ],
    "forecast_scenarios": {
      "short": "STRING_IN_THAI_OR_NULL",
      "medium": "STRING_IN_THAI_OR_NULL",
      "long": "STRING_IN_THAI_OR_NULL"
    },
    "key_events": [
      {
        "date": "DATE_STRING",
        "event": "STRING_IN_THAI",
        "impact": "high|medium|low"
      }
    ],
    "risk_factors": ["ARRAY_OF_STRINGS_IN_THAI"],
    "final_decision": {
      "action": "buy|sell|hold|null",
      "confidence": NUMBER_0_TO_100_OR_NULL,
      "reasoning": "STRING_IN_THAI_OR_NULL",
      "consensus": "strong|moderate|weak|split|null",
      "entryPoint": NUMBER_OR_NULL,
      "stopLoss": NUMBER_OR_NULL,
      "takeProfit": [
        NUMBER_OR_NULL,
        NUMBER_OR_NULL
      ]
    }
  },
  "metadata": {
    "bot_version": "openai_merger_v2.0_with_sonar",
    "data_source": "claude_openai_sonar_merged",
    "format_version": "3.0",
    "processing_time": "CURRENT_TIMESTAMP",
    "token_usage": null
  }
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no other text
- Use current timestamp in ISO format
- Calculate data freshness from most recent source timestamp
- Set source field based on available data sources
- Prioritize more recent data when merging conflicting information
- Combine news highlights without duplication (check headlines for similarity)
- Create intelligent consensus for final decision from all available sources
- Fill null values only when data is not available or cannot be reasonably inferred
- ALL TEXT CONTENT (summary, headlines, reasoning, events, risk_factors, etc.) MUST BE IN THAI LANGUAGE
- Use proper Thai financial and market terminology
- Maintain professional tone in Thai language
`

    try {
      console.log('🤖 Using OpenAI to merge analysis data...')

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })

      // Clean the response to extract JSON
      let responseText = response.choices[0].message.content

      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '')

      // Trim whitespace
      responseText = responseText.trim()

      const mergedData = JSON.parse(responseText)
      console.log('✅ AI merge completed successfully')

      return mergedData
    } catch (error) {
      console.error('❌ Error during AI merge:', error.message)
      throw error
    }
  }

  /**
   * Fallback merger using rule-based logic with Thai language support
   */
  createFallbackMerge(claudeData, openaiData, sonarData) {
    const now = new Date().toISOString()

    // Determine source
    let source = 'merged_ai'
    const availableSources = []
    if (claudeData) availableSources.push('claude')
    if (openaiData) availableSources.push('openai')
    if (sonarData) availableSources.push('sonar')

    if (availableSources.length === 0) source = 'no_data'
    else if (availableSources.length === 1) source = availableSources[0] + '_only'
    else source = availableSources.join('_')

    // Extract Sonar analysis if available
    let sonarAnalysis = null
    if (sonarData?.response?.choices?.[0]?.message?.content) {
      try {
        const sonarContent = sonarData.response.choices[0].message.content
        const jsonMatch = sonarContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          sonarAnalysis = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.log('⚠️  Could not parse Sonar JSON, using raw data')
      }
    }

    // Thai language mappings for common terms
    const translateToThai = (englishText) => {
      if (!englishText) return null

      const translations = {
        bullish: 'เป็นบวก',
        bearish: 'เป็นลบ',
        neutral: 'เป็นกลาง',
        buy: 'ซื้อ',
        sell: 'ขาย',
        hold: 'ถือ',
        strong_buy: 'ซื้อแรง',
        strong_sell: 'ขายแรง',
        high: 'สูง',
        medium: 'ปานกลาง',
        low: 'ต่ำ',
        positive: 'เชิงบวก',
        negative: 'เชิงลบ'
      }

      let result = englishText.toString()
      Object.entries(translations).forEach(([eng, thai]) => {
        result = result.replace(new RegExp(eng, 'gi'), thai)
      })
      return result
    }

    // Prioritize Sonar data for fresh information, then other sources
    const getFirstAvailable = (...values) => {
      for (const value of values) {
        if (value !== null && value !== undefined) return value
      }
      return null
    }

    // Basic merge logic with Thai translations and Sonar priority
    const merged = {
      timestamp: now,
      data_freshness_minutes: 0,
      source: source,
      unified_analysis: {
        spot_price: getFirstAvailable(sonarAnalysis?.priceData?.spotPrice, claudeData?.priceData?.spotPrice, openaiData?.priceData?.spotPrice),
        price_change: {
          daily_pct: getFirstAvailable(sonarAnalysis?.priceData?.changePercent24h, claudeData?.priceData?.changePercent24h, openaiData?.priceData?.changePercent24h),
          weekly_pct: getFirstAvailable(sonarAnalysis?.priceData?.changeWeekly, claudeData?.priceData?.changeWeekly, openaiData?.priceData?.changeWeekly),
          monthly_pct: null
        },
        technical_indicators: {
          rsi_14: getFirstAvailable(sonarAnalysis?.technicalView?.rsi, claudeData?.technicalView?.rsi, openaiData?.technicalView?.rsi),
          atr_14: null,
          supports: getFirstAvailable(sonarAnalysis?.technicalView?.supportLevels, claudeData?.technicalView?.supportLevels, openaiData?.technicalView?.supportLevels) || [],
          resistances: getFirstAvailable(sonarAnalysis?.technicalView?.resistanceLevels, claudeData?.technicalView?.resistanceLevels, openaiData?.technicalView?.resistanceLevels) || [],
          trend: translateToThai(getFirstAvailable(sonarAnalysis?.technicalView?.trend, claudeData?.technicalView?.trend, openaiData?.technicalView?.trend)),
          momentum: null
        },
        signals: {
          short_term: translateToThai(getFirstAvailable(sonarAnalysis?.signal, claudeData?.signal, openaiData?.signal)),
          medium_term: null,
          long_term: null
        },
        market_sentiment: {
          overall: translateToThai(getFirstAvailable(sonarAnalysis?.sentiment, claudeData?.sentiment, openaiData?.sentiment)),
          summary: translateToThai(getFirstAvailable(sonarAnalysis?.summary, claudeData?.summary, openaiData?.summary)) || 'ไม่มีข้อมูลการวิเคราะห์โดยละเอียด',
          confidence: translateToThai(getFirstAvailable(sonarAnalysis?.confidence, claudeData?.confidence, openaiData?.confidence))
        },
        news_highlights: [...(sonarAnalysis?.news24h || []), ...(claudeData?.news24h || []), ...(openaiData?.news24h || [])].slice(0, 10).map((news) => ({
          ...news,
          headline: translateToThai(news.headline) || news.headline,
          source: translateToThai(news.source) || news.source,
          category: translateToThai(news.category) || news.category
        })),
        forecast_scenarios: {
          short: translateToThai(getFirstAvailable(sonarAnalysis?.priceTarget, claudeData?.priceTarget, openaiData?.priceTarget)),
          medium: null,
          long: null
        },
        key_events: [],
        risk_factors: [...(sonarAnalysis?.keyFactors || []), ...(claudeData?.keyFactors || []), ...(openaiData?.keyFactors || [])].slice(0, 8).map((factor) => translateToThai(factor) || factor),
        final_decision: {
          action: translateToThai(getFirstAvailable(sonarAnalysis?.signal, claudeData?.signal, openaiData?.signal)),
          confidence: getFirstAvailable(
            sonarAnalysis?.confidence === 'high' ? 85 : sonarAnalysis?.confidence === 'medium' ? 70 : sonarAnalysis?.confidence === 'low' ? 45 : null,
            claudeData?.confidence === 'high' ? 80 : claudeData?.confidence === 'medium' ? 65 : claudeData?.confidence === 'low' ? 40 : null,
            openaiData?.confidence === 'high' ? 75 : openaiData?.confidence === 'medium' ? 60 : openaiData?.confidence === 'low' ? 35 : null
          ),
          reasoning: translateToThai(getFirstAvailable(sonarAnalysis?.summary, claudeData?.summary, openaiData?.summary)) || 'ไม่มีข้อมูลการวิเคราะห์',
          consensus: availableSources.length > 1 ? 'moderate' : 'single_source',
          entryPoint: getFirstAvailable(sonarAnalysis?.entryPoint, claudeData?.entryPoint, openaiData?.entryPoint),
          stopLoss: getFirstAvailable(sonarAnalysis?.stopLoss, claudeData?.stopLoss, openaiData?.stopLoss),
          takeProfit: getFirstAvailable(sonarAnalysis?.takeProfit, claudeData?.takeProfit, openaiData?.takeProfit) || [null, null]
        }
      },
      metadata: {
        bot_version: 'openai_merger_v2.0_with_sonar',
        data_source: 'fallback_merge_with_sonar',
        format_version: '3.0',
        processing_time: now,
        token_usage: null,
        sources_used: availableSources
      }
    }

    return merged
  }

  /**
   * Save merged analysis to unified file
   */
  async saveMergedAnalysis(mergedData) {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        await fs.promises.mkdir(this.dataDir, { recursive: true })
      }

      // Save to unified analysis file
      await fs.promises.writeFile(this.outputFile, JSON.stringify(mergedData, null, 2), 'utf8')

      console.log('✅ Merged analysis saved to:', this.outputFile)
      return true
    } catch (error) {
      console.error('❌ Error saving merged analysis:', error.message)
      return false
    }
  }

  /**
   * Perform Perplexity Sonar analysis to get fresh market data
   */
  async performSonarAnalysis() {
    if (!perplexity?.available) {
      console.log('⚠️  Perplexity Sonar not available, skipping fresh analysis')
      return null
    }

    try {
      console.log('🚀 Starting Perplexity Sonar analysis for fresh data...')

      // Get current date for dynamic searching
      const currentDate = new Date()
      const todayDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
- Every news item must have complete URL and timestamp`
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
          temperature: 0.1,
          max_tokens: 6000,
          stream: false,
          search_domain_filter: ['bloomberg.com', 'reuters.com', 'tradingview.com', 'marketwatch.com', 'cnbc.com', 'ft.com', 'wsj.com', 'finance.yahoo.com'],
          search_recency_filter: 'day',
          return_citations: true,
          return_images: false,
          search_context_size: 'high'
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

      // Save Sonar results
      const sonarResults = {
        timestamp: new Date().toISOString(),
        response: data,
        status: 'success',
        model: 'sonar',
        provider: 'perplexity',
        analysis_type: 'enhanced_gold_market'
      }

      // Save to latest sonar file for future use
      await fs.promises.writeFile(this.sonarFile, JSON.stringify(sonarResults, null, 2), 'utf8')
      console.log('✅ Sonar analysis completed and saved')

      return sonarResults
    } catch (error) {
      console.error('❌ Error performing Sonar analysis:', error.message)

      // Save error results
      const errorResults = {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: 'failed',
        model: 'sonar',
        provider: 'perplexity'
      }

      await fs.promises.writeFile(this.sonarFile, JSON.stringify(errorResults, null, 2), 'utf8')
      return null
    }
  }

  /**
   * Extract and validate JSON from analysis text (from Sonar bot)
   */
  extractAndValidateJSON(analysisText) {
    try {
      // Try to find JSON in the response - look for patterns
      const jsonPatterns = [/```json\s*(\{[\s\S]*?\})\s*```/, /^\s*(\{[\s\S]*\})\s*$/, /\{[\s\S]*"timestamp"[\s\S]*?\}/, /\{[\s\S]*"priceData"[\s\S]*?\}/]

      let analysis = null
      let jsonText = null

      // Try each pattern
      for (const pattern of jsonPatterns) {
        const match = analysisText.match(pattern)
        if (match) {
          try {
            jsonText = match[1] || match[0]
            analysis = JSON.parse(jsonText)
            if (analysis && typeof analysis === 'object') {
              break
            }
          } catch (parseError) {
            continue
          }
        }
      }

      return { success: !!analysis, analysis, rawJSON: jsonText }
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

  /**
   * Validate news credibility from Sonar analysis
   */
  async validateNewsCredibility(analysisText) {
    try {
      console.log('\n🔍 VALIDATING NEWS CREDIBILITY...')
      console.log('='.repeat(40))

      const extractionResult = this.extractAndValidateJSON(analysisText)

      if (!extractionResult.success || !extractionResult.analysis) {
        return {
          validated: false,
          reason: 'Could not extract valid JSON from analysis',
          credibilityScore: 0,
          timestamp: new Date().toISOString()
        }
      }

      const analysis = extractionResult.analysis
      const newsItems = analysis.news24h || []

      if (newsItems.length === 0) {
        return {
          validated: true,
          reason: 'No news items to validate',
          credibilityScore: 100,
          timestamp: new Date().toISOString(),
          totalItems: 0
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

      const now = new Date()

      for (let i = 0; i < newsItems.length; i++) {
        const item = newsItems[i]
        const validation = {
          index: i,
          headline: item.headline || 'No headline',
          source: item.source || 'Unknown',
          url: item.originalUrl || 'No URL',
          isTrustedSource: false,
          hasValidUrl: false,
          isRecent: false,
          credibilityIssues: []
        }

        // Check source credibility
        const sourceText = item.source?.toLowerCase() || ''
        validation.isTrustedSource = trustedSources.some((trusted) => sourceText.includes(trusted.toLowerCase()))

        if (validation.isTrustedSource) {
          validationResults.trustedSources++
        } else {
          validationResults.untrustedSources++
          validation.credibilityIssues.push(`❌ Untrusted source: ${item.source}`)
        }

        // Check URL validity
        if (item.originalUrl && item.originalUrl.startsWith('http')) {
          validation.hasValidUrl = true
        } else {
          validationResults.missingUrls++
          validation.credibilityIssues.push('❌ Missing or invalid URL')
        }

        // Check recency (within last 24 hours)
        if (item.timePublished) {
          try {
            const publishDate = new Date(item.timePublished)
            const hoursDiff = (now - publishDate) / (1000 * 60 * 60)
            validation.isRecent = hoursDiff <= 24

            if (validation.isRecent) {
              validationResults.recentNews++
            } else {
              validationResults.outdatedNews++
              validation.credibilityIssues.push(`⏰ News older than 24h: ${item.timePublished}`)
            }
          } catch (dateError) {
            validation.credibilityIssues.push('❌ Invalid date format')
          }
        } else {
          validation.credibilityIssues.push('❌ Missing publish time')
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
        validationResults.recommendations.push(`⚠️  ${validationResults.untrustedSources} news items from untrusted sources`)
      }

      if (validationResults.missingUrls > 0) {
        validationResults.recommendations.push(`⚠️  ${validationResults.missingUrls} news items missing valid URLs`)
      }

      if (validationResults.outdatedNews > 0) {
        validationResults.recommendations.push(`⚠️  ${validationResults.outdatedNews} news items older than 24 hours`)
      }

      if (validationResults.credibilityScore >= 80) {
        validationResults.recommendations.push('✅ High credibility - news sources are reliable and recent')
      } else if (validationResults.credibilityScore >= 60) {
        validationResults.recommendations.push('⚠️  Medium credibility - verify important claims')
      } else {
        validationResults.recommendations.push('❌ Low credibility - manual verification strongly recommended')
      }

      console.log(`📊 CREDIBILITY VALIDATION RESULTS:`)
      console.log(`🏆 Credibility Score: ${validationResults.credibilityScore}/100`)
      console.log(`✅ Trusted Sources: ${validationResults.trustedSources}/${validationResults.totalItems}`)
      console.log(`🔗 Valid URLs: ${validationResults.totalItems - validationResults.missingUrls}/${validationResults.totalItems}`)
      console.log(`📅 Recent News: ${validationResults.recentNews}/${validationResults.totalItems}`)

      return validationResults
    } catch (error) {
      console.error('❌ Error validating news credibility:', error.message)
      return {
        validated: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        credibilityScore: 0,
        recommendations: ['❌ Validation failed - manual verification required']
      }
    }
  }

  /**
   * Main execution method
   */
  async execute() {
    console.log('🚀 Starting Enhanced OpenAI Analysis Merger Bot with Sonar Integration...')
    console.log('========================================================================')

    try {
      // Step 1: Load existing analysis data
      const { claudeData, openaiData, sonarData } = await this.loadAnalysisData()

      if (!claudeData && !openaiData && !sonarData) {
        console.log('⚠️  No analysis data found to merge')
        return false
      }

      let mergedData
      let validationResults = null

      try {
        // Try AI-powered merge first
        mergedData = await this.mergeWithAI(claudeData, openaiData, sonarData)
        console.log('✅ AI-powered merge completed successfully')

        // Validate news credibility if Sonar data is available
        if (sonarData?.response?.choices?.[0]?.message?.content) {
          console.log('\n🔍 Validating Sonar news credibility...')
          validationResults = await this.validateNewsCredibility(sonarData.response.choices[0].message.content)
        }
      } catch (aiError) {
        console.log('⚠️  AI merge failed:', aiError.message)
        console.log('⚠️  Using fallback merge...')
        mergedData = this.createFallbackMerge(claudeData, openaiData, sonarData)
      }

      // Add validation results to metadata if available
      if (validationResults) {
        mergedData.metadata.news_validation = validationResults
        mergedData.metadata.credibility_score = validationResults.credibilityScore
      }

      // Save merged result
      const saved = await this.saveMergedAnalysis(mergedData)

      if (saved) {
        console.log('🎉 Enhanced analysis merge completed successfully!')

        // Display summary
        const analysis = mergedData.unified_analysis
        console.log('\n📊 ENHANCED MERGED ANALYSIS SUMMARY / สรุปการวิเคราะห์รวมขั้นสูง')
        console.log('='.repeat(60))
        console.log(`💰 Spot Price / ราคาทองคำ: $${analysis.spot_price || 'N/A'}`)
        console.log(`📈 Daily Change / การเปลี่ยนแปลงรายวัน: ${analysis.price_change.daily_pct || 'N/A'}%`)
        console.log(`� Weekly Change / การเปลี่ยนแปลงรายสัปดาห์: ${analysis.price_change.weekly_pct || 'N/A'}%`)
        console.log(`�🔍 Trend / แนวโน้ม: ${analysis.technical_indicators.trend || 'N/A'}`)
        console.log(`📡 Signal / สัญญาณ: ${analysis.signals.short_term || 'N/A'}`)
        console.log(`😊 Sentiment / ความรู้สึกตลาด: ${analysis.market_sentiment.overall || 'N/A'}`)
        console.log(`🎯 Action / การดำเนินการ: ${analysis.final_decision.action || 'N/A'}`)
        console.log(`🎯 Entry Point / จุดเข้า: ${analysis.final_decision.entryPoint ?? 'N/A'}`)
        console.log(`🛑 Stop Loss / จุดตัดขาดทุน: ${analysis.final_decision.stopLoss ?? 'N/A'}`)
        console.log(`🏁 Take Profit / จุดทำกำไร: ${Array.isArray(analysis.final_decision.takeProfit) ? analysis.final_decision.takeProfit.filter((x) => x != null).join(', ') : analysis.final_decision.takeProfit ?? 'N/A'}`)
        console.log(`📰 News Items / ข่าวสาร: ${analysis.news_highlights.length}`)
        console.log(`⚠️  Risk Factors / ปัจจัยเสี่ยง: ${analysis.risk_factors.length}`)
        console.log(`🔧 RSI: ${analysis.technical_indicators.rsi_14 ?? 'N/A'}`)
        console.log(`📊 Support Levels / แนวรับ: ${analysis.technical_indicators.supports.length > 0 ? analysis.technical_indicators.supports.join(', ') : 'N/A'}`)
        console.log(`📊 Resistance Levels / แนวต้าน: ${analysis.technical_indicators.resistances.length > 0 ? analysis.technical_indicators.resistances.join(', ') : 'N/A'}`)

        if (validationResults) {
          console.log(`\n🔍 NEWS CREDIBILITY / ความน่าเชื่อถือของข่าว`)
          console.log(`🏆 Credibility Score / คะแนนความน่าเชื่อถือ: ${validationResults.credibilityScore}/100`)
          console.log(`✅ Trusted Sources / แหล่งที่เชื่อถือได้: ${validationResults.trustedSources}/${validationResults.totalItems}`)
          console.log(`📅 Recent News / ข่าวล่าสุด: ${validationResults.recentNews}/${validationResults.totalItems}`)
        }

        console.log(`\n📋 Data Sources Used / แหล่งข้อมูลที่ใช้: ${mergedData.source}`)
        console.log(`⚙️  Bot Version / เวอร์ชันบอท: ${mergedData.metadata.bot_version}`)
        console.log('='.repeat(60))

        return true
      }

      return false
    } catch (error) {
      console.error('❌ Fatal error in enhanced merger bot:', error.message)
      return false
    }
  }
}

// Helper function to load analysis data (made global for fallback)
async function loadAnalysisData() {
  const merger = new OpenAIAnalysisMerger()
  return await merger.loadAnalysisData()
}

/**
 * Generate trading alerts based on merged analysis (from Sonar bot)
 */
function generateTradingAlerts(mergedData) {
  try {
    console.log('\n🚨 AUTOMATED TRADING ALERTS:')
    console.log('='.repeat(40))

    const analysis = mergedData.unified_analysis

    // Price movement alerts
    if (analysis.price_change?.daily_pct) {
      const dailyChange = Math.abs(parseFloat(analysis.price_change.daily_pct))
      if (dailyChange >= CONFIG.VOLATILITY_THRESHOLD) {
        console.log(`🚨 HIGH VOLATILITY ALERT: Gold moved ${analysis.price_change.daily_pct}% in 24h`)
      }
    }

    // Technical signal alerts
    if (analysis.signals?.short_term) {
      const signal = analysis.signals.short_term.toLowerCase()
      if (signal.includes('ซื้อ') || signal.includes('buy')) {
        console.log(`📈 BUY SIGNAL DETECTED: ${analysis.signals.short_term}`)
      } else if (signal.includes('ขาย') || signal.includes('sell')) {
        console.log(`📉 SELL SIGNAL DETECTED: ${analysis.signals.short_term}`)
      }
    }

    // News sentiment alert
    if (analysis.news_highlights && analysis.news_highlights.length > 0) {
      const highImpactNews = analysis.news_highlights.filter((news) => news.impact === 'high')
      if (highImpactNews.length > 0) {
        console.log(`📰 HIGH IMPACT NEWS ALERT: ${highImpactNews.length} important news items detected`)
      }
    }

    // RSI alerts
    if (analysis.technical_indicators?.rsi_14) {
      const rsi = parseFloat(analysis.technical_indicators.rsi_14)
      if (rsi >= 70) {
        console.log(`⚠️  OVERBOUGHT ALERT: RSI at ${rsi} (≥70)`)
      } else if (rsi <= 30) {
        console.log(`⚠️  OVERSOLD ALERT: RSI at ${rsi} (≤30)`)
      }
    }

    console.log('='.repeat(40))
  } catch (error) {
    console.log('⚠️  Alert generation failed - manual review recommended')
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const merger = new OpenAIAnalysisMerger()
  merger.execute().then((success) => {
    if (success) {
      console.log('\n✅ Enhanced Bot execution completed successfully')

      // Generate trading alerts if enabled
      if (CONFIG.AUTO_GENERATE_ALERTS) {
        try {
          const unifiedData = JSON.parse(fs.readFileSync(merger.outputFile, 'utf8'))
          generateTradingAlerts(unifiedData)
        } catch (alertError) {
          console.log('⚠️  Could not generate alerts:', alertError.message)
        }
      }
    } else {
      console.log('\n❌ Enhanced Bot execution failed')
    }
    process.exit(success ? 0 : 1)
  })
}

export default OpenAIAnalysisMerger
export { generateTradingAlerts, CONFIG }
