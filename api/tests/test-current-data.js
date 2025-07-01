import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

class DataTestBot {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
  }

  async callGeminiAPI(prompt) {
    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      )

      return response.data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('API Error:', error.message)
      throw error
    }
  }

  async testCurrentDataAccess() {
    console.log('🧪 Testing Gemini AI data currency...')
    console.log(`📅 Current date: ${new Date().toLocaleString()}`)
    console.log('')

    const prompt = `What is today's date? What are the current major events affecting global markets today (June 30, 2025)? 
    
Please provide:
1. Today's exact date
2. Recent Federal Reserve decisions (if any)
3. Current gold price trends
4. Major economic events this week
5. Your knowledge cutoff date

Be specific about what information you have access to and what you don't.`

    try {
      const result = await this.callGeminiAPI(prompt)
      console.log('🤖 Gemini Response:')
      console.log('='.repeat(60))
      console.log(result)
      console.log('='.repeat(60))

      return result
    } catch (error) {
      console.error('❌ Test failed:', error.message)
      return null
    }
  }

  async testGoldSpecificData() {
    console.log('\n🪙 Testing gold-specific current data...')

    const prompt = `Regarding XAU/USD (gold) market as of June 30, 2025:

1. What is the current approximate gold price?
2. What major economic events this week could affect gold?
3. What is the Federal Reserve's current stance that might impact precious metals?
4. Are there any geopolitical events currently affecting gold demand?
5. What is your data cutoff date for real-time market information?

Please be honest about what current information you have versus historical knowledge.`

    try {
      const result = await this.callGeminiAPI(prompt)
      console.log('🪙 Gold Analysis Response:')
      console.log('='.repeat(60))
      console.log(result)
      console.log('='.repeat(60))

      return result
    } catch (error) {
      console.error('❌ Gold test failed:', error.message)
      return null
    }
  }
}

// Run tests
async function runTests() {
  const testBot = new DataTestBot()

  try {
    await testBot.testCurrentDataAccess()
    await testBot.testGoldSpecificData()

    console.log('\n✅ Data currency test completed!')
  } catch (error) {
    console.error('❌ Tests failed:', error.message)
  }
}

runTests()
