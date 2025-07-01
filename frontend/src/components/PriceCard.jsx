import React from 'react'

const PriceCard = ({ currentPrice, priceChange, loading }) => {
  const isPositive = priceChange.includes('+')

  return (
    <div className='glass-card p-6 rounded-xl'>
      <h2 className='text-xl font-semibold text-gray-200 mb-4'>💰 Current Gold Price</h2>
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400'></div>
          <span className='ml-3 text-gray-300'>Loading...</span>
        </div>
      ) : (
        <div className='flex flex-col items-center space-y-2'>
          <span className='text-3xl lg:text-4xl font-bold text-white'>{currentPrice}</span>
          <span className={`text-lg font-medium px-3 py-1 rounded-full ${isPositive ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>{priceChange}</span>
        </div>
      )}
    </div>
  )
}

export default PriceCard
