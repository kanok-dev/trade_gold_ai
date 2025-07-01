import React, { useState } from 'react'

const MobileDemo = () => {
  const [demoData] = useState({
    timestamp: '2025-07-01T15:30:00Z',
    data_freshness_minutes: 2,
    price_statistics: {
      current_spot_usd: 3280.5,
      daily_change_pct: -0.44,
      weekly_change_pct: -1.88,
      ytd_performance_pct: 42.1,
      '52_week_range': '2,320.00 - 3,500.05'
    },
    technical_analysis: {
      rsi_14d: 65,
      momentum: 'Corrective down, medium-term bullish',
      key_support_levels: [3280, 3245, 3210],
      key_resistance_levels: [3324, 3345, 3380],
      pattern_detected: 'descending triangle'
    },
    finalDecision: {
      action: 'HOLD',
      confidence: 63,
      reasoning: 'แม้เทคนิคเริ่มแกว่งพักตัว กระแสธนาคารกลางยังคงหนุน'
    },
    news_highlights: [
      {
        category: 'นโยบายการเงิน',
        headline: 'Fed Waller: พร้อมลดดอกเบี้ย ก.ค. หากเศรษฐกิจอ่อนแรง',
        sentiment: 'positive'
      }
    ]
  })

  const [currentView, setCurrentView] = useState('overview')

  const views = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'technical', name: 'Technical', icon: '📈' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'decision', name: 'Decision', icon: '🎯' }
  ]

  const renderOverview = () => (
    <div className='space-y-4'>
      {/* Price Card */}
      <div className='glass-card p-4 rounded-xl'>
        <div className='text-center'>
          <div className='text-3xl font-bold text-white mb-2'>${demoData.price_statistics.current_spot_usd.toLocaleString()}</div>
          <div className='text-red-400 bg-red-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1'>
            <span>↘</span>
            {demoData.price_statistics.daily_change_pct}%
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 mt-4'>
          <div className='bg-gray-800/50 p-3 rounded-lg text-center'>
            <div className='text-xs text-gray-400'>Weekly</div>
            <div className='text-red-400 font-medium'>{demoData.price_statistics.weekly_change_pct}%</div>
          </div>
          <div className='bg-gray-800/50 p-3 rounded-lg text-center'>
            <div className='text-xs text-gray-400'>YTD</div>
            <div className='text-green-400 font-medium'>+{demoData.price_statistics.ytd_performance_pct}%</div>
          </div>
        </div>
      </div>

      {/* Decision Card */}
      <div className='glass-card p-4 rounded-xl'>
        <h3 className='text-lg font-semibold mb-3'>🎯 Trading Decision</h3>
        <div className='text-center'>
          <div className='bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 inline-flex items-center gap-3 px-4 py-3 rounded-xl text-xl font-bold'>
            <span>⏸️</span>
            <span>{demoData.finalDecision.action}</span>
          </div>
          <div className='mt-3'>
            <div className='text-sm text-gray-400 mb-1'>Confidence Level</div>
            <div className='text-2xl font-bold text-yellow-400'>{demoData.finalDecision.confidence}%</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTechnical = () => (
    <div className='space-y-4'>
      <div className='glass-card p-4 rounded-xl'>
        <h3 className='text-lg font-semibold mb-3'>📊 Technical Analysis</h3>

        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div className='bg-gray-800/50 p-3 rounded-lg text-center'>
            <div className='text-xs text-gray-400'>RSI (14D)</div>
            <div className='text-xl font-bold text-yellow-400'>{demoData.technical_analysis.rsi_14d}</div>
          </div>
          <div className='bg-gray-800/50 p-3 rounded-lg text-center'>
            <div className='text-xs text-gray-400'>Pattern</div>
            <div className='text-sm font-medium text-purple-400 capitalize'>{demoData.technical_analysis.pattern_detected}</div>
          </div>
        </div>

        <div className='space-y-3'>
          <div>
            <div className='text-xs text-gray-400 mb-2'>Support Levels</div>
            <div className='flex flex-wrap gap-1'>
              {demoData.technical_analysis.key_support_levels.map((level, i) => (
                <span key={i} className='text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full'>
                  ${level.toLocaleString()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className='text-xs text-gray-400 mb-2'>Resistance Levels</div>
            <div className='flex flex-wrap gap-1'>
              {demoData.technical_analysis.key_resistance_levels.map((level, i) => (
                <span key={i} className='text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full'>
                  ${level.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNews = () => (
    <div className='space-y-4'>
      <div className='glass-card p-4 rounded-xl'>
        <h3 className='text-lg font-semibold mb-3'>📰 News Highlights</h3>

        {demoData.news_highlights.map((news, index) => (
          <div key={index} className='bg-gray-800/30 border border-gray-700/50 rounded-lg p-3'>
            <div className='flex justify-between items-start gap-2 mb-2'>
              <span className='text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full'>{news.category}</span>
              <div className='flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30'>
                <span>📈</span>
                <span className='capitalize'>{news.sentiment}</span>
              </div>
            </div>

            <h4 className='text-sm font-medium text-gray-200 leading-snug'>{news.headline}</h4>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDecision = () => (
    <div className='space-y-4'>
      <div className='glass-card p-4 rounded-xl'>
        <h3 className='text-lg font-semibold mb-3'>🎯 Decision Analysis</h3>

        <div className='bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg'>
          <div className='text-xs text-blue-400 mb-2'>AI Reasoning</div>
          <div className='text-sm text-gray-200 leading-relaxed'>{demoData.finalDecision.reasoning}</div>
        </div>

        <div className='mt-4'>
          <div className='text-sm text-gray-400 mb-2'>Confidence Level</div>
          <div className='w-full bg-gray-700 rounded-full h-3'>
            <div className='h-3 bg-yellow-400 rounded-full transition-all duration-300' style={{ width: `${demoData.finalDecision.confidence}%` }} />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'technical':
        return renderTechnical()
      case 'news':
        return renderNews()
      case 'decision':
        return renderDecision()
      default:
        return renderOverview()
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Mobile Header */}
      <div className='glass-card border-b border-white/10 p-4 safe-top'>
        <h1 className='text-xl font-bold gradient-text text-center'>🏆 Gold Trading Mobile Demo</h1>
        <div className='text-center text-xs text-gray-400 mt-1'>Responsive Design Showcase</div>
      </div>

      {/* Content Area */}
      <div className='p-4 pb-20'>{renderContent()}</div>

      {/* Mobile Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 safe-bottom'>
        <div className='grid grid-cols-4 gap-1 p-2'>
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors duration-200 touch-target ${currentView === view.id ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
            >
              <span className='text-lg'>{view.icon}</span>
              <span className='text-xs font-medium'>{view.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileDemo
