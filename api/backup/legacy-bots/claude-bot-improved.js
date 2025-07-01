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
วิเคราะห์ทองคำ XAU/USD แบบกระชับ:

1. ราคาปัจจุบัน + %เปลี่ยนแปลง (D/D, W/W) จาก 2 แหล่ง
2. ข่าวสำคัญ 3-5 หัวข้อ ≤24ชม + sentiment
3. เทคนิค: แนวรับ-ต้าน, RSI, momentum
4. คำแนะนำ: BUY/SELL/HOLD + confidence + เหตุผล

Response JSON format:
{
  "timestamp": "ISO datetime",
  "price_data": {
    "spot": <number>,
    "change_daily": <number>,
    "change_weekly": <number>,
    "sources": [{"name": <string>, "price": <number>}]
  },
  "news": [
    {"headline": <string>, "sentiment": <string>, "impact": <string>}
  ],
  "technical": {
    "support": <number>,
    "resistance": <number>,
    "rsi": <number>,
    "trend": <string>
  },
  "recommendation": {
    "action": "BUY"|"SELL"|"HOLD",
    "confidence": <number 0-100>,
    "reasoning": <string ≤50 words>
  },
  "summary_thai": <string ≤100 words>
}
`

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

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      response: response,
      status: 'success',
      token_usage: {
        input_tokens: response.usage?.input_tokens || 'N/A',
        output_tokens: response.usage?.output_tokens || 'N/A'
      }
    }

    await saveResults(results)
    console.log('📊 Analysis complete!')
    console.log('Response:', JSON.stringify(response, null, 2))

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
    const filename = `claude-analysis-${timestamp}.json`
    const outputPath = path.join(__dirname, '../../data', filename)

    // Ensure data directory exists
    const dataDir = path.dirname(outputPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`💾 Results saved to: ${outputPath}`)

    // Also save as latest
    const latestPath = path.join(dataDir, 'latest_claude_analysis.json')
    fs.writeFileSync(latestPath, JSON.stringify(results, null, 2))
  } catch (saveError) {
    console.error('❌ Error saving results:', saveError.message)
  }
}

// Run the analysis
runAnalysis().catch(console.error)
