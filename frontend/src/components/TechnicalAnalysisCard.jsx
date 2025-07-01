import React from 'react'

const TechnicalAnalysisCard = ({ technicalData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📊 Technical Analysis</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
          <span className='ml-3 text-gray-300'>Loading technical data...</span>
        </div>
      </div>
    )
  }

  if (!technicalData) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📊 Technical Analysis</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No technical data available</span>
        </div>
      </div>
    )
  }

  const getRSIColor = (rsi) => {
    if (rsi >= 70) return 'text-red-400'
    if (rsi <= 30) return 'text-green-400'
    return 'text-yellow-400'
  }

  const getTrendColor = (trend) => {
    if (trend?.toLowerCase().includes('up')) return 'text-green-400'
    if (trend?.toLowerCase().includes('down')) return 'text-red-400'
    return 'text-yellow-400'
  }

  const formatSupportResistance = (levels) => {
    if (!Array.isArray(levels)) return []
    return levels.map((level) => `$${level.toLocaleString()}`)
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        📊 <span className='hidden sm:inline'>Technical Analysis</span>
        <span className='sm:hidden'>Technical</span>
      </h2>

      {/* Key Indicators */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>EMA 50D</div>
          <div className='text-lg font-bold text-blue-400'>${technicalData.ema_50d || 'N/A'}</div>
          <div className='text-xs text-gray-500'>Moving Average</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>EMA 100D</div>
          <div className='text-lg font-bold text-blue-400'>${technicalData.ema_100d || 'N/A'}</div>
          <div className='text-xs text-gray-500'>Moving Average</div>
        </div>
      </div>

      {/* Additional Indicators */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>Pivot Point</div>
          <div className='text-lg font-bold text-yellow-400'>${technicalData.pivot || 'N/A'}</div>
          <div className='text-xs text-gray-500'>Key Level</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>Fibo 38.2%</div>
          <div className='text-lg font-bold text-yellow-400'>${technicalData.fibo_38_2_pct || 'N/A'}</div>
          <div className='text-xs text-gray-500'>Retracement</div>
        </div>
      </div>

      {/* Momentum & Trend */}
      <div className='space-y-3 mb-4'>
        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-2'>Market Momentum</div>
          <div className='text-sm font-medium text-gray-200'>{technicalData.momentum}</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-2'>Current Trend</div>
          <div className={`text-sm font-medium ${getTrendColor(technicalData.trend)}`}>{technicalData.trend}</div>
        </div>
      </div>

      {/* Pattern Detection */}
      {technicalData.pattern_detected && (
        <div className='bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg mb-4'>
          <div className='text-xs text-purple-400 mb-1'>Pattern Detected</div>
          <div className='text-sm font-medium text-purple-300 capitalize'>{technicalData.pattern_detected}</div>
        </div>
      )}

      {/* Support & Resistance Levels */}
      <div className='space-y-3'>
        {/* Support Levels */}
        {technicalData.key_support_levels && technicalData.key_support_levels.length > 0 && (
          <div>
            <div className='text-xs text-gray-400 mb-2'>Key Support Levels</div>
            <div className='flex flex-wrap gap-1'>
              {formatSupportResistance(technicalData.key_support_levels).map((level, index) => (
                <span key={index} className='text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full'>
                  {level}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resistance Levels */}
        {technicalData.key_resistance_levels && technicalData.key_resistance_levels.length > 0 && (
          <div>
            <div className='text-xs text-gray-400 mb-2'>Key Resistance Levels</div>
            <div className='flex flex-wrap gap-1'>
              {formatSupportResistance(technicalData.key_resistance_levels).map((level, index) => (
                <span key={index} className='text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full'>
                  {level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Volume Condition */}
      {technicalData.volume_condition && (
        <div className='border-t border-gray-700 pt-3 mt-3'>
          <div className='text-xs text-gray-400 mb-1'>Volume Condition</div>
          <div className={`text-sm font-medium ${technicalData.volume_condition.toLowerCase().includes('above') ? 'text-green-400' : technicalData.volume_condition.toLowerCase().includes('below') ? 'text-red-400' : 'text-yellow-400'}`}>
            {technicalData.volume_condition}
          </div>
        </div>
      )}
    </div>
  )
}

export default TechnicalAnalysisCard
