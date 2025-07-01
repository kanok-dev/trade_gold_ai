import React from 'react'

const PortfolioCard = ({ portfolioData, loading }) => {
  const getRecommendationStyle = (rec) => {
    switch (rec) {
      case 'BUY':
        return 'text-green-400 bg-green-500/20'
      case 'SELL':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  return (
    <div className='glass-card p-6 rounded-xl'>
      <h2 className='text-xl font-semibold text-gray-200 mb-4'>📊 Portfolio Status</h2>
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400'></div>
          <span className='ml-3 text-gray-300'>Loading...</span>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Gold Allocation:</span>
            <span className='text-xl font-bold text-primary-400'>{portfolioData.goldAllocation}%</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Cash:</span>
            <span className='text-xl font-bold text-white'>{portfolioData.cashAllocation}%</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Recommendation:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationStyle(portfolioData.recommendation)}`}>{portfolioData.recommendation}</span>
          </div>

          {/* Visual allocation bar */}
          <div className='mt-4'>
            <div className='flex text-xs text-gray-400 mb-2'>
              <span>Asset Allocation</span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-3 flex overflow-hidden'>
              <div className='bg-primary-400 h-full transition-all duration-300' style={{ width: `${portfolioData.goldAllocation}%` }}></div>
              <div className='bg-gray-400 h-full transition-all duration-300' style={{ width: `${portfolioData.cashAllocation}%` }}></div>
            </div>
            <div className='flex justify-between text-xs text-gray-400 mt-1'>
              <span>Gold</span>
              <span>Cash</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioCard
