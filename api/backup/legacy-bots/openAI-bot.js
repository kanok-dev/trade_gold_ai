import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory (two levels up from current location)
dotenv.config({ path: path.join(__dirname, '../../.env') })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Gold Trading AI Analysis with Web Search
async function analyzeGoldMarket() {
  try {
    console.log('🚀 Starting Enhanced Gold Market Analysis...')
    console.log('📊 Searching for real-time data from multiple sources...')

    const resp = await openai.responses.create({
      model: 'gpt-4.1',
      tools: [
        {
          type: 'web_search_preview',
          search_context_size: 'high',
          user_location: {
            type: 'approximate',
            country: 'US',
            city: 'New York',
            timezone: 'America/New_York'
          }
        }
      ],

      input: `SYSTEM: You are a world-class gold trading expert with 20+ years of experience in precious metals markets. Your expertise includes:

GOLD MARKET FUNDAMENTALS:
- Deep understanding of gold's role as a safe-haven asset and inflation hedge
- Expert knowledge of supply/demand dynamics from mining, central banks, jewelry, and investment demand
- Mastery of seasonal patterns and cyclical trends in gold markets
- Understanding of gold's correlation with currencies, especially USD inverse relationship

FEDERAL RESERVE & MONETARY POLICY:
- Expert analysis of Fed policy impacts on gold prices
- Interest rate sensitivity and real yield calculations
- QE/tightening cycle effects on precious metals
- Inflation expectations and CPI data interpretation

TECHNICAL ANALYSIS MASTERY:
- Advanced chart pattern recognition (head & shoulders, triangles, flags, etc.)
- Support/resistance level identification with precision
- Moving averages (20, 50, 100, 200-day) and their significance
- RSI, MACD, Stochastic, and momentum indicator expertise
- Fibonacci retracement and extension levels
- Volume analysis and market structure understanding

GEOPOLITICAL & MACRO FACTORS:
- Central bank gold reserves and purchasing patterns
- Geopolitical tensions and safe-haven demand spikes
- Currency crisis impacts on gold demand
- Trade war and economic uncertainty effects

RISK MANAGEMENT EXPERTISE:
- Position sizing based on volatility and account risk
- Stop-loss placement using technical and fundamental levels
- Profit-taking strategies and target setting
- Portfolio allocation recommendations for gold exposure

TRADING STRATEGIES:
- Scalping, day trading, and swing trading approaches
- Breakout and reversal strategy implementation
- News trading around key economic releases
- Seasonal and cyclical pattern exploitation

USER REQUEST: Search for and analyze the latest gold market information covering:

REAL-TIME PRICE DATA (VERIFY FROM MULTIPLE SOURCES):
- Search for current XAU/USD spot price from TradingView
- Get gold futures price from Investing.com  
- Check MarketWatch gold price
- Verify with Yahoo Finance gold spot price
- Cross-reference with Reuters gold market data
- Include timestamps and percentage changes (24h, weekly)

NEWS & ANALYSIS (LAST 24 HOURS ONLY - MINIMUM 10 NEWS ITEMS):
PERFORM MULTIPLE COMPREHENSIVE SEARCHES - Search each of these topics separately:
1. Search "gold news today latest 24 hours" - verify publication timestamps
2. Search "Federal Reserve gold policy latest news today" - Fed decisions impact
3. Search "gold technical analysis today chart patterns" - current technical view
4. Search "gold ETF flows institutional buying selling today" - institutional activity
5. Search "geopolitical events gold safe haven demand today" - current events
6. Search "inflation data gold price reaction latest" - macro economic impact
7. Search "central bank gold reserves purchases today" - CB activities
8. Search "mining industry gold production news today" - supply updates
9. Search "XAU/USD analysis forecast today" - trading analysis
10. Search "precious metals market news today gold silver" - broader metals coverage
11. Search "USD dollar strength impact gold today" - currency correlation
12. Search "gold futures options trading volume today" - market activity
13. Search "China India gold demand consumption latest" - demand analysis
14. Search "jewelry industry gold prices impact today" - industrial demand
15. Search "economic data GDP employment gold correlation" - macro fundamentals

SEARCH INSTRUCTIONS:
- Perform EACH search query above individually
- Gather news from MULTIPLE sources (Reuters, Bloomberg, MarketWatch, CNBC, Yahoo Finance, etc.)
- Include news from different time zones and markets (US, Asia, Europe)
- MINIMUM 10 unique news articles required
- If fewer than 10 found, expand search to include slightly older articles (within 48 hours)

CRITICAL REQUIREMENTS:
- MANDATORY: Include MINIMUM 10 news items (this is ESSENTIAL)
- ONLY include news from the last 24-48 hours (verify timestamps)
- SEARCH MULTIPLE SOURCES: Reuters, Bloomberg, MarketWatch, CNBC, Yahoo Finance, etc.
- INCLUDE the original URL/link for each news article
- FORMAT timePublished as MM/DD/YYYY HH:MM (e.g., "07/01/2025 14:30")
- Get prices from minimum 3 different reliable sources
- Include exact price levels, support/resistance with numbers
- Verify all data is current and not outdated
- Prioritize high-impact news that affects gold prices
- If less than 10 recent articles found, expand time window to 48 hours

ANALYSIS FRAMEWORK:
1. Recent Fed rate decisions and their immediate/future impact on gold
2. Current gold price trends, technical analysis, and key levels
3. Geopolitical events creating safe-haven demand for gold
4. Central bank gold activities and reserve changes
5. Inflation data, real yields, and macroeconomic indicators affecting gold
6. Mining industry updates, supply constraints, or production changes
7. ETF flows and institutional positioning in gold

CRITICAL: Provide your analysis in TWO PARTS:

PART 1: DETAILED NARRATIVE ANALYSIS
Provide a comprehensive written analysis covering all the above points with specific data, price levels, and trading insights.

PART 2: JSON TRADING SUMMARY
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
    })

    console.log('🏆 GOLD TRADING AI ANALYSIS WITH WEB SEARCH')
    console.log('===========================================')
    console.log(resp.output_text)

    // Save results with timestamp
    await saveAnalysisResults(resp)

    // Extract and display key findings
    displayKeyFindings(resp.output_text)
  } catch (error) {
    console.error('❌ Error analyzing gold market:', error.message)

    // Save error results
    const errorResults = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    }
    await saveAnalysisResults(errorResults)
  }
}

// Save analysis results to file
async function saveAnalysisResults(response) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `openai-analysis-${timestamp}.json`
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
      model: 'gpt-4.1',
      analysis_type: 'enhanced_gold_market'
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`💾 Results saved to: ${outputPath}`)

    // Also save as latest
    const latestPath = path.join(dataDir, 'latest_openai_analysis.json')
    fs.writeFileSync(latestPath, JSON.stringify(results, null, 2))
    console.log(`📄 Latest analysis updated`)
  } catch (saveError) {
    console.error('❌ Error saving results:', saveError.message)
  }
}

// Display key findings from analysis
function displayKeyFindings(outputText) {
  try {
    console.log('\n📈 KEY ANALYSIS FINDINGS:')
    console.log('='.repeat(50))

    // Try to extract JSON from the response
    const jsonMatch = outputText.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])

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
    } else {
      console.log('📊 Analysis completed - check saved file for detailed results')
    }

    console.log('='.repeat(50))
  } catch (error) {
    console.log('📊 Analysis completed - check saved file for detailed results')
  }
}

// Execute the analysis
analyzeGoldMarket()
