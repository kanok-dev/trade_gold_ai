// Demo script for OpenAI Bot 2 with mock data
import fs from 'fs'
import path from 'path'

// Mock the OpenAI response with the expected format
const mockOpenAIResponse = {
  output_text: JSON.stringify({
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
      },
      {
        category: 'ภูมิรัฐศาสตร์',
        headline: 'สัมพันธ์สหรัฐ-จีนดีขึ้นกดดันทองคำ, นักลงทุนขายทำกำไร',
        sentiment: 'negative',
        impact_reason: 'Safe-haven demand ซา',
        source_ref: 'https://www.bloomberg.com/news/articles/2025-06-30/trade-tension-markets'
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
    key_events_calendar: ['2 ก.ค.: JOLTS US jobs', '2 ก.ค.: Powell @ ECB Forum', '5 ก.ค.: US Nonfarm Payrolls', '11 ก.ค.: US CPI', '30-31 ก.ค.: FOMC'],
    risk_factors: ['Fed กลับ Hawkish มากขึ้น', 'ดอลลาร์แข็งเร็ว เซนติเมนต์รีบาวด์', 'ETF, ธนาคารกลางลดการถือทอง'],
    finalDecision: {
      action: 'HOLD',
      confidence: 63,
      reasoning: 'แม้เทคนิคเริ่มแกว่งพักตัว กระแสธนาคารกลางยังคงหนุน รับแรงขายเก็งกำไรก่อนการประชุม FOMC',
      consensus: 'MAJORITY',
      decisions: [
        {
          source: 'TECHNICAL',
          action: 'SELL',
          weight: 0.3,
          confidence: 55,
          reasoning: 'รูปแบบ descending triangle, แนวรับ $3,280 ถูกทดสอบ'
        },
        {
          source: 'AI',
          action: 'HOLD',
          weight: 0.4,
          confidence: 67,
          reasoning: 'โมเดลยังมอง positive กลาง-ยาว, ระยะสั้นแกว่ง'
        },
        {
          source: 'RISK',
          action: 'HOLD',
          weight: 0.3,
          confidence: 66,
          reasoning: 'FOMC และข้อมูลเงินเฟ้อเป็น game changer'
        }
      ]
    },
    summary_thai:
      'ทองวันนี้เคลื่อนไหว $3,280 ปรับตัวพักฐานในกรอบแคบ ขายทำกำไรก่อนข้อมูลเศรษฐกิจสหรัฐ, FOMC รอบใหม่ สัญญาณเทคนิคแกว่งพัก, ระวังแนวรับ $3,280 หากหลุดอาจลงเร็ว ภาพรวมอุปสงค์ธนาคารกลางและแนวโน้มระยะกลางยังบวก กลยุทธ์: HOLD รอดูข้อมูลใหญ่และความชัดเจนของเฟด'
  })
}

// Import the save functions from the updated bot
async function saveAnalysisData(data) {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Generate filename with current date and time for uniqueness
    const now = new Date()
    const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const timeStamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) // Full timestamp for unique files
    const filename = `demo_analysis_${timestamp}.json`
    const uniqueFilename = `demo_analysis_${timeStamp}.json`
    const filepath = path.join(dataDir, filename)
    const uniqueFilepath = path.join(dataDir, uniqueFilename)

    // Add metadata to the data
    const enrichedData = {
      ...data,
      saved_at: new Date().toISOString(),
      bot_version: 'openAI-bot2-demo',
      data_source: 'Demo Mock Data',
      file_format_version: '2.0'
    }

    // Write data to file (daily file - overwrites if exists)
    fs.writeFileSync(filepath, JSON.stringify(enrichedData, null, 2))
    console.log(`✅ Demo daily analysis saved to: ${filepath}`)

    // Write unique timestamped file for historical tracking
    fs.writeFileSync(uniqueFilepath, JSON.stringify(enrichedData, null, 2))
    console.log(`✅ Demo unique analysis saved to: ${uniqueFilepath}`)

    // Log summary of saved data
    console.log('\n📊 ANALYSIS SUMMARY:')
    if (data.finalDecision) {
      console.log(`🎯 Decision: ${data.finalDecision.action} (Confidence: ${data.finalDecision.confidence}%)`)
    }
    if (data.price_statistics) {
      console.log(`💰 Current Price: $${data.price_statistics.current_spot_usd}`)
      console.log(`📈 Daily Change: ${data.price_statistics.daily_change_pct}%`)
    }
    if (data.summary_thai) {
      console.log(`📝 Summary: ${data.summary_thai.substring(0, 100)}...`)
    }

    return {
      dailyFile: filepath,
      uniqueFile: uniqueFilepath,
      success: true
    }
  } catch (error) {
    console.error('❌ Error saving analysis data:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Demo the bot functionality
async function runDemo() {
  console.log('🎬 OPENAI BOT 2 DEMO - JSON DATA SAVING')
  console.log('=====================================')

  try {
    // Simulate parsing the OpenAI response
    const analysisData = JSON.parse(mockOpenAIResponse.output_text)

    console.log('📥 Received analysis data from OpenAI...')
    console.log(`📊 Price: $${analysisData.price_statistics.current_spot_usd}`)
    console.log(`🎯 Decision: ${analysisData.finalDecision.action}`)
    console.log(`🔥 Confidence: ${analysisData.finalDecision.confidence}%`)

    // Save the data
    const saveResult = await saveAnalysisData(analysisData)

    if (saveResult.success) {
      console.log('\n🎉 Demo completed successfully!')
      console.log('✅ Data has been saved in the expected JSON format')
      console.log('✅ Files created with proper timestamps and metadata')

      // Clean up demo files
      setTimeout(() => {
        try {
          if (fs.existsSync(saveResult.dailyFile)) {
            fs.unlinkSync(saveResult.dailyFile)
          }
          if (fs.existsSync(saveResult.uniqueFile)) {
            fs.unlinkSync(saveResult.uniqueFile)
          }
          console.log('\n🧹 Demo files cleaned up')
        } catch (err) {
          console.log('⚠️ Note: Demo files may need manual cleanup')
        }
      }, 5000)
    } else {
      console.log('❌ Demo failed:', saveResult.error)
    }
  } catch (error) {
    console.error('💥 Demo error:', error.message)
  }
}

// Run the demo
runDemo()
