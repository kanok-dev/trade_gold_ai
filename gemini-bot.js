import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

class GoldTradingBotFixed {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.lineToken = process.env.LINE_TOKEN
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
  }

  checkConfig() {
    if (!this.apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env file')
      process.exit(1)
    }
    console.log('✅ Gemini API key configured')
  }

  async callGeminiAPI(prompt, tools = null, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Gemini API call attempt ${attempt}/${retries}`)

        const requestBody = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }

        if (tools) {
          requestBody.tools = tools
        }

        const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // Increased to 60 seconds
        })

        return response.data.candidates[0].content.parts[0].text
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message)

        if (attempt === retries) {
          throw error
        }

        // Wait before retry
        const delay = attempt * 2000 // 2s, 4s, 6s delays
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  async searchGoldNews() {
    console.log('🔍 Searching for gold news using web search...')

    const prompt = `Provide a real-time analysis of gold (XAU/USD) market conditions by searching the web. I need to know:

1. The most recent developments regarding Federal Reserve policy and their impact on gold prices.
2. Current market sentiment for precious metals, citing recent sources.
3. Key economic indicators and data releases affecting gold this week.
4. A brief technical outlook for XAU/USD based on current price action.

Please provide a concise but comprehensive summary suitable for making a trading decision.`

    // Correct tool configuration for Gemini API web search
    const tools = [
      {
        function_declarations: [
          {
            name: 'google_search_retrieval',
            description: 'Search the web for current information about gold markets and Federal Reserve policy'
          }
        ]
      }
    ]

    return await this.callGeminiAPI(prompt, tools)
  }

  async analyzeNewsForTrading(newsContent) {
    console.log('🤖 Analyzing news for trading signals...')

    const prompt = `Analyze this financial news content for XAU/USD gold trading signals:

${newsContent}

Please provide a structured analysis in the following JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": "high|medium|low", 
  "signal": "strong_buy|buy|hold|sell|strong_sell",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "fedImpact": "description of Federal Reserve policy impact",
  "technicalView": "short technical analysis",
  "riskLevel": "high|medium|low",
  "timeHorizon": "short-term|medium-term|long-term",
  "priceTarget": "estimated price movement percentage",
  "summary": "concise trading recommendation"
}

Provide the JSON response followed by a human-readable summary.`

    return await this.callGeminiAPI(prompt)
  }

  async notifyLine(message) {
    if (!this.lineToken || this.lineToken === 'your_line_notify_token_here') {
      console.log('📱 Line Notify token not configured, skipping notification')
      console.log('Message would be:', message.substring(0, 200) + '...')
      return
    }

    try {
      await axios.post('https://notify-api.line.me/api/notify', new URLSearchParams({ message }), {
        headers: {
          Authorization: `Bearer ${this.lineToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      console.log('📱 Line notification sent successfully')
    } catch (error) {
      console.error('❌ Line notification failed:', error.message)
    }
  }

  async runAnalysis() {
    const startTime = Date.now()

    try {
      console.log(`🚀 Starting XAU/USD Analysis [${new Date().toLocaleString()}]`)

      // Get latest news
      const newsResults = await this.searchGoldNews()
      console.log('📰 News search completed')

      // Analyze for trading signals
      const analysis = await this.analyzeNewsForTrading(newsResults)
      console.log('📈 Analysis completed')

      // Create notification message
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2)
      const notification = `🪙 XAU/USD Trading Signal Alert
📅 ${new Date().toLocaleString()}
⚡ Analysis time: ${executionTime}s

${analysis}

🔗 Powered by Gemini AI & Direct API`

      // Send notification
      await this.notifyLine(notification)

      console.log('✅ Analysis completed successfully!')
    } catch (error) {
      console.error('❌ Analysis failed:', error.message)

      // Send error notification
      try {
        // await this.notifyLine(`⚠️ Gold Trading Bot Error: ${error.message}\nTime: ${new Date().toLocaleString()}`)
      } catch (notifyError) {
        console.error('❌ Failed to send error notification:', notifyError.message)
      }
    }
  }
}

// Run the bot
const bot = new GoldTradingBotFixed()
bot.checkConfig()
bot.runAnalysis().catch(console.error)
