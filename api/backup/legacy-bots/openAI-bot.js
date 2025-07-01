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

GOLD MARKET ANALYSIS - LATEST 24 HOURS
RESEARCH STRATEGY
Conduct targeted searches to gather comprehensive gold market intelligence from the past 24 hours. Use the minimum number of searches needed to provide thorough coverage.
SEARCH SEQUENCE (3-8 searches recommended)
Core Market Searches:

Latest Gold News: Search "gold price news today" - Focus on major developments
Technical Analysis: Search "gold technical analysis today" - Current chart patterns and levels
Economic Drivers: Search "Fed inflation data gold" - Macro economic impacts
Institutional Activity: Search "gold ETF flows central bank" - Major player movements

Additional Searches (if needed):

Geopolitical Factors: Search "geopolitical events gold safe haven" - Risk-on/risk-off sentiment
Currency Impact: Search "USD gold correlation today" - Dollar strength/weakness effects
Supply/Demand: Search "gold demand production latest" - Fundamental supply/demand factors
Market Sentiment: Search "gold futures trading volume" - Market participation and positioning

SEARCH GUIDELINES

Keep queries concise (1-4 words maximum)
Search progressively - start broad, then narrow if needed
Never repeat similar queries - make each search unique
Prioritize recent content - focus on last 24-48 hours
Stop searching when sufficient information is gathered

ANALYSIS REQUIREMENTS
Content Standards:

Verify timestamps - ensure news is actually from last 24 hours
Cross-reference sources - confirm information across multiple outlets
Cite all claims - use proper  tags for every factual statement
Quote sparingly - maximum one short quote (<15 words) in quotation marks

Report Structure:

Executive Summary (2-3 sentences - key takeaways)
Price Action (current levels, daily/weekly changes)
Major News Events (significant developments affecting gold)
Technical Analysis (support/resistance, chart patterns)
Economic Drivers (Fed policy, inflation, USD movement)
Institutional Activity (ETF flows, central bank actions)
Market Sentiment (risk-on/risk-off, trading volumes)
Outlook (near-term catalysts and risks)

QUALITY CONTROL

Source Priority: Reuters > Bloomberg > Financial Times > MarketWatch > TradingView
Fact Verification: Cross-check price data with multiple sources
Recency Check: Confirm all news items are actually from past 24 hours
Copyright Compliance: Never reproduce large text blocks, use short quotes only

OUTPUT FORMAT
Provide a comprehensive yet concise analysis (800-1200 words) with:

Clear headers for each section
Proper citations for all claims
Actionable insights for traders/investors
Risk disclaimers where appropriate

SUCCESS METRICS

Accuracy: All price data and news verified
Timeliness: Focus on truly recent developments
Completeness: Cover all major market-moving factors
Actionability: Provide clear takeaways for decision-making

TRUSTED SOURCES PRIORITY (ใช้แหล่งข้อมูลที่เชื่อถือได้):
PRIMARY SOURCES (Must prioritize these):
- Reuters (reuters.com) - Global financial news leader
- Bloomberg (bloomberg.com) - Premier financial data and analysis
- TradingView (tradingview.com) - Technical analysis and market data
- MarketWatch (marketwatch.com) - Real-time market news
- Yahoo Finance (finance.yahoo.com) - Comprehensive market coverage
- CNBC (cnbc.com) - Business and financial news
- Financial Times (ft.com) - International financial journalism
- Wall Street Journal (wsj.com) - Business and market analysis

SECONDARY SOURCES (Additional verification):
- Investing.com - Market data and analysis
- FXStreet (fxstreet.com) - Forex and commodities analysis
- Kitco News (kitco.com) - Precious metals specialist
- GoldSeek (goldseek.com) - Gold market focus
- BullionVault - Gold market insights

SEARCH INSTRUCTIONS:
- Perform EACH search query above individually
- PRIORITIZE news from Reuters, Bloomberg, TradingView, and MarketWatch
- Gather news from MULTIPLE trusted sources only
- Include news from different time zones and markets (US, Asia, Europe)
- MINIMUM 10 unique news articles required from TRUSTED SOURCES ONLY
- If fewer than 10 found from trusted sources, expand search to include slightly older articles (within 48 hours)
- VERIFY source credibility before including any news item
- EXCLUDE social media, blogs, or unverified sources

CRITICAL REQUIREMENTS:
- MANDATORY: Include MINIMUM 10 news items (this is ESSENTIAL)
- ONLY include news from the last 24-48 hours (verify timestamps)
- SEARCH TRUSTED SOURCES ONLY: Reuters, Bloomberg, TradingView, MarketWatch, Yahoo Finance, CNBC, Financial Times, WSJ
- EXCLUDE social media, blogs, forums, or unverified sources
- INCLUDE the original URL/link for each news article from trusted sources
- FORMAT timePublished as MM/DD/YYYY HH:MM (e.g., "07/01/2025 14:30")
- Get prices from minimum 3 different reliable sources (TradingView, Investing.com, MarketWatch)
- Include exact price levels, support/resistance with numbers
- Verify all data is current and not outdated
- Prioritize high-impact news that affects gold prices from established financial news organizations
- If less than 10 recent articles found from trusted sources, expand time window to 48 hours
- VERIFY source credibility - only use established financial news organizations

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
