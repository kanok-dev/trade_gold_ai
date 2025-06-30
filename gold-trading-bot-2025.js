import { exec } from 'child_process'
import { config } from './config.js'

class GoldTradingBot {
  constructor() {
    this.isRunning = false
    this.retryCount = 0
  }

  // ฟังก์ชันเรียก Gemini CLI 2025 พร้อม timeout
  async callGemini(prompt, timeoutMs = config.gemini.timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Gemini CLI timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      exec(`gemini -p '${prompt.replace(/"/g, '\\"')}'`, (err, stdout) => {
        clearTimeout(timer)
        if (err) reject(err)
        else resolve(stdout)
      })
    })
  }

  // ค้นหาข่าวด้วย Web Search Tool
  async searchGoldNews() {
    const searchQuery = config.searchQueries[Math.floor(Math.random() * config.searchQueries.length)]
    const prompt = `google_web_search(query="${searchQuery}")`

    try {
      const result = await this.callGemini(prompt)
      console.log('🔍 Web Search completed')
      return result
    } catch (error) {
      console.error('❌ Web Search failed:', error.message)
      throw error
    }
  }

  // ดึงข้อมูลจาก URL เฉพาะด้วย Web Fetch Tool
  async fetchSpecificNews() {
    // เลือก 2-3 URLs จาก config แบบสุ่ม (เพื่อหลีกเลี่ยง rate limit)
    const selectedUrls = config.newsSources.sort(() => 0.5 - Math.random()).slice(0, 3)

    const prompt = `web_fetch(prompt="Extract the latest XAU/USD gold trading news and Federal Reserve policy updates from these sources: ${selectedUrls.join(' ')}")`

    try {
      const result = await this.callGemini(prompt)
      console.log('🌐 Web Fetch completed')
      return result
    } catch (error) {
      console.error('❌ Web Fetch failed:', error.message)
      throw error
    }
  }

  // วิเคราะห์ข่าวสำหรับการเทรด
  async analyzeNewsForTrading(newsContent) {
    const prompt = `Analyze this financial news content for XAU/USD gold trading signals:

${newsContent}

Please provide a JSON-structured analysis with:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": "high|medium|low",
  "signal": "strong_buy|buy|hold|sell|strong_sell",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "fedImpact": "description of Federal Reserve policy impact",
  "technicalView": "short technical analysis",
  "riskLevel": "high|medium|low",
  "timeHorizon": "short-term|medium-term|long-term",
  "priceTarget": "estimated price movement",
  "summary": "concise trading recommendation"
}`

    try {
      const result = await this.callGemini(prompt)
      console.log('🤖 Analysis completed')
      return result
    } catch (error) {
      console.error('❌ Analysis failed:', error.message)
      throw error
    }
  }

  // ประมวลผลหลัก
  async runAnalysis() {
    if (this.isRunning) {
      console.log('⏳ Bot is already running, skipping...')
      return
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      console.log(`🚀 เริ่มการวิเคราะห์ XAU/USD [${new Date().toLocaleString()}]`)

      // รันทั้ง Web Search และ Web Fetch พร้อมกัน
      const [searchResults, fetchResults] = await Promise.allSettled([this.searchGoldNews(), this.fetchSpecificNews()])

      let combinedNews = ''

      if (searchResults.status === 'fulfilled') {
        combinedNews += `Search Results:\n${searchResults.value}\n\n`
      } else {
        console.warn('⚠️ Search failed:', searchResults.reason?.message)
      }

      if (fetchResults.status === 'fulfilled') {
        combinedNews += `Fetched News:\n${fetchResults.value}`
      } else {
        console.warn('⚠️ Fetch failed:', fetchResults.reason?.message)
      }

      if (!combinedNews.trim()) {
        throw new Error('No news data retrieved from any source')
      }

      // วิเคราะห์ข้อมูล
      const analysis = await this.analyzeNewsForTrading(combinedNews)

      // สร้างข้อความแจ้งเตือน
      const timestamp = new Date().toLocaleString()
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2)

      const notification = `🪙 XAU/USD Trading Signal Alert
📅 ${timestamp}
⚡ Execution: ${executionTime}s

${analysis}

🔗 Sources: Web Search + Fetch from major financial news`

      // await this.notifyLine(notification) // Line Notify call removed
      console.log('\n--- Trading Signal ---\n')
      console.log(notification)
      console.log('\n----------------------\n')

      console.log('✅ การวิเคราะห์เสร็จสิ้น')
      this.retryCount = 0 // Reset retry count on success
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาด: ${error.message}`)

      // Removed error notification block for Line Notify

      throw error
    } finally {
      this.isRunning = false
    }
  }

  // เริ่มการทำงานแบบ scheduled
  async start() {
    console.log('🎯 Gold Trading Bot 2025 started with Gemini CLI Tools')
    console.log(`⏰ Interval: ${config.schedule.interval / 60000} minutes`)
    console.log(`🔄 Max retries: ${config.schedule.maxRetries}`)

    // รันครั้งแรกทันที
    await this.runWithRetry()

    // ตั้ง interval สำหรับรันต่อไป
    setInterval(async () => {
      await this.runWithRetry()
    }, config.schedule.interval)
  }

  // รันพร้อม retry logic
  async runWithRetry() {
    for (let attempt = 1; attempt <= config.schedule.maxRetries; attempt++) {
      try {
        await this.runAnalysis()
        return // สำเร็จแล้ว ออกจาก loop
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${config.schedule.maxRetries} failed:`, error.message)

        if (attempt < config.schedule.maxRetries) {
          console.log(`⏳ Retrying in ${config.schedule.retryDelay / 1000} seconds...`)
          await new Promise((resolve) => setTimeout(resolve, config.schedule.retryDelay))
        } else {
          console.error('💀 All retry attempts failed')
        }
      }
    }
  }

  // หยุดการทำงาน
  stop() {
    console.log('🛑 Gold Trading Bot stopped')
    process.exit(0)
  }
}

// สร้าง instance และเริ่มทำงาน
const bot = new GoldTradingBot()

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully...')
  bot.stop()
})

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...')
  bot.stop()
})

// เริ่มทำงาน
if (import.meta.url === `file://${process.argv[1]}`) {
  bot.start().catch((error) => {
    console.error('💀 Fatal error:', error)
    process.exit(1)
  })
}

export default GoldTradingBot
