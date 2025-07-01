import React from 'react'

const EnhancedPriceCard = ({ priceData, verificationData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>💰 Gold Price Analysis</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400'></div>
          <span className='ml-3 text-gray-300'>Loading price data...</span>
        </div>
      </div>
    )
  }

  if (!priceData) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>💰 Gold Price Analysis</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No price data available</span>
        </div>
      </div>
    )
  }

  const isPositive = (priceData.d_d_pct || priceData.daily_change_pct || priceData.change_DD_pct || 0) >= 0
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
    return `$${price}`
  }

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent}%`
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        💰 <span className='hidden sm:inline'>Gold Price Analysis</span>
        <span className='sm:hidden'>Gold Price</span>
      </h2>

      {/* Main Price Display */}
      <div className='text-center mb-6'>
        <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2'>{priceData.spot_usd ? formatPrice(priceData.spot_usd) : 'N/A'}</div>
        <div className={`text-base sm:text-lg font-medium px-3 py-1 rounded-full inline-flex items-center gap-1 ${isPositive ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
          <span>{isPositive ? '↗' : '↘'}</span>
          {formatPercent(priceData.d_d_pct || priceData.daily_change_pct || priceData.change_DD_pct || 0)}
        </div>
      </div>

      {/* Price Statistics Grid */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>Weekly Change</div>
          <div className={`text-sm font-medium ${(priceData.w_w_pct || priceData.change_WW_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(priceData.w_w_pct || priceData.change_WW_pct || 0)}</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>RSI (14)</div>
          <div className='text-sm font-medium text-gray-300'>{priceData.rsi_14 || priceData.RSI_14 || 'N/A'}</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>From ATH</div>
          <div className='text-sm font-medium text-gray-300'>{formatPercent(priceData.from_ath_pct || 0)}</div>
        </div>

        <div className='bg-gray-800/50 p-3 rounded-lg'>
          <div className='text-xs text-gray-400 mb-1'>ATR (14d)</div>
          <div className='text-xs font-medium text-gray-300'>{priceData.atr_14d || priceData.ATR_14 || 'N/A'}</div>
        </div>
      </div>

      {/* ATH Information */}
      {(priceData.ath_usd || priceData.ath_value) && (
        <div className='bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
            <div>
              <div className='text-xs text-yellow-400 mb-1'>All-Time High</div>
              <div className='text-sm font-medium text-white'>{formatPrice(priceData.ath_usd || priceData.ath_value)}</div>
            </div>
            {priceData.ath_date && <div className='text-xs text-yellow-300'>{new Date(priceData.ath_date).toLocaleDateString()}</div>}
          </div>
        </div>
      )}

      {/* Price Verification */}
      {verificationData && verificationData.sources && (
        <div className='border-t border-gray-700 pt-4'>
          <div className='text-xs text-gray-400 mb-2'>Price Verification</div>
          <div className='space-y-2'>
            {verificationData.sources.map((source, index) => (
              <div key={index} className='text-xs'>
                <span className='text-gray-400'>{source.name}: </span>
                <span className='text-gray-300'>${source.spot}</span>
              </div>
            ))}
            {verificationData.spread_usd !== undefined && (
              <div className='text-xs'>
                <span className='text-gray-400'>Spread: </span>
                <span className={`font-medium ${verificationData.spread_usd <= 1 ? 'text-green-400' : 'text-yellow-400'}`}>${verificationData.spread_usd}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedPriceCard
