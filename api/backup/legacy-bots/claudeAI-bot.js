import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
dotenv.config()

const anthropic = new Anthropic({
  // defaults to process.env["ANTHROPIC_API_KEY"]
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Rate limiting helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function callClaudeWithRetry(params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.beta.messages.create(params)
      return response
    } catch (error) {
      if (error.status === 429) {
        console.log(`Rate limit hit, attempt ${attempt}/${maxRetries}`)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`Waiting ${waitTime}ms before retry...`)
          await delay(waitTime)
          continue
        }
      }
      throw error
    }
  }
}

// Shortened prompt to reduce token usage
const shortPrompt = `
【ภารกิจ】วิเคราะห์ทองคำ XAU/USD แบบย่อ
1️⃣ ราคาปัจจุบัน + %เปลี่ยนแปลง D/D, W/W จาก 2 แหล่ง
2️⃣ ข่าวสำคัญ 5 หัวข้อ ≤24ชม + sentiment
3️⃣ เทคนิค: แนวรับ-ต้าน, RSI, momentum
4️⃣ คำแนะนำ: BUY/SELL/HOLD + เหตุผล

JSON Output:
{
  "timestamp": "ISO datetime",
  "spot_price": <number>,
  "change_daily_pct": <number>,
  "change_weekly_pct": <number>,
  "news_highlights": [
    {"headline": <string>, "sentiment": <string>, "source": <string>}
  ],
  "technical": {
    "supports": [<number>],
    "resistances": [<number>],
    "rsi": <number>,
    "trend": <string>
  },
  "recommendation": {
    "action": "BUY"|"SELL"|"HOLD",
    "confidence": <number>,
    "reasoning": <string>
  },
  "summary_thai": <string>
}`

const msg = await callClaudeWithRetry({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 8000, // Reduced from 20000
  temperature: 0.7,
  system: 'คุณคือผู้ช่วยวิเคราะห์ทองคำ ให้ข้อมูลสั้นกระชับแต่ครบถ้วน',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: shortPrompt
        }
      ]
    }
  ],
  tools: [
    {
      name: 'web_search',
      type: 'web_search_20250305'
    }
  ],
  betas: ['web-search-2025-03-05']
})
console.log(msg)

// Save results to file with error handling
try {
  const results = {
    timestamp: new Date().toISOString(),
    response: msg,
    status: 'success'
  }

  const outputPath = path.join(process.cwd(), 'data', `claude-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`)

  // Ensure data directory exists
  const dataDir = path.dirname(outputPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`Results saved to: ${outputPath}`)
} catch (saveError) {
  console.error('Error saving results:', saveError.message)
}
