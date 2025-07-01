import React from 'react'

const NewsCard = ({ latestNews, loading }) => {
  const getSentimentStyle = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'text-green-400 bg-green-500/20'
      case 'bearish':
      case 'negative':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return '🟢'
      case 'bearish':
      case 'negative':
        return '🔴'
      default:
        return '⚪'
    }
  }

  return (
    <div className='glass-card p-6 rounded-xl col-span-1 lg:col-span-2'>
      <h2 className='text-xl font-semibold text-gray-200 mb-4'>📰 Latest News</h2>
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400'></div>
          <span className='ml-3 text-gray-300'>Loading...</span>
        </div>
      ) : (
        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {latestNews && latestNews.length > 0 ? (
            latestNews.map((news, index) => (
              <div key={index} className='p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200'>
                <div className='flex justify-between items-start gap-3'>
                  <div className='flex-1'>
                    <p className='text-white font-medium text-sm lg:text-base leading-snug'>{news.title || news.headline}</p>
                    <span className='text-xs text-gray-400 mt-1 block'>{news.timestamp ? new Date(news.timestamp).toLocaleTimeString() : 'Recent'}</span>
                  </div>
                  {news.sentiment && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSentimentStyle(news.sentiment)}`}>
                      {getSentimentIcon(news.sentiment)}
                      {news.sentiment}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-8 space-y-2'>
              <div className='text-4xl'>📰</div>
              <p className='text-gray-300 font-medium'>No recent news available</p>
              <p className='text-sm text-gray-400'>News data will appear here when available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NewsCard
