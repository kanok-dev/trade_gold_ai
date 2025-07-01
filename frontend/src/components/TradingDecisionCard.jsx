import React from 'react'

const TradingDecisionCard = ({ decisionData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🎯 Trading Decision</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-400'></div>
          <span className='ml-3 text-gray-300'>Loading decision...</span>
        </div>
      </div>
    )
  }

  if (!decisionData) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🎯 Trading Decision</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No decision data available</span>
        </div>
      </div>
    )
  }

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'BUY':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'SELL':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HOLD':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getActionIcon = (action) => {
    switch (action?.toUpperCase()) {
      case 'BUY':
        return '📈'
      case 'SELL':
        return '📉'
      case 'HOLD':
        return '⏸️'
      default:
        return '❓'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    if (confidence >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getConfidenceBarWidth = (confidence) => {
    return `${Math.min(Math.max(confidence, 0), 100)}%`
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        🎯 <span className='hidden sm:inline'>Trading Decision</span>
        <span className='sm:hidden'>Decision</span>
      </h2>

      {/* Main Decision */}
      <div className='text-center mb-6'>
        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border text-xl sm:text-2xl font-bold ${getActionColor(decisionData.action)}`}>
          <span className='text-2xl'>{getActionIcon(decisionData.action)}</span>
          <span>{decisionData.action}</span>
        </div>
      </div>

      {/* Confidence Level */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm text-gray-400'>Confidence Level</span>
          <span className={`text-lg font-bold ${getConfidenceColor(decisionData.confidence)}`}>{decisionData.confidence}%</span>
        </div>
        <div className='w-full bg-gray-700 rounded-full h-3'>
          <div
            className={`h-3 rounded-full transition-all duration-300 ${decisionData.confidence >= 80 ? 'bg-green-400' : decisionData.confidence >= 60 ? 'bg-yellow-400' : decisionData.confidence >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}
            style={{ width: getConfidenceBarWidth(decisionData.confidence) }}
          />
        </div>
      </div>

      {/* Consensus */}
      {decisionData.consensus && (
        <div className='bg-gray-800/50 p-3 rounded-lg mb-4'>
          <div className='text-xs text-gray-400 mb-1'>Consensus</div>
          <div className='text-sm font-medium text-gray-200'>{decisionData.consensus}</div>
        </div>
      )}

      {/* Reasoning */}
      {decisionData.reasoning && (
        <div className='bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-4'>
          <div className='text-xs text-blue-400 mb-2'>Analysis Reasoning</div>
          <div className='text-sm text-gray-200 leading-relaxed'>{decisionData.reasoning}</div>
        </div>
      )}

      {/* Detailed Decisions Breakdown */}
      {decisionData.decisions && decisionData.decisions.length > 0 && (
        <div className='space-y-3'>
          <div className='text-xs text-gray-400 font-medium'>Decision Breakdown</div>
          {decisionData.decisions.map((decision, index) => (
            <div key={index} className='bg-gray-800/30 p-3 rounded-lg'>
              <div className='flex justify-between items-start mb-2'>
                <div className='flex items-center gap-2'>
                  <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(decision.action)}`}>{decision.source}</span>
                  <span className={`text-sm font-medium ${getActionColor(decision.action)}`}>{decision.action}</span>
                </div>
                <div className='text-right'>
                  <div className='text-xs text-gray-400'>Weight: {(decision.weight * 100).toFixed(0)}%</div>
                  <div className={`text-xs font-medium ${getConfidenceColor(decision.confidence)}`}>{decision.confidence}% confidence</div>
                </div>
              </div>
              {decision.reasoning && <div className='text-xs text-gray-300 leading-relaxed'>{decision.reasoning}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TradingDecisionCard
