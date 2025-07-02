import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory
dotenv.config({ path: path.join(__dirname, '../../.env') })

let openai = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
} catch (error) {
  console.log('⚠️  OpenAI client initialization failed, will use fallback merge')
}

/**
 * OpenAI-powered Analysis Merger Bot
 * Merges Claude and OpenAI analysis data into unified format using AI reasoning
 */
class OpenAIAnalysisMerger {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data')
    this.outputFile = path.join(this.dataDir, 'unified_analysis.json')
    this.claudeFile = path.join(this.dataDir, 'latest_claude_analysis.json')
    this.openaiFile = path.join(this.dataDir, 'latest_openai_analysis.json')
  }

  /**
   * Load analysis data from files
   */
  async loadAnalysisData() {
    try {
      let claudeData = null
      let openaiData = null

      // Load Claude analysis if exists
      if (fs.existsSync(this.claudeFile)) {
        const claudeRaw = await fs.promises.readFile(this.claudeFile, 'utf8')
        claudeData = JSON.parse(claudeRaw)
        console.log('✅ Claude analysis data loaded')
      }

      // Load OpenAI analysis if exists
      if (fs.existsSync(this.openaiFile)) {
        const openaiRaw = await fs.promises.readFile(this.openaiFile, 'utf8')
        openaiData = JSON.parse(openaiRaw)
        console.log('✅ OpenAI analysis data loaded')
      }

      return { claudeData, openaiData }
    } catch (error) {
      console.error('❌ Error loading analysis data:', error.message)
      return { claudeData: null, openaiData: null }
    }
  }

  /**
   * Use OpenAI to intelligently merge analysis data
   */
  async mergeWithAI(claudeData, openaiData) {
    if (!openai) {
      throw new Error('OpenAI client not available')
    }
    const prompt = `
You are an expert financial analyst tasked with merging gold market analysis data from two AI sources into a unified format.

IMPORTANT: All text content in the output must be in Thai language (ภาษาไทย). Use proper Thai financial terminology.

TASK: Merge the following analysis data into the exact JSON structure provided below. Use intelligent reasoning to:
1. Reconcile price differences by averaging or selecting most recent/reliable data
2. Combine technical indicators intelligently
3. Merge news highlights without duplication
4. Create consensus recommendations from both sources
5. Fill in missing data where possible

CLAUDE ANALYSIS DATA:
${claudeData ? JSON.stringify(claudeData, null, 2) : 'null'}

OPENAI ANALYSIS DATA:
${openaiData ? JSON.stringify(openaiData, null, 2) : 'null'}

OUTPUT FORMAT (copy this exact structure and fill with merged data):
{
  "timestamp": "ISO_DATETIME_NOW",
  "data_freshness_minutes": CALCULATE_MINUTES_FROM_MOST_RECENT_SOURCE,
  "source": "merged_ai" | "claude_only" | "openai_only",
  "unified_analysis": {
    "spot_price": NUMBER_OR_NULL,
    "price_change": {
      "daily_pct": NUMBER_OR_NULL,
      "weekly_pct": NUMBER_OR_NULL,
      "monthly_pct": NUMBER_OR_NULL
    },
    "technical_indicators": {
      "rsi_14": NUMBER_OR_NULL,
      "atr_14": NUMBER_OR_NULL,
      "supports": [ARRAY_OF_NUMBERS],
      "resistances": [ARRAY_OF_NUMBERS],
      "trend": "bullish|bearish|neutral|null",
      "momentum": "positive|negative|neutral|null"
    },
    "signals": {
      "short_term": "buy|sell|hold|null",
      "medium_term": "buy|sell|hold|null",
      "long_term": "buy|sell|hold|null"
    },
    "market_sentiment": {
      "overall": "bullish|bearish|neutral|null",
      "summary": "STRING_IN_THAI_OR_NULL",
      "confidence": "high|medium|low|null"
    },
    "news_highlights": [
      {
        "headline": "STRING_IN_THAI",
        "source": "STRING_IN_THAI",
        "sentiment": "bullish|bearish|neutral",
        "impact": "high|medium|low",
        "category": "STRING_IN_THAI"
      }
    ],
    "forecast_scenarios": {
      "short": "STRING_IN_THAI_OR_NULL",
      "medium": "STRING_IN_THAI_OR_NULL",
      "long": "STRING_IN_THAI_OR_NULL"
    },
    "key_events": [
      {
        "date": "DATE_STRING",
        "event": "STRING_IN_THAI",
        "impact": "high|medium|low"
      }
    ],
    "risk_factors": ["ARRAY_OF_STRINGS_IN_THAI"],
    "final_decision": {
      "action": "buy|sell|hold|null",
      "confidence": NUMBER_0_TO_100_OR_NULL,
      "reasoning": "STRING_IN_THAI_OR_NULL",
      "consensus": "strong|moderate|weak|split|null",
      "entryPoint": NUMBER_OR_NULL,
      "stopLoss": NUMBER_OR_NULL,
      "takeProfit": [
        NUMBER_OR_NULL,
        NUMBER_OR_NULL
      ],
    }
  },
  "metadata": {
    "bot_version": "openai_merger_v1.0",
    "data_source": "claude_and_openai_merged",
    "format_version": "3.0",
    "processing_time": "CURRENT_TIMESTAMP",
    "token_usage": null
  }
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no other text
- Use current timestamp in ISO format
- Calculate data freshness from most recent source timestamp
- If only one source available, set source accordingly
- Prioritize more recent data when merging conflicting information
- Combine news highlights without duplication (check headlines for similarity)
- Create intelligent consensus for final decision
- Fill null values only when data is not available or cannot be reasonably inferred
- ALL TEXT CONTENT (summary, headlines, reasoning, events, risk_factors, etc.) MUST BE IN THAI LANGUAGE
- Use proper Thai financial and market terminology
- Maintain professional tone in Thai language
`

    try {
      console.log('🤖 Using OpenAI to merge analysis data...')

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })

      // Clean the response to extract JSON
      let responseText = response.choices[0].message.content

      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '')

      // Trim whitespace
      responseText = responseText.trim()

      const mergedData = JSON.parse(responseText)
      console.log('✅ AI merge completed successfully')

      return mergedData
    } catch (error) {
      console.error('❌ Error during AI merge:', error.message)
      throw error
    }
  }

  /**
   * Fallback merger using rule-based logic with Thai language support
   */
  createFallbackMerge(claudeData, openaiData) {
    const now = new Date().toISOString()

    // Determine source
    let source = 'merged_ai'
    if (!claudeData && openaiData) source = 'openai_only'
    if (claudeData && !openaiData) source = 'claude_only'
    if (!claudeData && !openaiData) source = 'no_data'

    // Thai language mappings for common terms
    const translateToThai = (englishText) => {
      if (!englishText) return null

      const translations = {
        bullish: 'เป็นบวก',
        bearish: 'เป็นลบ',
        neutral: 'เป็นกลาง',
        buy: 'ซื้อ',
        sell: 'ขาย',
        hold: 'ถือ',
        high: 'สูง',
        medium: 'ปานกลาง',
        low: 'ต่ำ',
        positive: 'เชิงบวก',
        negative: 'เชิงลบ'
      }

      let result = englishText.toString()
      Object.entries(translations).forEach(([eng, thai]) => {
        result = result.replace(new RegExp(eng, 'gi'), thai)
      })
      return result
    }

    // Basic merge logic with Thai translations
    const merged = {
      timestamp: now,
      data_freshness_minutes: 0,
      source: source,
      unified_analysis: {
        spot_price: claudeData?.priceData?.spotPrice || openaiData?.priceData?.spotPrice || null,
        price_change: {
          daily_pct: claudeData?.priceData?.changePercent24h || openaiData?.priceData?.changePercent24h || null,
          weekly_pct: claudeData?.priceData?.changeWeekly || openaiData?.priceData?.changeWeekly || null,
          monthly_pct: null
        },
        technical_indicators: {
          rsi_14: claudeData?.technicalView?.rsi || openaiData?.technicalView?.rsi || null,
          atr_14: null,
          supports: claudeData?.technicalView?.supportLevels || openaiData?.technicalView?.supportLevels || [],
          resistances: claudeData?.technicalView?.resistanceLevels || openaiData?.technicalView?.resistanceLevels || [],
          trend: claudeData?.technicalView?.trend || openaiData?.technicalView?.trend || null,
          momentum: null
        },
        signals: {
          short_term: claudeData?.signal || openaiData?.signal || null,
          medium_term: null,
          long_term: null
        },
        market_sentiment: {
          overall: translateToThai(claudeData?.sentiment || openaiData?.sentiment) || null,
          summary: translateToThai(claudeData?.summary || openaiData?.summary) || 'ไม่มีข้อมูลการวิเคราะห์โดยละเอียด',
          confidence: translateToThai(claudeData?.confidence || openaiData?.confidence) || null
        },
        news_highlights: (claudeData?.news24h || openaiData?.news24h || []).map((news) => ({
          ...news,
          headline: translateToThai(news.headline) || news.headline,
          source: translateToThai(news.source) || news.source,
          category: translateToThai(news.category) || news.category
        })),
        forecast_scenarios: {
          short: translateToThai(claudeData?.priceTarget || openaiData?.priceTarget) || null,
          medium: null,
          long: null
        },
        key_events: [],
        risk_factors: (claudeData?.keyFactors || openaiData?.keyFactors || []).map((factor) => translateToThai(factor) || factor),
        final_decision: {
          action: translateToThai(claudeData?.signal || openaiData?.signal) || null,
          confidence: (claudeData?.confidence === 'medium' ? 70 : null) || null,
          reasoning: translateToThai(claudeData?.summary || openaiData?.summary) || 'ไม่มีข้อมูลการวิเคราะห์',
          consensus: null
        }
      },
      metadata: {
        bot_version: 'openai_merger_v1.0',
        data_source: 'fallback_merge',
        format_version: '3.0',
        processing_time: now,
        token_usage: null
      }
    }

    return merged
  }

  /**
   * Save merged analysis to unified file
   */
  async saveMergedAnalysis(mergedData) {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        await fs.promises.mkdir(this.dataDir, { recursive: true })
      }

      // Save to unified analysis file
      await fs.promises.writeFile(this.outputFile, JSON.stringify(mergedData, null, 2), 'utf8')

      console.log('✅ Merged analysis saved to:', this.outputFile)
      return true
    } catch (error) {
      console.error('❌ Error saving merged analysis:', error.message)
      return false
    }
  }

  /**
   * Main execution method
   */
  async execute() {
    console.log('🚀 Starting OpenAI Analysis Merger Bot...')
    console.log('=====================================')

    try {
      // Load source data
      const { claudeData, openaiData } = await loadAnalysisData()

      if (!claudeData && !openaiData) {
        console.log('⚠️  No analysis data found to merge')
        return false
      }

      let mergedData

      try {
        // Try AI-powered merge first
        mergedData = await this.mergeWithAI(claudeData, openaiData)
        console.log('✅ AI-powered merge completed successfully')
      } catch (aiError) {
        console.log('⚠️  AI merge failed:', aiError.message)
        console.log('⚠️  Using fallback merge...')
        mergedData = this.createFallbackMerge(claudeData, openaiData)
      }

      // Save merged result
      const saved = await this.saveMergedAnalysis(mergedData)

      if (saved) {
        console.log('🎉 Analysis merge completed successfully!')

        // Display summary
        const analysis = mergedData.unified_analysis
        console.log('\n📊 MERGED ANALYSIS SUMMARY / สรุปการวิเคราะห์รวม')
        console.log('=========================')
        console.log(`💰 Spot Price / ราคาทองคำ: $${analysis.spot_price || 'N/A'}`)
        console.log(`📈 Daily Change / การเปลี่ยนแปลงรายวัน: ${analysis.price_change.daily_pct || 'N/A'}%`)
        console.log(`🔍 Trend / แนวโน้ม: ${analysis.technical_indicators.trend || 'N/A'}`)
        console.log(`📡 Signal / สัญญาณ: ${analysis.signals.short_term || 'N/A'}`)
        console.log(`😊 Sentiment / ความรู้สึกตลาด: ${analysis.market_sentiment.overall || 'N/A'}`)
        console.log(`🎯 Action / การดำเนินการ: ${analysis.final_decision.action || 'N/A'}`)
        console.log(`🎯 Entry Point / จุดเข้า: ${analysis.final_decision.entryPoint ?? 'N/A'}`)
        console.log(`🛑 Stop Loss / จุดตัดขาดทุน: ${analysis.final_decision.stopLoss ?? 'N/A'}`)
        console.log(`🏁 Take Profit / จุดทำกำไร: ${Array.isArray(analysis.final_decision.takeProfit) ? analysis.final_decision.takeProfit.filter((x) => x != null).join(', ') : analysis.final_decision.takeProfit ?? 'N/A'}`)
        console.log(`📰 News Items / ข่าวสาร: ${analysis.news_highlights.length}`)
        console.log(`⚠️  Risk Factors / ปัจจัยเสี่ยง: ${analysis.risk_factors.length}`)

        return true
      }

      return false
    } catch (error) {
      console.error('❌ Fatal error in merger bot:', error.message)
      return false
    }
  }
}

// Helper function to load analysis data (made global for fallback)
async function loadAnalysisData() {
  const merger = new OpenAIAnalysisMerger()
  return await merger.loadAnalysisData()
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const merger = new OpenAIAnalysisMerger()
  merger.execute().then((success) => {
    console.log(success ? '\n✅ Bot execution completed' : '\n❌ Bot execution failed')
    process.exit(success ? 0 : 1)
  })
}

export default OpenAIAnalysisMerger
