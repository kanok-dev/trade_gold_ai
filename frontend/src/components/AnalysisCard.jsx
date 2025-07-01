import React from 'react'

const AnalysisCard = ({ analysisData, loading }) => {
  const getRiskStyle = (score) => {
    if (score <= 3) return 'text-green-400 bg-green-500/20'
    if (score <= 6) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getConfidenceStyle = (confidence) => {
    if (confidence >= 80) return 'text-green-400 bg-green-500/20'
    if (confidence >= 60) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getMarketRegimeIcon = (regime) => {
    switch (regime?.toLowerCase()) {
      case 'bullish':
        return '📈'
      case 'bearish':
        return '📉'
      default:
        return '⚖️'
    }
  }

  return (
    <div className='glass-card p-6 rounded-xl'>
      <h2 className='text-xl font-semibold text-gray-200 mb-4'>🤖 AI Analysis</h2>
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400'></div>
          <span className='ml-3 text-gray-300'>Loading...</span>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Market Regime:</span>
            <span className='flex items-center gap-2 text-white font-medium'>
              {getMarketRegimeIcon(analysisData.marketRegime)}
              {analysisData.marketRegime}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Risk Score:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskStyle(analysisData.riskScore)}`}>{analysisData.riskScore}/10</span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Confidence:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceStyle(analysisData.confidence)}`}>{analysisData.confidence}%</span>
          </div>

          {/* Risk Score Visual Bar */}
          <div className='mt-4'>
            <div className='flex justify-between text-xs text-gray-400 mb-2'>
              <span>Risk Level</span>
              <span>Low Risk ← → High Risk</span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-2'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${analysisData.riskScore <= 3 ? 'bg-green-400' : analysisData.riskScore <= 6 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${(analysisData.riskScore / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Confidence Visual Bar */}
          <div className='mt-4'>
            <div className='flex justify-between text-xs text-gray-400 mb-2'>
              <span>Confidence Level</span>
              <span>{analysisData.confidence}%</span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-2'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${analysisData.confidence >= 80 ? 'bg-green-400' : analysisData.confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${analysisData.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisCard
