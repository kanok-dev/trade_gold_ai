import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Gold Trading AI Analysis with Web Search
async function analyzeGoldMarket() {
  try {
    console.log('🏆 GOLD TRADING AI ANALYSIS WITH WEB SEARCH')
    console.log('===========================================')

    // Load previous analysis for comparison
    const previousAnalysis = await loadPreviousAnalysis()

    const response = await openai.responses.create({
      prompt: {
        id: 'pmpt_686366e69ff88196ac17df77842185d009266d0bde278e59',
        version: '6'
      },
      input: [
        {
          id: 'ws_6863867ec5ec819f9aff0613c8d3a9c905eb3d62d2202951',
          type: 'web_search_call',
          status: 'completed',
          action: {
            type: 'search',
            query: 'XAU/USD spot gold price now'
          }
        },
        {
          id: 'msg_686386808f3c819fa10920d38288d2c005eb3d62d2202951',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: '{\n  "timestamp": "2025-07-01T06:55:58Z",\n  "data_freshness_minutes": 0,\n  "spot_price_verification": {\n    "sources": [\n      {\n        "name": "XAU Today",\n        "spot": 3374.27,\n        "timestamp": "2025-07-01T04:30:00Z",\n        "url": "https://xau.today/"\n      },\n      {\n        "name": "Investing.com",\n        "spot": 3274.25,\n        "timestamp": "2025-06-27T17:00:00Z",\n        "url": "https://www.investing.com/currencies/xau-usd"\n      }\n    ],\n    "spread_ok": false,\n    "spread_value": 100.02,\n    "reason": "ราคาจากแหล่งข้อมูลต่างกันมากกว่า $1/oz"\n  },\n  "price_statistics": {\n    "change_DD_pct": -0.64,\n    "change_WW_pct": -1.59,\n    "days_from_ATH": 0,\n    "ath_value": 3500.33,\n    "ath_date": "2025-06-27T00:00:00Z",\n    "ATR_14": "N/A",\n    "RSI_14": "N/A"\n  },\n  "technical_analysis": {\n    "supports": [\n      3300,\n      3250\n    ],\n    "resistances": [\n      3400,\n      3450\n    ],\n    "patterns": [\n      {\n        "pattern": "Descending Triangle",\n        "found": true,\n        "details": "ราคาทองคำกำลังสร้างรูปแบบสามเหลี่ยมขาลง โดยมีแนวรับที่ $3,300 และแนวต้านที่ $3,400"\n      }\n    ],\n    "momentum": "Negative",\n    "short_signal": "Sell",\n    "mid_signal": "Neutral",\n    "long_signal": "Buy"\n  },\n  "market_sentiment": {\n    "overall": "Negative",\n    "summary": "ความไม่แน่นอนเกี่ยวกับนโยบายภาษีของสหรัฐฯ และค่าเงินดอลลาร์ที่อ่อนค่าลงส่งผลให้ราคาทองคำปรับตัวขึ้น"\n  },\n  "news_highlights": [\n    {\n      "time": "2025-07-01T04:40:23Z",\n      "headline": "ราคาทองคำปรับตัวขึ้นจากค่าเงินดอลลาร์ที่อ่อนค่าลงและความไม่แน่นอนเกี่ยวกับภาษี",\n      "sentiment": "Positive",\n      "reason": "ค่าเงินดอลลาร์ที่อ่อนค่าลงทำให้ทองคำมีความน่าสนใจมากขึ้น",\n      "source": "Reuters",\n      "url": "https://www.reuters.com/world/india/gold-rises-weaker-dollar-tariff-uncertainty-before-deadline-2025-07-01/"\n    }\n  ],\n  "forecast_scenarios": {\n    "short": "ราคาทองคำอาจปรับตัวลงสู่แนวรับที่ $3,300 หากความไม่แน่นอนทางเศรษฐกิจลดลง",\n    "mid": "ราคาทองคำมีแนวโน้มเคลื่อนไหวในกรอบ $3,300 - $3,400 ตามปัจจัยเศรษฐกิจและการเมือง",\n    "long": "ราคาทองคำอาจปรับตัวขึ้นสู่ระดับสูงสุดใหม่หากมีความไม่แน่นอนทางเศรษฐกิจและการเมืองเพิ่มขึ้น"\n  },\n  "key_events_calendar": [\n    {\n      "date": "2025-07-04",\n      "event": "รายงานการจ้างงานนอกภาคเกษตรของสหรัฐฯ",\n      "impact": "High"\n    },\n    {\n      "date": "2025-07-09",\n      "event": "กำหนดเส้นตายการปรับขึ้นภาษีของสหรัฐฯ",\n      "impact": "High"\n    }\n  ],\n  "risk_factors": [\n    "ความไม่แน่นอนเกี่ยวกับนโยบายภาษีของสหรัฐฯ",\n    "ความผันผวนของค่าเงินดอลลาร์สหรัฐฯ",\n    "ความตึงเครียดทางการเมืองระหว่างประเทศ"\n  ],\n  "finalDecision": {\n    "action": "HOLD",\n    "confidence": 70,\n    "reasoning": "ราคาทองคำมีแนวโน้มเคลื่อนไหวในกรอบแคบ โดยมีปัจจัยเสี่ยงที่ต้องติดตาม",\n    "consensus": "MAJORITY",\n    "decisions": [\n      {\n        "source": "TECHNICAL",\n        "action": "SELL",\n        "weight": 0.4,\n        "confidence": 60,\n        "reasoning": "รูปแบบสามเหลี่ยมขาลงและโมเมนตัมเชิงลบ"\n      },\n      {\n        "source": "AI",\n        "action": "HOLD",\n        "weight": 0.3,\n        "confidence": 70,\n        "reasoning": "ความไม่แน่นอนทางเศรษฐกิจและการเมือง"\n      },\n      {\n        "source": "RISK",\n        "action": "BUY",\n        "weight": 0.3,\n        "confidence": 80,\n        "reasoning": "ความเสี่ยงทางเศรษฐกิจและการเมืองที่เพิ่มขึ้น"\n      }\n    ]\n  },\n  "summary_thai": "ราคาทองคำปัจจุบันอยู่ที่ $3,374.27 ต่อออนซ์ ลดลง 0.64% จากวันก่อนหน้า และลดลง 1.59% จากสัปดาห์ก่อนหน้า ราคาสูงสุดตลอดกาลล่าสุดอยู่ที่ $3,500.33 เมื่อวันที่ 27 มิถุนายน 2025\\n\\n**ข่าวสำคัญ:**\\n- ราคาทองคำปรับตัวขึ้นจากค่าเงินดอลลาร์ที่อ่อนค่าลงและความไม่แน่นอนเกี่ยวกับภาษี\\n\\n**แนวโน้มทางเทคนิค:**\\n- ราคาทองคำกำลังสร้างรูปแบบสามเหลี่ยมขาลง โดยมีแนวรับที่ $3,300 และแนวต้านที่ $3,400 โมเมนตัมเป็นเชิงลบ\\n\\n**กลยุทธ์การลงทุน:**\\n- **ระยะสั้น:** ราคาทองคำอาจปรับตัวลงสู่แนวรับที่ $3,300 หากความไม่แน่นอนทางเศรษฐกิจลดลง\\n- **ระยะกลาง:** ราคาทองคำมีแนวโน้มเคลื่อนไหวในกรอบ $3,300 - $3,400 ตามปัจจัยเศรษฐกิจและการเมือง\\n- **ระยะยาว:** ราคาทองคำอาจปรับตัวขึ้นสู่ระดับสูงสุดใหม่หากมีความไม่แน่นอนทางเศรษฐกิจและการเมืองเพิ่มขึ้น\\n\\n**ปฏิทินเหตุการณ์สำคัญ:**\\n- 4 กรกฎาคม 2025: รายงานการจ้างงานนอกภาคเกษตรของสหรัฐฯ\\n- 9 กรกฎาคม 2025: กำหนดเส้นตายการปรับขึ้นภาษีของสหรัฐฯ\\n\\n**คำแนะนำการลงทุน:** ถือครอง (HOLD) ด้วยความเชื่อมั่น 70% เนื่องจากราคาทองคำมีแนวโน้มเคลื่อนไหวในกรอบแคบ โดยมีปัจจัยเสี่ยงที่ต้องติดตาม"\n}'
            }
          ]
        }
      ],
      reasoning: {},
      tools: [
        {
          type: 'web_search_preview',
          user_location: {
            type: 'approximate',
            country: 'US'
          },
          search_context_size: 'medium'
        }
      ],
      max_output_tokens: 2048,
      store: true
    })
    // Assume response is JSON format as specified
    let analysisData
    try {
      // Parse the response assuming it's JSON format
      let responseText = typeof response.output_text === 'string' ? response.output_text : JSON.stringify(response.output_text)

      // Clean up markdown code blocks if present
      if (responseText.includes('```json')) {
        responseText = responseText.replace(/```json\s*\n?/g, '').replace(/\n?\s*```/g, '')
      }

      // Also handle plain ``` blocks
      if (responseText.includes('```')) {
        responseText = responseText.replace(/```\s*\n?/g, '').replace(/\n?\s*```/g, '')
      }

      analysisData = JSON.parse(responseText.trim())

      console.log(JSON.stringify(analysisData, null, 2))

      // Save data to the data directory
      const saveResult = await saveAnalysisData(analysisData)

      if (saveResult.success) {
        console.log('\n🎉 Analysis completed and saved successfully!')

        // Compare with previous analysis if available
        if (previousAnalysis && previousAnalysis.price_statistics && analysisData.price_statistics) {
          const priceDiff = analysisData.price_statistics.current_spot_usd - previousAnalysis.price_statistics.current_spot_usd
          const priceDiffPct = ((priceDiff / previousAnalysis.price_statistics.current_spot_usd) * 100).toFixed(2)
          console.log(`\n📊 PRICE COMPARISON:`)
          console.log(`Previous: $${previousAnalysis.price_statistics.current_spot_usd}`)
          console.log(`Current: $${analysisData.price_statistics.current_spot_usd}`)
          console.log(`Change: $${priceDiff.toFixed(2)} (${priceDiffPct}%)`)
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:', parseError.message)
      console.log('Raw response:', response.output_text)

      // Save raw response for debugging
      const errorData = {
        timestamp: new Date().toISOString(),
        error: 'JSON parsing failed',
        raw_response: response.output_text,
        bot_version: 'openAI-bot2',
        data_source: 'OpenAI GPT-4.1 (Error)'
      }

      const errorPath = path.join(process.cwd(), 'data', `error_${new Date().toISOString().split('T')[0]}.json`)
      fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2))
      console.log(`⚠️ Error response saved to: ${errorPath}`)

      return
    }
  } catch (error) {
    console.error('❌ Error analyzing gold market:', error.message)

    // Save error for debugging
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      bot_version: 'openAI-bot2',
      data_source: 'OpenAI GPT-4.1 (API Error)'
    }

    const errorPath = path.join(process.cwd(), 'data', `api_error_${new Date().toISOString().split('T')[0]}.json`)
    fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2))
    console.log(`⚠️ API error saved to: ${errorPath}`)
  }
}

// Function to save analysis data to the data directory
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
    const filename = `analysis_${timestamp}.json`
    const uniqueFilename = `analysis_${timeStamp}.json`
    const filepath = path.join(dataDir, filename)
    const uniqueFilepath = path.join(dataDir, uniqueFilename)

    // Add metadata to the data
    const enrichedData = {
      ...data,
      saved_at: new Date().toISOString(),
      bot_version: 'openAI-bot2',
      data_source: 'OpenAI GPT-4.1',
      file_format_version: '2.0'
    }

    // Write data to file (daily file - overwrites if exists)
    fs.writeFileSync(filepath, JSON.stringify(enrichedData, null, 2))
    console.log(`✅ Daily analysis saved to: ${filepath}`)

    // Write unique timestamped file for historical tracking
    fs.writeFileSync(uniqueFilepath, JSON.stringify(enrichedData, null, 2))
    console.log(`✅ Unique analysis saved to: ${uniqueFilepath}`)

    // Also save latest analysis for quick access
    const latestPath = path.join(dataDir, 'latest_analysis.json')
    fs.writeFileSync(latestPath, JSON.stringify(enrichedData, null, 2))
    console.log(`✅ Latest analysis updated: ${latestPath}`)

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
      latestFile: latestPath,
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

// Function to load previous analysis for comparison
async function loadPreviousAnalysis() {
  try {
    const latestPath = path.join(process.cwd(), 'data', 'latest_analysis.json')
    if (fs.existsSync(latestPath)) {
      const data = JSON.parse(fs.readFileSync(latestPath, 'utf8'))
      console.log(`📂 Previous analysis loaded from: ${data.saved_at}`)
      return data
    }
    return null
  } catch (error) {
    console.log('⚠️ No previous analysis found or error loading:', error.message)
    return null
  }
}

// Execute the analysis
analyzeGoldMarket()
