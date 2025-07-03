// Notification Service for Line OA alerts
import https from 'https'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class NotificationService {
  constructor() {
    this.lineOAToken = process.env.LINE_OA_TOKEN
    this.lineOAChannelSecret = process.env.LINE_OA_CHANNEL_SECRET
    this.alertHistory = []
  }

  async sendTradingAlert(alertData) {
    try {
      const { action, price, confidence, reasoning } = alertData

      const message = `
🏆 Gold Trading Alert
Action: ${action}
Price: $${price}
Confidence: ${confidence}%
Reasoning: ${reasoning}
Time: ${new Date().toLocaleString()}
      `.trim()

      // Store in history
      this.alertHistory.push({
        ...alertData,
        timestamp: new Date().toISOString(),
        sent: true
      })

      console.log('🚨 Trading alert prepared')
      return { message, alertData }
    } catch (error) {
      console.error('❌ Error preparing trading alert:', error)
      throw error
    }
  }

  async sendSystemAlert(message, type = 'INFO') {
    try {
      const formattedMessage = `
🤖 System Alert [${type}]
${message}
Time: ${new Date().toLocaleString()}
      `.trim()

      console.log(`📢 System alert prepared: ${type}`)
      return { message: formattedMessage, type }
    } catch (error) {
      console.error('❌ Error preparing system alert:', error)
      throw error
    }
  }

  async sendLineOAMessage(userId, message) {
    if (!this.lineOAToken) {
      console.log('⚠️ Line OA token not configured, skipping notification')
      return false
    }

    try {
      const data = JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })

      const options = {
        hostname: 'api.line.me',
        port: 443,
        path: '/v2/bot/message/push',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.lineOAToken}`,
          'Content-Length': Buffer.byteLength(data)
        }
      }

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          console.log('📱 Line OA message sent successfully')
          resolve(true)
        })

        req.on('error', (error) => {
          console.error('❌ Error sending Line OA message:', error)
          reject(error)
        })

        req.write(data)
        req.end()
      })
    } catch (error) {
      console.error('❌ Error in Line OA message service:', error)
      throw error
    }
  }

  async getLatestNewsFile() {
    try {
      const newsDir = path.join(__dirname, '../backup/legacy-bots/news')
      const files = await fs.readdir(newsDir)
      const newsFiles = files.filter((file) => file.startsWith('news_') && file.endsWith('.json'))

      if (newsFiles.length === 0) {
        return null
      }

      // Sort by creation time and get the latest
      newsFiles.sort((a, b) => {
        const timeA = a.match(/news_(.+)\.json/)[1]
        const timeB = b.match(/news_(.+)\.json/)[1]
        return timeB.localeCompare(timeA)
      })

      const latestFile = path.join(newsDir, newsFiles[0])
      const content = await fs.readFile(latestFile, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      console.error('❌ Error reading news files:', error)
      return null
    }
  }

  async sendNewsUpdate(userId) {
    try {
      const newsData = await this.getLatestNewsFile()

      if (!newsData) {
        console.log('⚠️ No news data found')
        return false
      }

      const { NewsUpdates, 'Analysis Forecast Scenarios': forecast, 'Trading Decision': trading, timestamp } = newsData

      let message = `📈 Gold Market Update\n\n`

      // Add latest price info
      if (NewsUpdates && NewsUpdates.length > 0) {
        const latest = NewsUpdates[0]
        message += `💰 Current Price: $${latest.spot_price}\n`
        message += `📊 24h Change: ${latest.price_change_direction === 'down' ? '📉' : '📈'} ${latest.price_change_last24hrs_percentage}%\n`
        message += `🎯 Signal: ${latest.signal.toUpperCase()}\n\n`
      }

      // Add trading decision
      if (trading) {
        message += `🎯 Trading Recommendation:\n`
        message += `• Entry: $${trading.entryPoint}\n`
        message += `• Take Profit: $${trading.takeProfit}\n`
        message += `• Stop Loss: $${trading.stopLoss}\n\n`
      }

      // Add forecast (truncated)
      if (forecast) {
        const shortForecast = forecast.length > 200 ? forecast.substring(0, 200) + '...' : forecast
        message += `📊 Analysis:\n${shortForecast}\n\n`
      }

      message += `⏰ Updated: ${new Date(timestamp).toLocaleString()}`

      const sent = await this.sendLineOAMessage(userId, message)
      if (sent) {
        console.log('📰 News update sent via Line OA')
        return true
      } else {
        console.log('⚠️ News update not sent - Line OA not configured')
        return false
      }
    } catch (error) {
      console.error('❌ Error sending news update:', error)
      throw error
    }
  }

  getAlertHistory() {
    return this.alertHistory
  }

  clearAlertHistory() {
    this.alertHistory = []
    console.log('🗑️ Alert history cleared')
  }
}

export default new NotificationService()
