// Configuration for Gold Trading Bot
export const config = {
  // Gemini CLI settings
  gemini: {
    model: 'gemini-2.5-pro', // Can be changed via -m flag
    timeout: 30000 // 30 seconds timeout for CLI calls
  },

  // News sources for web_fetch tool
  newsSources: ['https://www.reuters.com/markets/commodities/', 'https://www.bloomberg.com/news/topics/gold', 'https://www.investing.com/commodities/gold', 'https://www.marketwatch.com/investing/metal/gold', 'https://www.cnbc.com/quotes/XAU='],

  // Search queries for google_web_search tool
  searchQueries: ['latest Federal Reserve decision impact on gold prices XAU/USD trading', 'gold price forecast Fed meeting minutes', 'XAU/USD technical analysis today Reuters Bloomberg', 'central bank gold reserves policy changes'],

  // Line Notify settings
  lineNotify: {
    url: 'https://notify-api.line.me/api/notify',
    maxMessageLength: 1000 // Line Notify message limit
  },

  // Trading analysis parameters
  analysis: {
    timeframes: ['short-term', 'medium-term', 'long-term'],
    riskLevels: ['low', 'medium', 'high'],
    signals: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']
  },

  // Scheduling settings
  schedule: {
    interval: 300000, // 5 minutes in milliseconds
    maxRetries: 3,
    retryDelay: 5000 // 5 seconds
  }
}
