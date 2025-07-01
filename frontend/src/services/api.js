import Config from './config.js'

// API service for communicating with backend
class ApiService {
  constructor() {
    this.baseURL = Config.API_BASE_URL
    this.timeout = Config.API_TIMEOUT
    this.enableDebugLogs = Config.ENABLE_DEBUG_LOGS

    // Validate configuration on startup
    Config.validateConfig()
    Config.logConfig()
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      if (this.enableDebugLogs) {
        console.log(`🌐 API Request: ${url}`)
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (this.enableDebugLogs) {
        console.log(`✅ API Response: ${url}`, data)
      }

      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏰ API request timeout for ${endpoint}`)
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }
      console.error(`❌ API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Test API connection
  async testConnection() {
    return this.makeRequest('/api/analysis/latest')
  }

  // Analysis endpoints
  async getLatestAnalysis() {
    return this.makeRequest('/api/analysis/latest')
  }

  async getMarketData() {
    return this.makeRequest('/api/analysis/market')
  }

  async getHistoricalData(days = 7) {
    return this.makeRequest(`/api/analysis/history?days=${days}`)
  }

  // New endpoint for OpenAI Bot 2 analysis data
  async getOpenAIAnalysis() {
    try {
      // In development, try static file first
      console.log('📡 Loading analysis data from static file...')
      const response = await fetch('/data/latest_analysis.json')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Successfully loaded static analysis data')
        return data
      }
      throw new Error('Static data file not found')
    } catch (error) {
      console.log('📡 Static file failed, trying API server...')
      // Fallback to API server
      try {
        return await this.makeRequest('/data/latest_analysis.json')
      } catch (apiError) {
        console.log('⚠️ Could not load OpenAI analysis data from either source')
        console.error('Static file error:', error.message)
        console.error('API error:', apiError.message)
        return null
      }
    }
  }

  // Get specific analysis file
  async getAnalysisFile(filename) {
    return this.makeRequest(`/data/${filename}`)
  }

  // Portfolio endpoints
  async getPortfolioStatus() {
    return this.makeRequest('/api/portfolio/status')
  }

  async rebalancePortfolio(goldAllocation, cashAllocation) {
    return this.makeRequest('/api/portfolio/rebalance', {
      method: 'POST',
      body: JSON.stringify({ goldAllocation, cashAllocation })
    })
  }

  // Trading endpoints
  async executeTrade(action, amount, symbol = 'GOLD') {
    return this.makeRequest('/api/trading/execute', {
      method: 'POST',
      body: JSON.stringify({ action, amount, symbol })
    })
  }

  async getTradeHistory() {
    return this.makeRequest('/api/trading/history')
  }

  // Legacy endpoints (for backward compatibility)
  async triggerAnalysis() {
    return this.makeRequest('/api/trigger-analysis', {
      method: 'POST'
    })
  }

  async getCurrentAnalysis() {
    return this.makeRequest('/api/current-analysis')
  }

  async getPerformanceData() {
    return this.makeRequest('/api/performance')
  }

  async getAlerts() {
    return this.makeRequest('/api/alerts')
  }

  async updateSettings(settings) {
    return this.makeRequest('/api/update-settings', {
      method: 'POST',
      body: JSON.stringify({ settings })
    })
  }
}

// Create and export the API service instance
const apiService = new ApiService()

// Default export
export default apiService
