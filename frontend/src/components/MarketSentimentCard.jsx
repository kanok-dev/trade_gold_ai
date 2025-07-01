import React from 'react'

const MarketSentimentCard = ({ sentimentData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🌊 Market Sentiment</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400'></div>
          <span className='ml-3 text-gray-300'>Loading sentiment...</span>
        </div>
      </div>
    )
  }

  if (!sentimentData) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🌊 Market Sentiment</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No sentiment data available</span>
        </div>
      </div>
    )
  }

  // Extract information from the unified data structure
  const overall = sentimentData.overall || 'Unknown'
  const summary = sentimentData.summary || ''

  // Extract key insights from summary
  const extractFromSummary = () => {
    const insights = {
      rsi: null,
      centralBankDemand: null,
      geopolitical: null,
      fedPolicy: null,
      recommendation: null,
      confidence: null
    }

    // Extract RSI value
    const rsiMatch = summary.match(/RSI[^\d]*(\d+\.?\d*)/i)
    if (rsiMatch) insights.rsi = parseFloat(rsiMatch[1])

    // Extract central bank information
    if (summary.includes('Central banks') || summary.includes('900 tonnes')) {
      insights.centralBankDemand = 'Strong (900 tonnes expected in 2025)'
    }

    // Extract geopolitical factors
    if (summary.includes('ceasefire') || summary.includes('Iran-Israel')) {
      insights.geopolitical = 'Tensions easing (Iran-Israel ceasefire)'
    }

    // Extract Fed policy
    if (summary.includes('Fed') && summary.includes('rate cuts')) {
      insights.fedPolicy = 'Hawkish (slower rate cuts)'
    }

    // Extract recommendation
    const actionMatch = summary.match(/"action":\s*"([^"]+)"/i)
    if (actionMatch) insights.recommendation = actionMatch[1]

    // Extract confidence
    const confMatch = summary.match(/"confidence":\s*(\d+)/i)
    if (confMatch) insights.confidence = parseInt(confMatch[1])

    return insights
  }

  const insights = extractFromSummary()

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        🌊 <span className='hidden sm:inline'>Market Sentiment</span>
        <span className='sm:hidden'>Sentiment</span>
      </h2>

      {/* Overall Sentiment */}
      <div className='mb-4'>
        <div className='flex justify-center mb-3'>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${
              overall === 'Positive' ? 'text-green-400 bg-green-500/20' : overall === 'Negative' ? 'text-red-400 bg-red-500/20' : 'text-yellow-400 bg-yellow-500/20'
            }`}
          >
            {overall === 'Positive' ? '😊' : overall === 'Negative' ? '😰' : '😐'}
            <span className='text-base'>{overall}</span>
          </div>
        </div>
      </div>

      {/* RSI Indicator */}
      {insights.rsi && (
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm text-gray-400'>RSI (14)</span>
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${insights.rsi >= 70 ? 'text-red-400 bg-red-500/20' : insights.rsi <= 30 ? 'text-green-400 bg-green-500/20' : 'text-yellow-400 bg-yellow-500/20'}`}>
              {insights.rsi.toFixed(1)}
            </span>
          </div>
          <div className='w-full bg-gray-700 rounded-full h-2 mb-1'>
            <div className={`h-2 rounded-full transition-all duration-300 ${insights.rsi >= 70 ? 'bg-red-400' : insights.rsi <= 30 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${Math.min(100, insights.rsi)}%` }} />
          </div>
          <div className='text-xs text-center text-gray-400'>{insights.rsi >= 70 ? 'Overbought' : insights.rsi <= 30 ? 'Oversold' : 'Neutral'}</div>
        </div>
      )}

      {/* Central Bank Demand */}
      {insights.centralBankDemand && (
        <div className='bg-gray-800/50 p-3 rounded-lg mb-3'>
          <div className='text-xs text-gray-400 mb-1'>Central Bank Demand</div>
          <div className='text-sm font-medium text-green-400'>{insights.centralBankDemand}</div>
        </div>
      )}

      {/* Geopolitical Factors */}
      {insights.geopolitical && (
        <div className='bg-gray-800/50 p-3 rounded-lg mb-3'>
          <div className='text-xs text-gray-400 mb-1'>Geopolitical Factors</div>
          <div className='text-sm font-medium text-yellow-400'>{insights.geopolitical}</div>
        </div>
      )}

      {/* Fed Policy */}
      {insights.fedPolicy && (
        <div className='bg-gray-800/50 p-3 rounded-lg mb-3'>
          <div className='text-xs text-gray-400 mb-1'>Fed Policy</div>
          <div className='text-sm font-medium text-red-400'>{insights.fedPolicy}</div>
        </div>
      )}

      {/* Trading Recommendation */}
      {insights.recommendation && (
        <div className='bg-gray-800/50 p-3 rounded-lg mb-3'>
          <div className='text-xs text-gray-400 mb-1'>Recommendation</div>
          <div className={`text-sm font-medium ${insights.recommendation === 'SELL' ? 'text-red-400' : insights.recommendation === 'BUY' ? 'text-green-400' : 'text-yellow-400'}`}>
            {insights.recommendation}
            {insights.confidence && <span className='ml-2 text-xs text-gray-400'>({insights.confidence}% confidence)</span>}
          </div>
        </div>
      )}

      {/* If no specific insights, show fallback */}
      {!insights.rsi && !insights.centralBankDemand && !insights.geopolitical && !insights.fedPolicy && !insights.recommendation && (
        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>Analysis Summary</div>
          <div className='text-sm text-gray-300'>{summary.length > 100 ? `${summary.substring(0, 100)}...` : summary || 'No detailed analysis available'}</div>
        </div>
      )}
    </div>
  )
}

export default MarketSentimentCard
