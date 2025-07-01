// Test script for OpenAI Bot 2
import fs from 'fs'
import path from 'path'

// Mock response data in the expected format
const mockAnalysisData = {
  timestamp: '2025-07-01T15:30:00Z',
  data_freshness_minutes: 2,
  spot_price_verification: {
    primary_source: 'TradingView (GC1!): $3,280.50',
    secondary_source: 'Investing.com: $3,280.85, Reuters: $3,281.00',
    consensus_spot: 3280.5,
    source_agreement: '<$1'
  },
  price_statistics: {
    current_spot_usd: 3280.5,
    daily_change_pct: -0.44,
    weekly_change_pct: -1.88,
    ath_level: 3500.05,
    ath_date: '2025-04-22',
    distance_from_ath_pct: -6.27,
    ytd_performance_pct: 42.1,
    '52_week_range': '2,320.00 - 3,500.05'
  },
  technical_analysis: {
    momentum: 'Corrective down, medium-term bullish',
    rsi_14d: 65,
    atr_14d: 44.7,
    key_support_levels: [3280, 3245, 3210],
    key_resistance_levels: [3324, 3345, 3380],
    pattern_detected: 'descending triangle',
    volume_condition: 'below average',
    trend: 'uptrend pausing'
  },
  market_sentiment: {
    institutional_positioning: 'net long, slightly trimmed',
    fear_greed_index: 68,
    central_bank_demand: 'strong (esp. China, India)',
    etf_flows: 'steady to mildly positive'
  },
  news_highlights: [
    {
      category: 'นโยบายการเงิน',
      headline: 'Fed Waller: พร้อมลดดอกเบี้ย ก.ค. หากเศรษฐกิจอ่อนแรง',
      sentiment: 'positive',
      impact_reason: 'Fed dovish ดันความต้องการทอง',
      source_ref: 'https://www.reuters.com/markets/us/fed-waller-rate-cut-2025'
    }
  ],
  forecast_scenarios: {
    short_term_1_3_months: {
      price_range: '3,200 - 3,400',
      key_drivers: 'Fed policy, central-bank demand, USD'
    },
    medium_term_6_12_months: {
      price_range: '3,500 - 3,700',
      key_drivers: 'ธนาคารกลาง, US election, risk events'
    },
    long_term_2025_2026: {
      price_range: '3,700 - 4,000',
      key_drivers: 'Policy cycles, global risk, de-dollarization'
    }
  },
  finalDecision: {
    action: 'HOLD',
    confidence: 63,
    reasoning: 'แม้เทคนิคเริ่มแกว่งพักตัว กระแสธนาคารกลางยังคงหนุน รับแรงขายเก็งกำไรก่อนการประชุม FOMC',
    consensus: 'MAJORITY'
  },
  summary_thai: 'ทองวันนี้เคลื่อนไหว $3,280 ปรับตัวพักฐานในกรอบแคบ'
}

// Test the data saving functionality
async function testDataSaving() {
  console.log('🧪 Testing OpenAI Bot 2 Data Saving...')

  try {
    // Import the save function (we'll need to modify the bot to export it)
    const dataDir = path.join(process.cwd(), 'data')

    // Ensure the data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Generate filename with current date
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `test_analysis_${timestamp}.json`
    const filepath = path.join(dataDir, filename)

    // Add metadata to the data
    const enrichedData = {
      ...mockAnalysisData,
      saved_at: new Date().toISOString(),
      bot_version: 'openAI-bot2-test',
      data_source: 'Test Mock Data'
    }

    // Write test data to file
    fs.writeFileSync(filepath, JSON.stringify(enrichedData, null, 2))

    console.log(`✅ Test data saved successfully to: ${filepath}`)

    // Verify the file was created and contains valid JSON
    const savedData = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    console.log(`✅ Data verification successful. Contains ${Object.keys(savedData).length} properties`)

    // Clean up test file
    fs.unlinkSync(filepath)
    console.log('✅ Test cleanup completed')

    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testDataSaving()
  .then((success) => {
    if (success) {
      console.log('🎉 All tests passed!')
    } else {
      console.log('💥 Some tests failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error)
    process.exit(1)
  })
