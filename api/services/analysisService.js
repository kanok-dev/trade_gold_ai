// Enhanced Analysis Service for comprehensive market analysis
import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import newsService from './newsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env configuration
dotenv.config({ path: path.join(__dirname, '../.env') })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export class AnalysisService {
  constructor() {
    // Directory paths for data storage
    this.analysisDir = path.join(__dirname, '../data/analysis')
  }

  /**
   * Step 1: Feed News using existing feedNews.js and read the generated JSON file
   */
  async feedNews() {
    try {
      console.log('📰 Step 1: Running feedNews.js and reading news data...')

      // Import and run the existing feedNews function
      const { feedNews } = await import('../backup/legacy-bots/feedNews.js')
      await feedNews()

      // Read the latest news file from the news directory
      const newsDir = path.join(__dirname, '../backup/legacy-bots/news')
      const files = await fs.readdir(newsDir)
      const newsFiles = files.filter((f) => f.startsWith('news_') && f.endsWith('.json'))

      if (newsFiles.length === 0) {
        throw new Error('No news files found after running feedNews')
      }

      // Get the latest news file (sorted by filename which includes timestamp)
      const latestNewsFile = newsFiles.sort().pop()
      const newsFilePath = path.join(newsDir, latestNewsFile)

      console.log(`📖 Reading latest news file: ${latestNewsFile}`)
      const newsContent = await fs.readFile(newsFilePath, 'utf8')
      const newsData = JSON.parse(newsContent)

      console.log('✅ Step 1 completed: News data loaded from file')
      return newsData
    } catch (error) {
      console.error('❌ Error in feedNews step:', error)
      throw new Error(`News feed failed: ${error.message}`)
    }
  }

  /**
   * Step 2: Get latest price from newsService
   */
  async getLatestPrice() {
    try {
      console.log('💰 Step 2: Fetching latest gold price...')

      const priceData = await newsService.getTradeviewXAUUSDPriceRealtime()

      if (priceData.price === null) {
        throw new Error(`Price fetch failed: ${priceData.error}`)
      }

      console.log(`✅ Step 2 completed: Current price $${priceData.price}`)
      return priceData
    } catch (error) {
      console.error('❌ Error in getLatestPrice step:', error)
      throw new Error(`Price fetch failed: ${error.message}`)
    }
  }

  /**
   * Step 3: AI Analysis for sentiment, signal, trading decision and summary
   */
  async performAIAnalysis(newsData, priceData) {
    try {
      console.log('🤖 Step 3: Performing AI analysis...')

      const analysisPrompt = `
Current Gold Market Data:
- Current Price: $${priceData.price}
- Source: ${priceData.source}
- Last Updated: ${priceData.timestamp}

Recent News Analysis:
${JSON.stringify(newsData.NewsUpdates, null, 2)}

Market Forecast:
${newsData['Analysis Forecast Scenarios']}

Previous Trading Decision:
${JSON.stringify(newsData['Trading Decision'], null, 2)}

Based on this comprehensive data, provide a detailed market analysis with:
1. Overall market sentiment (bullish/bearish/neutral) with confidence level
2. Trading signal (BUY/SELL/HOLD) with reasoning
3. Updated trading decision with entry, take profit, and stop loss levels
4. Risk assessment and market outlook
5. Summary of key factors influencing the analysis

**Please translate to Thai language.**
Return the response in this JSON format:
{
  "sentiment": {
    "overall": "bullish|bearish|neutral",
    "confidence": number (1-10),
    "reasoning": "detailed explanation"
  },
  "signal": {
    "action": "BUY|SELL|HOLD",
    "strength": number (1-10),
    "reasoning": "detailed explanation"
  },
  "tradingDecision": {
    "entryPoint": number,
    "takeProfit": number,
    "stopLoss": number,
    "riskReward": number,
    "reasoning": "detailed explanation"
  },
  "riskAssessment": {
    "riskLevel": "LOW|MODERATE|HIGH",
    "factors": ["factor1", "factor2"],
    "recommendation": "detailed recommendation"
  },
  "summary": "comprehensive analysis summary",
  "keyFactors": ["factor1", "factor2", "factor3"]
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial analyst specializing in gold markets. Provide precise, actionable trading analysis based on current market data and news. Be specific with price levels and risk management.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })

      const analysis = JSON.parse(response.choices[0].message.content)
      analysis.timestamp = new Date().toISOString()
      analysis.usage = response.usage

      console.log('✅ Step 3 completed: AI analysis generated')
      return analysis
    } catch (error) {
      console.error('❌ Error in performAIAnalysis step:', error)
      throw new Error(`AI analysis failed: ${error.message}`)
    }
  }

  /**
   * Step 4: Compile comprehensive analysis result
   */
  async compileAnalysisResult(newsData, priceData, aiAnalysis) {
    try {
      console.log('📊 Step 4: Compiling final analysis result...')

      const result = {
        timestamp: new Date().toISOString(),
        currentPrice: {
          price: priceData.price,
          source: priceData.source,
          lastUpdated: priceData.timestamp
        },
        news: {
          updates: newsData.NewsUpdates,
          forecast: newsData['Analysis Forecast Scenarios'],
          count: newsData.NewsUpdates.length
        },
        analysis: aiAnalysis,
        performance: {
          processingTime: new Date().toISOString(),
          dataFreshness: 'real-time',
          confidence: aiAnalysis.sentiment.confidence
        }
      }

      // Save complete analysis
      await this.saveAnalysisToFile(result)

      console.log('✅ Step 4 completed: Analysis compiled and saved')
      return result
    } catch (error) {
      console.error('❌ Error in compileAnalysisResult step:', error)
      throw new Error(`Result compilation failed: ${error.message}`)
    }
  }

  /**
   * Main method: Execute complete 4-step analysis process
   */
  async executeCompleteAnalysis() {
    try {
      console.log('🚀 Starting comprehensive 4-step analysis process...')

      // Step 1: Feed News
      const newsData = await this.feedNews()

      // Step 2: Get Latest Price
      const priceData = await this.getLatestPrice()

      // Step 3: AI Analysis
      const aiAnalysis = await this.performAIAnalysis(newsData, priceData)

      // Step 4: Compile Result
      const finalResult = await this.compileAnalysisResult(newsData, priceData, aiAnalysis)

      console.log('🎯 Complete analysis process finished successfully')
      return finalResult
    } catch (error) {
      console.error('❌ Complete analysis process failed:', error)
      throw error
    }
  }

  /**
   * Save analysis result to file
   */
  async saveAnalysisToFile(analysisData) {
    try {
      await fs.mkdir(this.analysisDir, { recursive: true })

      const fileName = `analysis_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const filePath = path.join(this.analysisDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(analysisData, null, 2))
      console.log(`📁 Analysis data saved to ${fileName}`)
    } catch (error) {
      console.error('❌ Error saving analysis file:', error)
    }
  }

  /**
   * Format analysis for Line message
   */
  formatForLineMessage(analysisResult) {
    const analysis = analysisResult.analysis
    const price = analysisResult.currentPrice

    return `📊 **Gold Market Analysis**

💰 **Current Price:** $${price.price}
📈 **Signal:** ${analysis.signal.action} (Strength: ${analysis.signal.strength}/10)
📊 **Sentiment:** ${analysis.sentiment.overall} (Confidence: ${analysis.sentiment.confidence}/10)

🎯 **Trading Decision:**
• Entry: $${analysis.tradingDecision.entryPoint}
• Take Profit: $${analysis.tradingDecision.takeProfit}
• Stop Loss: $${analysis.tradingDecision.stopLoss}

⚠️ **Risk Level:** ${analysis.riskAssessment.riskLevel}

📝 **Summary:**
${analysis.summary}

🔍 **Key Factors:**
${analysis.keyFactors.map((factor) => `• ${factor}`).join('\n')}

⏰ **Updated:** ${new Date(analysisResult.timestamp).toLocaleString()}`
  }
}

export default new AnalysisService()
