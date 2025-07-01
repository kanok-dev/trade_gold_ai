// Notification Service for Line Notify and other alerts
import https from 'https'
import querystring from 'querystring'

export class NotificationService {
  constructor() {
    this.lineToken = process.env.LINE_TOKEN
    this.alertHistory = []
  }

  async sendLineNotification(message) {
    if (!this.lineToken) {
      console.log('⚠️ Line token not configured, skipping notification')
      return false
    }

    try {
      const data = querystring.stringify({
        message: message
      })

      const options = {
        hostname: 'notify-api.line.me',
        port: 443,
        path: '/api/notify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.lineToken}`,
          'Content-Length': Buffer.byteLength(data)
        }
      }

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          console.log('📱 Line notification sent successfully')
          resolve(true)
        })

        req.on('error', (error) => {
          console.error('❌ Error sending Line notification:', error)
          reject(error)
        })

        req.write(data)
        req.end()
      })
    } catch (error) {
      console.error('❌ Error in Line notification service:', error)
      throw error
    }
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

      await this.sendLineNotification(message)

      // Store in history
      this.alertHistory.push({
        ...alertData,
        timestamp: new Date().toISOString(),
        sent: true
      })

      console.log('🚨 Trading alert sent successfully')
      return true
    } catch (error) {
      console.error('❌ Error sending trading alert:', error)
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

      await this.sendLineNotification(formattedMessage)
      console.log(`📢 System alert sent: ${type}`)
      return true
    } catch (error) {
      console.error('❌ Error sending system alert:', error)
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
