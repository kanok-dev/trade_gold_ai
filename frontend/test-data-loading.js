// Simple test script to verify data loading
console.log('🧪 Testing enhanced dashboard data loading...')

// Simulate loading data
fetch('http://localhost:3000/data/latest_analysis.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
  .then((data) => {
    console.log('✅ Data loaded successfully!')
    console.log('📊 Price:', data.price_statistics?.spot_usd)
    console.log('📈 Daily Change:', data.price_statistics?.d_d_pct)
    console.log('🎯 Decision:', data.finalDecision?.action)
    console.log('🔍 Pattern:', data.technical_analysis?.pattern_detected)
    console.log('📰 News Count:', data.news_highlights?.length)
    console.log('⚠️ Risk Factors:', data.risk_factors?.length)

    // Check for required fields
    const requiredFields = ['price_statistics.spot_usd', 'technical_analysis.signal', 'finalDecision.action', 'market_sentiment.overall', 'news_highlights', 'forecast_scenarios']

    requiredFields.forEach((field) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], data)
      if (value === undefined || value === null) {
        console.warn(`⚠️ Missing field: ${field}`)
      } else {
        console.log(`✅ Field OK: ${field} = ${typeof value === 'object' ? `[${typeof value}]` : value}`)
      }
    })
  })
  .catch((error) => {
    console.error('❌ Error loading data:', error)
  })
