#!/usr/bin/env node

/**
 * Test Script for Data Format Merger
 * Demonstrates the functionality of merging different analysis data formats
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { DataFormatMerger } from './data-format-merger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testDataMerger() {
  console.log('🧪 Testing Data Format Merger\n')

  const merger = new DataFormatMerger()

  const openaiPath = path.join(__dirname, '../data/latest_analysis.json')
  const claudePath = path.join(__dirname, '../data/latest_claude_analysis.json')

  try {
    console.log('📂 Loading analysis files...')
    console.log(`   OpenAI: ${openaiPath}`)
    console.log(`   Claude: ${claudePath}\n`)

    // Test merging
    const startTime = Date.now()
    const mergedData = await merger.loadAndMergeFiles(openaiPath, claudePath)
    const processingTime = Date.now() - startTime

    console.log('✅ Merge completed successfully!')
    console.log(`⏱️  Processing time: ${processingTime}ms\n`)

    // Display results
    console.log('📊 Merged Data Summary:')
    console.log('═══════════════════════════════════════════════════════════════')

    console.log(`🕐 Timestamp: ${mergedData.timestamp}`)
    console.log(`📡 Source: ${mergedData.source}`)
    console.log(`⏰ Data freshness: ${mergedData.data_freshness_minutes} minutes\n`)

    const analysis = mergedData.unified_analysis

    // Current price
    if (analysis.spot_price) {
      console.log('💰 Current Price Information:')
      console.log(`   Price: $${analysis.spot_price.value}`)
      console.log(`   Source: ${analysis.spot_price.source}`)
      console.log(`   Spread OK: ${analysis.spot_price.spread_ok ? 'Yes' : 'No'}\n`)
    }

    // Price changes
    if (analysis.price_change.daily_pct !== null || analysis.price_change.weekly_pct !== null) {
      console.log('📈 Price Changes:')
      if (analysis.price_change.daily_pct !== null) {
        console.log(`   Daily: ${analysis.price_change.daily_pct > 0 ? '+' : ''}${analysis.price_change.daily_pct}%`)
      }
      if (analysis.price_change.weekly_pct !== null) {
        console.log(`   Weekly: ${analysis.price_change.weekly_pct > 0 ? '+' : ''}${analysis.price_change.weekly_pct}%`)
      }
      console.log()
    }

    // Technical indicators
    if (analysis.technical_indicators) {
      console.log('🔍 Technical Analysis:')
      if (analysis.technical_indicators.supports.length > 0) {
        console.log(`   Support levels: $${analysis.technical_indicators.supports.join(', $')}`)
      }
      if (analysis.technical_indicators.resistances.length > 0) {
        console.log(`   Resistance levels: $${analysis.technical_indicators.resistances.join(', $')}`)
      }
      if (analysis.technical_indicators.momentum) {
        console.log(`   Momentum: ${analysis.technical_indicators.momentum}`)
      }
      console.log()
    }

    // Trading signals
    if (analysis.signals) {
      console.log('🎯 Trading Signals:')
      if (analysis.signals.short_term) console.log(`   Short-term: ${analysis.signals.short_term}`)
      if (analysis.signals.medium_term) console.log(`   Medium-term: ${analysis.signals.medium_term}`)
      if (analysis.signals.long_term) console.log(`   Long-term: ${analysis.signals.long_term}`)
      console.log()
    }

    // Final recommendation
    if (analysis.final_decision && analysis.final_decision.action) {
      console.log('🎲 Final Recommendation:')
      console.log(`   Action: ${analysis.final_decision.action}`)
      console.log(`   Confidence: ${analysis.final_decision.confidence}%`)
      console.log(`   Reasoning: ${analysis.final_decision.reasoning}`)
      console.log()
    }

    // Market sentiment
    if (analysis.market_sentiment && analysis.market_sentiment.overall) {
      console.log('📊 Market Sentiment:')
      console.log(`   Overall: ${analysis.market_sentiment.overall}`)
      if (analysis.market_sentiment.summary) {
        console.log(`   Summary: ${analysis.market_sentiment.summary.substring(0, 100)}...`)
      }
      console.log()
    }

    // News highlights
    if (analysis.news_highlights && analysis.news_highlights.length > 0) {
      console.log('📰 News Highlights:')
      analysis.news_highlights.slice(0, 3).forEach((news, index) => {
        console.log(`   ${index + 1}. [${news.sentiment}] ${news.headline}`)
        console.log(`      Source: ${news.source} (${news.origin})`)
      })
      if (analysis.news_highlights.length > 3) {
        console.log(`   ... and ${analysis.news_highlights.length - 3} more news items`)
      }
      console.log()
    }

    // Key events
    if (analysis.key_events && analysis.key_events.length > 0) {
      console.log('📅 Upcoming Key Events:')
      analysis.key_events.slice(0, 3).forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.date}: ${event.event} (${event.impact} impact)`)
      })
      console.log()
    }

    // Risk factors
    if (analysis.risk_factors && analysis.risk_factors.length > 0) {
      console.log('⚠️  Risk Factors:')
      analysis.risk_factors.slice(0, 3).forEach((risk, index) => {
        const factor = typeof risk === 'string' ? risk : risk.factor
        console.log(`   ${index + 1}. ${factor}`)
      })
      console.log()
    }

    // Metadata
    console.log('🔧 Metadata:')
    console.log(`   Format version: ${mergedData.metadata.format_version}`)
    console.log(`   Bot version: ${mergedData.metadata.bot_version || 'N/A'}`)
    console.log(`   Data source: ${mergedData.metadata.data_source || 'N/A'}`)
    if (mergedData.metadata.token_usage) {
      console.log(`   Token usage: ${JSON.stringify(mergedData.metadata.token_usage)}`)
    }

    console.log('\n═══════════════════════════════════════════════════════════════')

    // Save test output
    const outputPath = path.join(__dirname, '../data/test_unified_analysis.json')
    await merger.saveMergedData(mergedData, outputPath)
    console.log(`💾 Test output saved to: ${outputPath}`)

    console.log('\n✅ All tests completed successfully!')

    // Test schema
    console.log('\n🔍 Testing Schema:')
    console.log('───────────────────────')
    const schema = merger.standardFormat
    console.log(`Schema version: ${schema.metadata.format_version}`)
    console.log('Available data fields:')
    console.log('  - timestamp, source, data_freshness_minutes')
    console.log('  - unified_analysis.spot_price')
    console.log('  - unified_analysis.price_change')
    console.log('  - unified_analysis.technical_indicators')
    console.log('  - unified_analysis.signals')
    console.log('  - unified_analysis.market_sentiment')
    console.log('  - unified_analysis.news_highlights')
    console.log('  - unified_analysis.forecast_scenarios')
    console.log('  - unified_analysis.key_events')
    console.log('  - unified_analysis.risk_factors')
    console.log('  - unified_analysis.final_decision')
    console.log('  - metadata')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testDataMerger()
}

export { testDataMerger }
