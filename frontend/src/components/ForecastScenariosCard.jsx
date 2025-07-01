import React from 'react'

const ForecastScenariosCard = ({ forecastData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🔮 Forecast Scenarios</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400'></div>
          <span className='ml-3 text-gray-300'>Loading forecasts...</span>
        </div>
      </div>
    )
  }

  if (!forecastData) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>🔮 Forecast Scenarios</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No forecast data available</span>
        </div>
      </div>
    )
  }

  const getTimeframeColor = (timeframe) => {
    if (timeframe.includes('short')) return 'bg-green-500/20 border-green-500/30 text-green-400'
    if (timeframe.includes('medium')) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
    if (timeframe.includes('long')) return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
    return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
  }

  const getTimeframeIcon = (timeframe) => {
    if (timeframe.includes('short')) return '⚡'
    if (timeframe.includes('medium')) return '📅'
    if (timeframe.includes('long')) return '🎯'
    return '📊'
  }

  const formatTimeframe = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const scenarios = Object.entries(forecastData || {})

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        🔮 <span className='hidden sm:inline'>Forecast Scenarios</span>
        <span className='sm:hidden'>Forecasts</span>
      </h2>

      <div className='space-y-4'>
        {scenarios.map(([timeframe, scenario], index) => (
          <div key={index} className={`border rounded-lg p-4 ${getTimeframeColor(timeframe)}`}>
            {/* Timeframe Header */}
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-xl'>{getTimeframeIcon(timeframe)}</span>
              <div>
                <h3 className='font-semibold text-sm sm:text-base'>{formatTimeframe(timeframe)}</h3>
                {timeframe.includes('short') && <span className='text-xs opacity-75'>1-3 Months</span>}
                {timeframe.includes('medium') && <span className='text-xs opacity-75'>6-12 Months</span>}
                {timeframe.includes('long') && <span className='text-xs opacity-75'>2025-2026</span>}
              </div>
            </div>

            {/* Price Range */}
            {scenario.price_range && (
              <div className='mb-3'>
                <div className='text-xs opacity-75 mb-1'>Expected Price Range</div>
                <div className='text-lg sm:text-xl font-bold'>${scenario.price_range}</div>
              </div>
            )}

            {/* Key Drivers */}
            {scenario.key_drivers && (
              <div>
                <div className='text-xs opacity-75 mb-2'>Key Drivers</div>
                <div className='text-sm leading-relaxed'>{scenario.key_drivers}</div>
              </div>
            )}

            {/* Progress indicator for timeframes */}
            <div className='mt-3 pt-3 border-t border-current border-opacity-20'>
              <div className='flex justify-between items-center text-xs opacity-75'>
                <span>Forecast Period</span>
                <div className='flex gap-1'>
                  {timeframe.includes('short') && (
                    <>
                      <div className='w-2 h-2 rounded-full bg-current'></div>
                      <div className='w-2 h-2 rounded-full bg-current opacity-30'></div>
                      <div className='w-2 h-2 rounded-full bg-current opacity-10'></div>
                    </>
                  )}
                  {timeframe.includes('medium') && (
                    <>
                      <div className='w-2 h-2 rounded-full bg-current opacity-30'></div>
                      <div className='w-2 h-2 rounded-full bg-current'></div>
                      <div className='w-2 h-2 rounded-full bg-current opacity-30'></div>
                    </>
                  )}
                  {timeframe.includes('long') && (
                    <>
                      <div className='w-2 h-2 rounded-full bg-current opacity-10'></div>
                      <div className='w-2 h-2 rounded-full bg-current opacity-30'></div>
                      <div className='w-2 h-2 rounded-full bg-current'></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className='mt-4 pt-4 border-t border-gray-700'>
        <div className='text-xs text-gray-400 text-center'>
          <div className='flex justify-center items-center gap-4'>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-green-400'></div>
              <span>Short-term</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-yellow-400'></div>
              <span>Medium-term</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-blue-400'></div>
              <span>Long-term</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForecastScenariosCard
