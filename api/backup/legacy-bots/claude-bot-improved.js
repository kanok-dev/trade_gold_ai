import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory (two levels up from current location)
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Configuration
const CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_TOKENS: 8000,
  RATE_LIMIT_DELAY: 60000, // 1 minute for rate limits
  MODEL: 'claude-sonnet-4-20250514'
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function calculateDelay(attempt, isRateLimit = false) {
  if (isRateLimit) return CONFIG.RATE_LIMIT_DELAY
  return Math.min(CONFIG.BASE_DELAY * Math.pow(2, attempt - 1), 30000)
}

// Rate limiting and retry wrapper
async function callClaudeWithRetry(params, maxRetries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`)
      const response = await anthropic.beta.messages.create(params)
      console.log('✅ Request successful')
      return response
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message)

      if (error.status === 429) {
        console.log('🚫 Rate limit exceeded')
        if (attempt < maxRetries) {
          const waitTime = calculateDelay(attempt, true)
          console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`)
          await delay(waitTime)
          continue
        }
      } else if (error.status >= 500) {
        console.log('🔧 Server error, retrying...')
        if (attempt < maxRetries) {
          const waitTime = calculateDelay(attempt)
          console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`)
          await delay(waitTime)
          continue
        }
      }

      // Don't retry for client errors (4xx except 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw new Error(`Client error ${error.status}: ${error.message}`)
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`)
      }
    }
  }
}

// Optimized prompt for token efficiency
const optimizedPrompt = `
# GOLD MARKET ANALYSIS - LATEST 24 HOURS

## RESEARCH STRATEGY
Conduct targeted searches to gather comprehensive gold market intelligence from the past 24 hours. Use the minimum number of searches needed to provide thorough coverage.

## SEARCH SEQUENCE (3-8 searches recommended)

### Core Market Searches:
1. **Latest Gold News**: Search "gold price news today" - Focus on major developments
2. **Technical Analysis**: Search "gold technical analysis today" - Current chart patterns and levels
3. **Economic Drivers**: Search "Fed inflation data gold" - Macro economic impacts
4. **Institutional Activity**: Search "gold ETF flows central bank" - Major player movements

### Additional Searches (if needed):
5. **Geopolitical Factors**: Search "geopolitical events gold safe haven" - Risk-on/risk-off sentiment
6. **Currency Impact**: Search "USD gold correlation today" - Dollar strength/weakness effects
7. **Supply/Demand**: Search "gold demand production latest" - Fundamental supply/demand factors
8. **Market Sentiment**: Search "gold futures trading volume" - Market participation and positioning

## SEARCH GUIDELINES
- **Keep queries concise** (1-4 words maximum)
- **Search progressively** - start broad, then narrow if needed
- **Never repeat similar queries** - make each search unique
- **Prioritize recent content** - focus on last 24-48 hours
- **Stop searching** when sufficient information is gathered

## ANALYSIS REQUIREMENTS

### Content Standards:
- **Verify timestamps** - ensure news is actually from last 24 hours
- **Cross-reference sources** - confirm information across multiple outlets
- **Cite all claims** - use proper  tags for every factual statement
- **Quote sparingly** - maximum one short quote (<15 words) in quotation marks


## QUALITY CONTROL
- **Source Priority**: Reuters > Bloomberg > Financial Times > MarketWatch > TradingView
- **Fact Verification**: Cross-check price data with multiple sources
- **Recency Check**: Confirm all news items are actually from past 24 hours
- **Copyright Compliance**: Never reproduce large text blocks, use short quotes only

## OUTPUT FORMAT
- **Please provide a JSON-structured analysis with:
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

- **Make sure the JSON is valid and properly formatted at the end of your response.
`

// Extract structured JSON analysis from Claude's response
function extractAnalysisJson(response) {
  try {
    // Find the content with the JSON analysis
    const content = response.content || []
    let jsonText = ''

    // Look for JSON content in Claude's response
    for (const item of content) {
      if (item.type === 'text' && item.text) {
        const text = item.text

        // Look for JSON block patterns
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"timestamp"[\s\S]*\}/) || text.match(/\{[\s\S]*"priceData"[\s\S]*\}/)

        if (jsonMatch) {
          jsonText = jsonMatch[1] || jsonMatch[0]
          break
        }
      }
    }

    // If no JSON found in formatted blocks, try to extract from text
    if (!jsonText) {
      const fullText = content
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join(' ')

      // Try to find JSON object in the text
      const startIndex = fullText.indexOf('{"timestamp"') || fullText.indexOf('{\n  "timestamp"')
      if (startIndex !== -1) {
        const endIndex = fullText.lastIndexOf('}') + 1
        jsonText = fullText.substring(startIndex, endIndex)
      }
    }

    // Clean and parse JSON
    if (jsonText) {
      // Remove any markdown formatting
      jsonText = jsonText.replace(/```json|```/g, '').trim()

      // Try to parse the JSON
      try {
        return JSON.parse(jsonText)
      } catch (parseError) {
        console.warn('⚠️ Could not parse extracted JSON:', parseError.message)
        return createFallbackAnalysis(response)
      }
    }

    return createFallbackAnalysis(response)
  } catch (error) {
    console.error('❌ Error extracting JSON analysis:', error.message)
    return createFallbackAnalysis(response)
  }
}

// Create fallback analysis structure when JSON extraction fails
function createFallbackAnalysis(response) {
  const timestamp = new Date().toISOString()

  return {
    timestamp,
    priceData: {
      spotPrice: null,
      change24h: null,
      changePercent24h: null,
      lastUpdated: timestamp.split('T')[1].substring(0, 5) + ' UTC',
      sources: []
    },
    news24h: [],
    sentiment: 'neutral',
    confidence: 'low',
    signal: 'hold',
    keyFactors: ['Analysis extraction failed'],
    fedImpact: 'Unable to extract Fed impact analysis',
    technicalView: {
      trend: 'neutral',
      supportLevels: [],
      resistanceLevels: [],
      rsi: null,
      keyLevels: 'Analysis not available'
    },
    riskLevel: 'high',
    timeHorizon: 'unknown',
    summary: 'Failed to extract structured analysis from response',
    error: 'JSON extraction failed',
    raw_content: response.content
  }
}

// Main execution
async function runAnalysis() {
  try {
    console.log('🚀 Starting Gold Analysis...')

    const params = {
      model: CONFIG.MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: 0.7,
      system: 'คุณคือผู้เชี่ยวชาญวิเคราะห์ทองคำ ให้ข้อมูลแม่นยำและกระชับ',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: optimizedPrompt }]
        }
      ],
      tools: [
        {
          name: 'web_search',
          type: 'web_search_20250305'
        }
      ],
      betas: ['web-search-2025-03-05']
    }

    const response = await callClaudeWithRetry(params)

    // Extract JSON analysis from Claude's response
    const analysisJson = extractAnalysisJson(response)

    // Save results with structured analysis
    const results = {
      timestamp: new Date().toISOString(),
      analysis: analysisJson,
      status: 'success',
      token_usage: {
        input_tokens: response.usage?.input_tokens || 'N/A',
        output_tokens: response.usage?.output_tokens || 'N/A'
      },
      raw_response: response // Keep raw response for debugging
    }

    await saveResults(results)
    console.log('📊 Analysis complete!')
    console.log('📈 Gold Market Analysis:')
    console.log(JSON.stringify(analysisJson, null, 2))

    return results
  } catch (error) {
    console.error('💥 Analysis failed:', error.message)

    const errorResults = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    }

    await saveResults(errorResults)
    throw error
  }
}

async function saveResults(results) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const dataDir = path.join(__dirname, '../../data')

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Save full results (with raw response for debugging)
    const fullFilename = `claude-analysis-full-${timestamp}.json`
    const fullPath = path.join(dataDir, fullFilename)
    fs.writeFileSync(fullPath, JSON.stringify(results, null, 2))
    console.log(`💾 Full results saved to: ${fullPath}`)

    // Save clean analysis JSON only
    const analysisFilename = `claude-analysis-${timestamp}.json`
    const analysisPath = path.join(dataDir, analysisFilename)
    fs.writeFileSync(analysisPath, JSON.stringify(results.analysis, null, 2))
    console.log(`📊 Clean analysis saved to: ${analysisPath}`)

    // Also save as latest files
    const latestFullPath = path.join(dataDir, 'latest_claude_analysis_full.json')
    const latestAnalysisPath = path.join(dataDir, 'latest_claude_analysis.json')

    fs.writeFileSync(latestFullPath, JSON.stringify(results, null, 2))
    fs.writeFileSync(latestAnalysisPath, JSON.stringify(results.analysis, null, 2))

    console.log(`📈 Latest clean analysis: ${latestAnalysisPath}`)
  } catch (saveError) {
    console.error('❌ Error saving results:', saveError.message)
  }
}

// Run the analysis
runAnalysis().catch(console.error)
