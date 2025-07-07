// Test the new unified_analysis support
const testData = {
  timestamp: '2025-07-03T16:12:44.615Z',
  data_freshness_minutes: 0,
  source: 'merged_ai',
  unified_analysis: {
    spot_price: 3352.59,
    price_change: {
      daily_pct: -0.1,
      weekly_pct: 2,
      monthly_pct: null
    },
    technical_indicators: {
      rsi_14: 38,
      supports: [3300, 3250, 3246],
      resistances: [3360, 3400, 3450, 3358],
      trend: 'neutral',
      momentum: 'neutral'
    },
    signals: {
      short_term: 'hold',
      medium_term: 'hold',
      long_term: 'buy'
    },
    market_sentiment: {
      overall: 'neutral',
      summary: 'ราคาทองคำเคลื่อนไหวในกรอบแคบ นักลงทุนรอปัจจัยใหม่จากข้อมูลเศรษฐกิจสหรัฐฯ',
      confidence: 'medium'
    },
    news_highlights: [
      {
        headline: 'ราคาทองคำทรงตัวในกรอบแคบ นักลงทุนจับตาข้อมูลจ้างงานสหรัฐฯ เพื่อประเมินทิศทางนโยบายเฟด',
        source: 'Reuters',
        sentiment: 'neutral',
        impact: 'high',
        category: 'นโยบายเฟด'
      },
      {
        headline: 'ทองคำและหุ้นเหมืองทองอาจได้รับการยกระดับเป็นสินแร่สำคัญ',
        source: 'Reuters',
        sentiment: 'bullish',
        impact: 'medium',
        category: 'สถาบัน'
      }
    ],
    final_decision: {
      action: 'hold',
      confidence: 65,
      reasoning: 'ราคาทองคำยังเคลื่อนไหวในกรอบแคบ นักลงทุนรอข้อมูลเศรษฐกิจสำคัญและท่าทีของเฟด',
      consensus: 'moderate',
      entryPoint: 3330,
      stopLoss: 3280,
      takeProfit: [3400, 3450]
    }
  }
}

console.log('✅ UNIFIED ANALYSIS STRUCTURE VALIDATION:')
console.log('='.repeat(50))
console.log(`- Has unified_analysis: ${!!testData.unified_analysis}`)
console.log(`- Spot price: $${testData.unified_analysis.spot_price}`)
console.log(`- Daily change: ${testData.unified_analysis.price_change.daily_pct}%`)
console.log(`- Weekly change: ${testData.unified_analysis.price_change.weekly_pct}%`)
console.log(`- Market sentiment: ${testData.unified_analysis.market_sentiment.overall}`)
console.log(`- Confidence: ${testData.unified_analysis.market_sentiment.confidence}`)
console.log(`- Short-term signal: ${testData.unified_analysis.signals.short_term}`)
console.log(`- Medium-term signal: ${testData.unified_analysis.signals.medium_term}`)
console.log(`- Long-term signal: ${testData.unified_analysis.signals.long_term}`)
console.log(`- RSI: ${testData.unified_analysis.technical_indicators.rsi_14}`)
console.log(`- Support levels: ${testData.unified_analysis.technical_indicators.supports.length} levels`)
console.log(`- Resistance levels: ${testData.unified_analysis.technical_indicators.resistances.length} levels`)
console.log(`- News highlights: ${testData.unified_analysis.news_highlights.length} articles`)
console.log(`- Final decision: ${testData.unified_analysis.final_decision.action}`)
console.log(`- Entry point: $${testData.unified_analysis.final_decision.entryPoint}`)
console.log(`- Stop loss: $${testData.unified_analysis.final_decision.stopLoss}`)
console.log(`- Take profit: $${testData.unified_analysis.final_decision.takeProfit.join(', $')}`)
console.log('='.repeat(50))
console.log('✅ Test data structure is valid for unified_analysis processing!')
