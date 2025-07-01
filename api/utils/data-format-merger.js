/**
 * Data Format Merger Utility
 * Merges different analysis data formats into a unified structure for frontend consumption
 */

import fs from 'fs/promises'

class DataFormatMerger {
  constructor() {
    this.standardFormat = {
      timestamp: null,
      data_freshness_minutes: 0,
      source: null,
      unified_analysis: {
        spot_price: null,
        price_change: {
          daily_pct: null,
          weekly_pct: null,
          monthly_pct: null
        },
        technical_indicators: {
          rsi_14: null,
          atr_14: null,
          supports: [],
          resistances: [],
          trend: null,
          momentum: null
        },
        signals: {
          short_term: null,
          medium_term: null,
          long_term: null
        },
        market_sentiment: {
          overall: null,
          summary: null,
          confidence: null
        },
        news_highlights: [],
        forecast_scenarios: {
          short: null,
          medium: null,
          long: null
        },
        key_events: [],
        risk_factors: [],
        final_decision: {
          action: null,
          confidence: null,
          reasoning: null,
          consensus: null
        }
      },
      metadata: {
        bot_version: null,
        data_source: null,
        format_version: '3.0',
        processing_time: null,
        token_usage: null
      }
    }
  }

  /**
   * Merge OpenAI and Claude analysis data into unified format
   * @param {Object} openaiData - Data from latest_analysis.json
   * @param {Object} claudeData - Data from latest_claude_analysis.json
   * @returns {Object} Unified analysis data
   */
  mergeAnalysisData(openaiData = null, claudeData = null) {
    const result = JSON.parse(JSON.stringify(this.standardFormat))

    // Determine primary source and timestamp
    if (openaiData && claudeData) {
      const openaiTime = new Date(openaiData.timestamp || openaiData.saved_at)
      const claudeTime = new Date(claudeData.timestamp)

      // Use more recent data as primary source
      if (claudeTime > openaiTime) {
        result.timestamp = claudeData.timestamp
        result.source = 'claude_primary'
        this._mergeClaudeData(result, claudeData)
        this._mergeOpenAIData(result, openaiData, false) // secondary
      } else {
        result.timestamp = openaiData.timestamp || openaiData.saved_at
        result.source = 'openai_primary'
        this._mergeOpenAIData(result, openaiData, true) // primary
        this._mergeClaudeData(result, claudeData, false) // secondary
      }
    } else if (openaiData) {
      result.timestamp = openaiData.timestamp || openaiData.saved_at
      result.source = 'openai_only'
      this._mergeOpenAIData(result, openaiData, true)
    } else if (claudeData) {
      result.timestamp = claudeData.timestamp
      result.source = 'claude_only'
      this._mergeClaudeData(result, claudeData, true)
    }

    // Calculate data freshness
    if (result.timestamp) {
      const now = new Date()
      const dataTime = new Date(result.timestamp)
      result.data_freshness_minutes = Math.floor((now - dataTime) / (1000 * 60))
    }

    return result
  }

  /**
   * Merge OpenAI structured data
   * @param {Object} result - Target unified format
   * @param {Object} data - OpenAI data
   * @param {Boolean} isPrimary - Whether this is the primary source
   */
  _mergeOpenAIData(result, data, isPrimary = true) {
    if (!data) return

    const analysis = result.unified_analysis

    // Spot price verification
    if (data.spot_price_verification?.sources?.length > 0) {
      const latestPrice = data.spot_price_verification.sources[0]
      if (isPrimary || !analysis.spot_price) {
        analysis.spot_price = {
          value: latestPrice.spot,
          timestamp: latestPrice.timestamp,
          source: latestPrice.name,
          url: latestPrice.url,
          spread_ok: data.spot_price_verification.spread_ok,
          spread_value: data.spot_price_verification.spread_value
        }
      }
    }

    // Price statistics
    if (data.price_statistics) {
      if (isPrimary || !analysis.price_change.daily_pct) {
        analysis.price_change.daily_pct = data.price_statistics.change_DD_pct
        analysis.price_change.weekly_pct = data.price_statistics.change_WW_pct
      }
    }

    // Technical analysis
    if (data.technical_analysis) {
      if (isPrimary || analysis.technical_indicators.supports.length === 0) {
        analysis.technical_indicators.supports = data.technical_analysis.supports || []
        analysis.technical_indicators.resistances = data.technical_analysis.resistances || []
        analysis.technical_indicators.momentum = data.technical_analysis.momentum
      }

      if (isPrimary || !analysis.signals.short_term) {
        analysis.signals.short_term = data.technical_analysis.short_signal
        analysis.signals.medium_term = data.technical_analysis.mid_signal
        analysis.signals.long_term = data.technical_analysis.long_signal
      }
    }

    // Market sentiment
    if (data.market_sentiment) {
      if (isPrimary || !analysis.market_sentiment.overall) {
        analysis.market_sentiment.overall = data.market_sentiment.overall
        analysis.market_sentiment.summary = data.market_sentiment.summary
      }
    }

    // News highlights
    if (data.news_highlights && Array.isArray(data.news_highlights)) {
      analysis.news_highlights = analysis.news_highlights.concat(
        data.news_highlights.map((news) => ({
          timestamp: news.time,
          headline: news.headline,
          sentiment: news.sentiment,
          reason: news.reason,
          source: news.source,
          url: news.url,
          origin: 'openai'
        }))
      )
    }

    // Forecast scenarios
    if (data.forecast_scenarios) {
      if (isPrimary || !analysis.forecast_scenarios.short) {
        analysis.forecast_scenarios = {
          short: data.forecast_scenarios.short,
          medium: data.forecast_scenarios.mid,
          long: data.forecast_scenarios.long
        }
      }
    }

    // Key events
    if (data.key_events_calendar && Array.isArray(data.key_events_calendar)) {
      analysis.key_events = analysis.key_events.concat(
        data.key_events_calendar.map((event) => ({
          date: event.date,
          event: event.event,
          impact: event.impact,
          origin: 'openai'
        }))
      )
    }

    // Risk factors
    if (data.risk_factors && Array.isArray(data.risk_factors)) {
      analysis.risk_factors = analysis.risk_factors.concat(
        data.risk_factors.map((risk) => ({
          factor: risk,
          origin: 'openai'
        }))
      )
    }

    // Final decision
    if (data.finalDecision) {
      if (isPrimary || !analysis.final_decision.action) {
        analysis.final_decision = {
          action: data.finalDecision.action,
          confidence: data.finalDecision.confidence,
          reasoning: data.finalDecision.reasoning,
          consensus: data.finalDecision.consensus,
          decisions: data.finalDecision.decisions || []
        }
      }
    }

    // Metadata
    if (isPrimary || !result.metadata.bot_version) {
      result.metadata.bot_version = data.bot_version
      result.metadata.data_source = data.data_source
    }
  }

  /**
   * Merge Claude response data
   * @param {Object} result - Target unified format
   * @param {Object} data - Claude data
   * @param {Boolean} isPrimary - Whether this is the primary source
   */
  _mergeClaudeData(result, data, isPrimary = true) {
    if (!data?.response?.content) return

    const analysis = result.unified_analysis
    const content = data.response.content

    // Extract web search results for news
    const webSearchResults = this._extractWebSearchResults(content)
    if (webSearchResults.length > 0 && (isPrimary || analysis.news_highlights.length === 0)) {
      analysis.news_highlights = analysis.news_highlights.concat(
        webSearchResults.map((result) => ({
          timestamp: data.timestamp,
          headline: result.title,
          sentiment: this._analyzeSentiment(result.title),
          reason: 'Web search result from Claude analysis',
          source: this._extractDomain(result.url),
          url: result.url,
          origin: 'claude'
        }))
      )
    }

    // Extract Claude's final text analysis
    const textContent = this._extractTextContent(content)
    if (textContent && (isPrimary || !analysis.market_sentiment.summary)) {
      analysis.market_sentiment.summary = textContent
      analysis.market_sentiment.overall = this._extractSentimentFromText(textContent)
    }

    // Token usage metadata
    if (data.token_usage) {
      result.metadata.token_usage = data.token_usage
    }

    // Model information
    if (data.response.model && (isPrimary || !result.metadata.data_source)) {
      result.metadata.data_source = data.response.model
    }
  }

  /**
   * Extract web search results from Claude content
   * @param {Array} content - Claude response content array
   * @returns {Array} Web search results
   */
  _extractWebSearchResults(content) {
    const results = []

    for (const item of content) {
      if (item.type === 'web_search_tool_result' && item.content) {
        for (const searchResult of item.content) {
          if (searchResult.type === 'web_search_result') {
            results.push({
              title: searchResult.title,
              url: searchResult.url,
              page_age: searchResult.page_age
            })
          }
        }
      }
    }

    return results
  }

  /**
   * Extract text content from Claude response
   * @param {Array} content - Claude response content array
   * @returns {String} Extracted text
   */
  _extractTextContent(content) {
    const textParts = []

    for (const item of content) {
      if (item.type === 'text' && item.text) {
        textParts.push(item.text)
      }
    }

    return textParts.join('\n\n')
  }

  /**
   * Simple sentiment analysis based on keywords
   * @param {String} text - Text to analyze
   * @returns {String} Sentiment (Positive, Negative, Neutral)
   */
  _analyzeSentiment(text) {
    const positive = ['rises', 'gains', 'up', 'bullish', 'strong', 'high', 'surge', 'rally']
    const negative = ['falls', 'drops', 'down', 'bearish', 'weak', 'low', 'decline', 'crash']

    const lowerText = text.toLowerCase()
    const positiveCount = positive.filter((word) => lowerText.includes(word)).length
    const negativeCount = negative.filter((word) => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return 'Positive'
    if (negativeCount > positiveCount) return 'Negative'
    return 'Neutral'
  }

  /**
   * Extract sentiment from text analysis
   * @param {String} text - Text to analyze
   * @returns {String} Overall sentiment
   */
  _extractSentimentFromText(text) {
    const bearishIndicators = ['bearish', 'sell', 'decline', 'fall', 'negative', 'down']
    const bullishIndicators = ['bullish', 'buy', 'rise', 'increase', 'positive', 'up']

    const lowerText = text.toLowerCase()
    const bearishCount = bearishIndicators.filter((word) => lowerText.includes(word)).length
    const bullishCount = bullishIndicators.filter((word) => lowerText.includes(word)).length

    if (bullishCount > bearishCount) return 'Positive'
    if (bearishCount > bullishCount) return 'Negative'
    return 'Neutral'
  }

  /**
   * Extract domain from URL
   * @param {String} url - URL to extract domain from
   * @returns {String} Domain name
   */
  _extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Load and merge data from files
   * @param {String} openaiPath - Path to OpenAI analysis file
   * @param {String} claudePath - Path to Claude analysis file
   * @returns {Object} Merged analysis data
   */
  async loadAndMergeFiles(openaiPath, claudePath) {
    let openaiData = null
    let claudeData = null

    try {
      if (openaiPath) {
        const openaiContent = await fs.readFile(openaiPath, 'utf8')
        openaiData = JSON.parse(openaiContent)
      }
    } catch (error) {
      console.warn('Could not load OpenAI data:', error.message)
    }

    try {
      if (claudePath) {
        const claudeContent = await fs.readFile(claudePath, 'utf8')
        claudeData = JSON.parse(claudeContent)
      }
    } catch (error) {
      console.warn('Could not load Claude data:', error.message)
    }

    return this.mergeAnalysisData(openaiData, claudeData)
  }

  /**
   * Save merged data to file
   * @param {Object} mergedData - Merged analysis data
   * @param {String} outputPath - Output file path
   */
  async saveMergedData(mergedData, outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(mergedData, null, 2), 'utf8')
  }
}

export { DataFormatMerger }
