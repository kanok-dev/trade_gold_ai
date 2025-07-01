// Configuration utility for environment variables
class Config {
  // API Configuration
  static get API_BASE_URL() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
  }

  static get API_TIMEOUT() {
    return parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000
  }

  // Environment
  static get NODE_ENV() {
    return import.meta.env.VITE_NODE_ENV || 'development'
  }

  static get IS_PRODUCTION() {
    return this.NODE_ENV === 'production'
  }

  static get IS_DEVELOPMENT() {
    return this.NODE_ENV === 'development'
  }

  // Application Configuration
  static get APP_NAME() {
    return import.meta.env.VITE_APP_NAME || 'Gold Trading AI'
  }

  static get APP_VERSION() {
    return import.meta.env.VITE_APP_VERSION || '1.0.0'
  }

  static get APP_DESCRIPTION() {
    return import.meta.env.VITE_APP_DESCRIPTION || 'Advanced Gold Trading Bot Dashboard'
  }

  // Feature Flags
  static get ENABLE_DEBUG_LOGS() {
    return import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true'
  }

  static get ENABLE_MOCK_DATA() {
    return import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'
  }

  static get ENABLE_NOTIFICATIONS() {
    return import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false'
  }

  static get ENABLE_REAL_TIME_UPDATES() {
    return import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false'
  }

  // UI Configuration
  static get DEFAULT_THEME() {
    return import.meta.env.VITE_DEFAULT_THEME || 'dark'
  }

  static get AUTO_REFRESH_INTERVAL() {
    return parseInt(import.meta.env.VITE_AUTO_REFRESH_INTERVAL) || 30000
  }

  static get CHART_REFRESH_INTERVAL() {
    return parseInt(import.meta.env.VITE_CHART_REFRESH_INTERVAL) || 5000
  }

  // Trading Configuration
  static get DEFAULT_CURRENCY() {
    return import.meta.env.VITE_DEFAULT_CURRENCY || 'USD'
  }

  static get DEFAULT_GOLD_SYMBOL() {
    return import.meta.env.VITE_DEFAULT_GOLD_SYMBOL || 'XAUUSD'
  }

  static get MAX_TRADE_AMOUNT() {
    return parseFloat(import.meta.env.VITE_MAX_TRADE_AMOUNT) || 10000
  }

  static get MIN_TRADE_AMOUNT() {
    return parseFloat(import.meta.env.VITE_MIN_TRADE_AMOUNT) || 100
  }

  // Security Configuration
  static get ENABLE_CSRF_PROTECTION() {
    return import.meta.env.VITE_ENABLE_CSRF_PROTECTION !== 'false'
  }

  static get SESSION_TIMEOUT() {
    return parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000
  }

  // Analytics & Monitoring
  static get ENABLE_ANALYTICS() {
    return import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }

  static get ANALYTICS_ENDPOINT() {
    return import.meta.env.VITE_ANALYTICS_ENDPOINT || ''
  }

  static get ERROR_REPORTING_ENDPOINT() {
    return import.meta.env.VITE_ERROR_REPORTING_ENDPOINT || ''
  }

  // Utility methods
  static logConfig() {
    if (this.ENABLE_DEBUG_LOGS) {
      console.group('🔧 Application Configuration')
      console.log('Environment:', this.NODE_ENV)
      console.log('API Base URL:', this.API_BASE_URL)
      console.log('API Timeout:', this.API_TIMEOUT)
      console.log('App Name:', this.APP_NAME)
      console.log('App Version:', this.APP_VERSION)
      console.log('Debug Logs:', this.ENABLE_DEBUG_LOGS)
      console.log('Mock Data:', this.ENABLE_MOCK_DATA)
      console.log('Real-time Updates:', this.ENABLE_REAL_TIME_UPDATES)
      console.log('Default Theme:', this.DEFAULT_THEME)
      console.groupEnd()
    }
  }

  static validateConfig() {
    const issues = []

    if (!this.API_BASE_URL) {
      issues.push('VITE_API_BASE_URL is not configured')
    }

    if (this.API_TIMEOUT < 1000) {
      issues.push('VITE_API_TIMEOUT should be at least 1000ms')
    }

    if (this.MIN_TRADE_AMOUNT >= this.MAX_TRADE_AMOUNT) {
      issues.push('VITE_MIN_TRADE_AMOUNT should be less than VITE_MAX_TRADE_AMOUNT')
    }

    if (issues.length > 0) {
      console.warn('⚠️ Configuration Issues:', issues)
    }

    return issues.length === 0
  }
}

export default Config
