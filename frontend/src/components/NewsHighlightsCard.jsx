import React, { useState } from 'react'

const NewsHighlightsCard = ({ newsData, loading }) => {
  const [expandedNews, setExpandedNews] = useState(null)

  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📰 News Highlights</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400'></div>
          <span className='ml-3 text-gray-300'>Loading news...</span>
        </div>
      </div>
    )
  }

  if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📰 News Highlights</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No news available</span>
        </div>
      </div>
    )
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'negative':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'neutral':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '📈'
      case 'negative':
        return '📉'
      case 'neutral':
        return '➖'
      default:
        return '📊'
    }
  }

  const getCategoryColor = (category) => {
    // Color mapping for different categories
    const categoryColors = {
      นโยบายการเงิน: 'text-purple-400 bg-purple-500/20',
      ภูมิรัฐศาสตร์: 'text-orange-400 bg-orange-500/20',
      อุปสงค์ธนาคารกลาง: 'text-blue-400 bg-blue-500/20',
      มุมมองสถาบัน: 'text-cyan-400 bg-cyan-500/20',
      monetary_policy: 'text-purple-400 bg-purple-500/20',
      geopolitics: 'text-orange-400 bg-orange-500/20',
      central_bank: 'text-blue-400 bg-blue-500/20',
      institutional: 'text-cyan-400 bg-cyan-500/20'
    }
    return categoryColors[category] || 'text-gray-400 bg-gray-500/20'
  }

  const toggleNewsExpansion = (index) => {
    setExpandedNews(expandedNews === index ? null : index)
  }

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        📰 <span className='hidden sm:inline'>News Highlights</span>
        <span className='sm:hidden'>News</span>
        <span className='text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full'>{newsData.length}</span>
      </h2>

      <div className='space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600'>
        {newsData.map((news, index) => (
          <div key={index} className='bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/50 transition-colors duration-200'>
            {/* Header with Category and Sentiment */}
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2'>
              <div className='flex items-center gap-2'>{news.category && <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(news.category)}`}>{news.category}</span>}</div>

              {news.sentiment && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getSentimentColor(news.sentiment)}`}>
                  <span>{getSentimentIcon(news.sentiment)}</span>
                  <span className='capitalize'>{news.sentiment}</span>
                </div>
              )}
            </div>

            {/* Headline */}
            <div className='mb-2'>
              <h3 className='text-sm font-medium text-gray-200 leading-snug'>{expandedNews === index ? news.headline : truncateText(news.headline, 120)}</h3>
              {news.headline.length > 120 && (
                <button onClick={() => toggleNewsExpansion(index)} className='text-xs text-blue-400 hover:text-blue-300 mt-1'>
                  {expandedNews === index ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Impact Reason */}
            {news.impact_reason && (
              <div className='mb-2'>
                <div className='text-xs text-gray-400 mb-1'>Impact:</div>
                <div className='text-xs text-gray-300 leading-relaxed'>{expandedNews === index ? news.impact_reason : truncateText(news.impact_reason, 80)}</div>
              </div>
            )}

            {/* Source Link */}
            {news.source_ref && (
              <div className='flex justify-between items-center pt-2 border-t border-gray-700/50'>
                <a href={news.source_ref} target='_blank' rel='noopener noreferrer' className='text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1'>
                  <span>🔗</span>
                  <span className='hidden sm:inline'>View Source</span>
                  <span className='sm:hidden'>Source</span>
                </a>

                {/* News index indicator */}
                <span className='text-xs text-gray-500'>
                  {index + 1}/{newsData.length}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className='mt-4 pt-3 border-t border-gray-700'>
        <div className='flex justify-between items-center text-xs text-gray-400'>
          <span>Latest market updates</span>
          <div className='flex gap-2'>
            <span className='text-green-400'>{newsData.filter((n) => n.sentiment === 'positive').length} 📈</span>
            <span className='text-red-400'>{newsData.filter((n) => n.sentiment === 'negative').length} 📉</span>
            <span className='text-gray-400'>{newsData.filter((n) => n.sentiment === 'neutral').length} ➖</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsHighlightsCard
