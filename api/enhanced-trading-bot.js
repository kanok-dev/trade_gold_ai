import OpenAI from 'openai'
import dotenv from 'dotenv'
import { GoldDataScraper } from './enhanced-web-scraping.js'

dotenv.config()

class EnhancedGoldTradingBot {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.scraper = new GoldDataScraper()
    this.tradingHistory = []
    this.lastAnalysis = null
  }

  async init() {
    console.log('🤖 Initializing Enhanced Gold Trading Bot...')

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ OPENAI_API_KEY not found in .env file')
    }

    await this.scraper.init()
    console.log('✅ Bot initialized successfully')
  }

  async cleanup() {
    await this.scraper.close()
  }

  async getCurrentMarketData() {
    console.log('📊 Gathering real-time market data...')
    return await this.scraper.getMarketData()
  }

  async generateTradingAnalysis(marketData) {
    const prompt = `
As an expert gold trading analyst, provide a comprehensive trading analysis based on the following REAL-TIME market data:

CURRENT GOLD PRICE DATA:
- Price: ${marketData.price.price}
- Change: ${marketData.price.change}
- Source: ${marketData.price.source}
- Timestamp: ${marketData.timestamp}

MARKET SENTIMENT ANALYSIS:
- Total News Articles: ${marketData.summary.totalNews}
- Bullish Sentiment: ${marketData.summary.bullishNews} articles
- Bearish Sentiment: ${marketData.summary.bearishNews} articles
- High Relevance News: ${marketData.summary.highRelevance} articles

RECENT NEWS HEADLINES:
${marketData.news
  .slice(0, 5)
  .map((article, idx) => `${idx + 1}. [${article.sentiment.toUpperCase()}] ${article.title} (Relevance: ${article.relevance}/10)`)
  .join('\n')}

DETAILED NEWS CONTEXT:
${marketData.news
  .slice(0, 3)
  .map((article, idx) => `${idx + 1}. ${article.title}\n   Description: ${article.description}\n   Sentiment: ${article.sentiment}\n`)
  .join('\n')}

Please provide a structured analysis including:

1. **IMMEDIATE MARKET ASSESSMENT** (0-24 hours)
   - Current price momentum analysis
   - Key support/resistance levels based on the current price
   - News sentiment impact on short-term movements

2. **TECHNICAL ANALYSIS**
   - Price action interpretation
   - Trend direction and strength
   - Critical levels to watch

3. **FUNDAMENTAL ANALYSIS**
   - News impact assessment
   - Economic factors from the headlines
   - Market sentiment interpretation

4. **TRADING RECOMMENDATIONS**
   - Specific entry/exit points relative to current price ${marketData.price.price}
   - Position sizing suggestions
   - Risk management levels (stop loss, take profit)
   - Time horizon for the trade

5. **RISK ASSESSMENT**
   - Key risk factors from current news
   - Potential market catalysts to watch
   - Overall risk rating (Low/Medium/High)

6. **CONFIDENCE SCORE**
   - Analysis confidence (1-10)
   - Reasoning for confidence level

Format your response clearly with emojis and bullet points for easy reading.
`

    try {
      console.log('🧠 Generating AI trading analysis...')

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a world-class gold trading expert with 20+ years of experience. You specialize in:
            - Real-time market analysis and sentiment interpretation
            - Technical analysis with precise support/resistance levels
            - Risk management and position sizing
            - News impact assessment on gold prices
            - Short-term and swing trading strategies
            
            Always provide specific, actionable trading advice with clear entry/exit points.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('❌ AI analysis failed:', error.message)
      throw error
    }
  }

  async generateTradingSignal(marketData, analysis) {
    const signalPrompt = `
Based on the market analysis provided, generate a specific trading signal:

MARKET DATA:
- Current Price: ${marketData.price.price}
- Change: ${marketData.price.change}
- Market Sentiment: ${marketData.summary.bullishNews > marketData.summary.bearishNews ? 'Bullish' : 'Bearish'}

ANALYSIS SUMMARY:
${analysis.substring(0, 1000)}...

Generate a JSON trading signal with this exact format:
{
  "signal": "BUY|SELL|HOLD",
  "confidence": "1-10",
  "entry_price": "specific price level",
  "stop_loss": "specific price level", 
  "take_profit": "specific price level",
  "position_size": "percentage of portfolio",
  "time_horizon": "hours/days",
  "reasoning": "brief explanation"
}

Provide ONLY the JSON response, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: 'You are a precise trading signal generator. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: signalPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error('❌ Signal generation failed:', error.message)
      return {
        signal: 'HOLD',
        confidence: 5,
        entry_price: marketData.price.price,
        stop_loss: 'N/A',
        take_profit: 'N/A',
        position_size: '0%',
        time_horizon: 'N/A',
        reasoning: 'Analysis failed, holding position'
      }
    }
  }

  formatAnalysisReport(marketData, analysis, signal) {
    const timestamp = new Date(marketData.timestamp).toLocaleString()

    return `
🏆 ENHANCED GOLD TRADING ANALYSIS REPORT 🏆
${'='.repeat(70)}

📊 MARKET SNAPSHOT (${timestamp})
💰 Gold Price: ${marketData.price.price}
📈 Change: ${marketData.price.change}
🔗 Source: ${marketData.price.source}

📰 SENTIMENT OVERVIEW
📊 Total News: ${marketData.summary.totalNews}
🟢 Bullish: ${marketData.summary.bullishNews} | 🔴 Bearish: ${marketData.summary.bearishNews}
⭐ High Relevance: ${marketData.summary.highRelevance}

🤖 AI TRADING ANALYSIS
${'-'.repeat(50)}
${analysis}

🎯 TRADING SIGNAL
${'-'.repeat(50)}
📈 Signal: ${signal.signal}
🎯 Confidence: ${signal.confidence}/10
💵 Entry Price: ${signal.entry_price}
🛑 Stop Loss: ${signal.stop_loss}
🎯 Take Profit: ${signal.take_profit}
📊 Position Size: ${signal.position_size}
⏰ Time Horizon: ${signal.time_horizon}
💡 Reasoning: ${signal.reasoning}

${'='.repeat(70)}
Generated by Enhanced Gold Trading Bot v2.0
`
  }

  async runCompleteAnalysis() {
    try {
      console.log('🚀 Starting complete trading analysis...')

      // Step 1: Get market data
      const marketData = await this.getCurrentMarketData()

      // Step 2: Generate AI analysis
      const analysis = await this.generateTradingAnalysis(marketData)

      // Step 3: Generate trading signal
      const signal = await this.generateTradingSignal(marketData, analysis)

      // Step 4: Format and display report
      const report = this.formatAnalysisReport(marketData, analysis, signal)
      console.log(report)

      // Step 5: Store analysis for history
      this.lastAnalysis = {
        timestamp: marketData.timestamp,
        marketData,
        analysis,
        signal,
        report
      }

      this.tradingHistory.push(this.lastAnalysis)

      return this.lastAnalysis
    } catch (error) {
      console.error('❌ Complete analysis failed:', error)
      throw error
    }
  }

  async runQuickSignal() {
    try {
      console.log('⚡ Generating quick trading signal...')

      const marketData = await this.getCurrentMarketData()
      const signal = await this.generateTradingSignal(marketData, 'Quick analysis mode')

      console.log(`\n⚡ QUICK TRADING SIGNAL ⚡`)
      console.log(`💰 Gold: ${marketData.price.price} (${marketData.price.change})`)
      console.log(`📈 Signal: ${signal.signal} | Confidence: ${signal.confidence}/10`)
      console.log(`💵 Entry: ${signal.entry_price} | SL: ${signal.stop_loss} | TP: ${signal.take_profit}`)
      console.log(`💡 ${signal.reasoning}`)

      return { marketData, signal }
    } catch (error) {
      console.error('❌ Quick signal failed:', error)
      throw error
    }
  }

  getAnalysisHistory() {
    return this.tradingHistory
  }

  getLastAnalysis() {
    return this.lastAnalysis
  }
}

// Main execution functions
async function runFullAnalysis() {
  const bot = new EnhancedGoldTradingBot()
  try {
    await bot.init()
    await bot.runCompleteAnalysis()
  } finally {
    await bot.cleanup()
  }
}

async function runQuickSignal() {
  const bot = new EnhancedGoldTradingBot()
  try {
    await bot.init()
    await bot.runQuickSignal()
  } finally {
    await bot.cleanup()
  }
}

// Export for use in other modules
export { EnhancedGoldTradingBot, runFullAnalysis, runQuickSignal }

// Command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'full'

  if (mode === 'quick') {
    runQuickSignal().catch(console.error)
  } else {
    runFullAnalysis().catch(console.error)
  }
}
