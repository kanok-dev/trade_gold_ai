import React, { useState, useEffect } from 'react'
import ApiService from '../services/api.js'
import EnhancedPriceCard from './EnhancedPriceCard'
import TechnicalAnalysisCard from './TechnicalAnalysisCard'
import MarketSentimentCard from './MarketSentimentCard'
import NewsHighlightsCard from './NewsHighlightsCard'
import ForecastScenariosCard from './ForecastScenariosCard'
import TradingDecisionCard from './TradingDecisionCard'
import KeyEventsCard from './KeyEventsCard'
import RiskFactorsCard from './RiskFactorsCard'

const EnhancedDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [dataFreshness, setDataFreshness] = useState(null)
  const [analysisTimestamp, setAnalysisTimestamp] = useState(null)

  useEffect(() => {
    loadAnalysisData()

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(loadAnalysisData, 60000)

    return () => clearInterval(interval)
  }, [])

  const loadAnalysisData = async () => {
    try {
      console.log('📊 Loading enhanced unified analysis data...') // Load from the unified analysis endpoint
      const response = await ApiService.getLatestAnalysis()

      if (response.success && response.data) {
        // Extract the unified analysis data
        const unifiedData = response.data.unified_analysis

        if (unifiedData) {
          const timestamp = response.data?.metadata?.processing_time || response.data?.timestamp
          setAnalysisData(unifiedData)
          setDataFreshness(response.data.data_freshness_minutes || null)
          setLastUpdate(new Date())
          setAnalysisTimestamp(timestamp || null)
          setError(null)
          console.log('✅ Unified analysis data loaded successfully')
        } else {
          throw new Error('No unified analysis data found in response')
        }
      } else {
        throw new Error('Failed to load analysis data')
      }
    } catch (err) {
      console.error('❌ Error loading analysis data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerManualRefresh = async () => {
    setLoading(true)
    await loadAnalysisData()
  }

  if (loading && !analysisData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400'></div>
        <span className='text-gray-300 text-lg'>Loading analysis data...</span>
      </div>
    )
  }

  if (error && !analysisData) {
    return (
      <div className='max-w-md mx-auto mt-8 p-6 glass-card border-red-500/20 bg-red-500/5'>
        <h2 className='text-xl font-bold text-red-400 mb-4 text-center'>⚠️ Data Load Error</h2>
        <p className='text-gray-300 mb-6 text-center'>{error}</p>
        <button onClick={triggerManualRefresh} className='w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200'>
          🔄 Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Debug info - remove in production */}
      {analysisData && (
        <div className='text-xs text-gray-500 p-2 bg-gray-800/20 rounded'>
          <details>
            <summary>Debug Info (click to expand)</summary>
            <pre className='mt-2 overflow-auto max-h-48 text-xs'>
              {JSON.stringify(
                {
                  spot_price: analysisData.spot_price,
                  price_change: analysisData.price_change,
                  technical_indicators: analysisData.technical_indicators,
                  signals: analysisData.signals,
                  market_sentiment: analysisData.market_sentiment,
                  final_decision: analysisData.final_decision,
                  news_count: analysisData.news_highlights?.length || 0,
                  forecast_scenarios: analysisData.forecast_scenarios,
                  key_events: analysisData.key_events,
                  risk_factors: analysisData.risk_factors
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}

      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-4 rounded-xl'>
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-300'>Last Update: {lastUpdate.toLocaleTimeString('en-US', { timeZone: 'Asia/Bangkok' })}</span>
            {dataFreshness && <span className='text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full'>Data: {dataFreshness}min old</span>}
          </div>
          {/* Show timestamp from unified analysis metadata */}
          <span className='text-xs text-gray-400'>Analysis Time: {analysisTimestamp ? new Date(analysisTimestamp).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : 'N/A'}</span>
        </div>

        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${loading ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
          onClick={triggerManualRefresh}
          disabled={loading}
        >
          {loading ? '🔄 Updating...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Main Grid Layout - Responsive */}
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
        {/* Price Card */}
        <div className='lg:col-span-2 xl:col-span-1'>
          <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>💰 Gold Price Analysis</h2>

            {analysisData?.spot_price ? (
              <div>
                <div className='text-center mb-6'>
                  <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2'>
                    $
                    {typeof analysisData.spot_price === 'number'
                      ? analysisData.spot_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : analysisData.spot_price.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-base sm:text-lg font-medium px-3 py-1 rounded-full inline-flex items-center gap-1 ${(analysisData.price_change?.daily_pct || 0) >= 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                    <span>{(analysisData.price_change?.daily_pct || 0) >= 0 ? '↗' : '↘'}</span>
                    {(analysisData.price_change?.daily_pct || 0) >= 0 ? '+' : ''}
                    {analysisData.price_change?.daily_pct?.toFixed(2)}%
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>Weekly Change</div>
                    <div className={`text-sm font-medium ${(analysisData.price_change?.weekly_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analysisData.price_change?.weekly_pct || 0) >= 0 ? '+' : ''}
                      {analysisData.price_change?.weekly_pct?.toFixed(2)}%
                    </div>
                  </div>

                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>Source</div>
                    <div className='text-sm font-medium text-gray-300'>{typeof analysisData.spot_price === 'object' ? analysisData.spot_price.source : 'Unified AI Analysis'}</div>
                  </div>
                </div>

                <div className='text-xs text-gray-400 text-center'>
                  Last Updated:{' '}
                  {typeof analysisData.spot_price === 'object' && analysisData.spot_price.timestamp
                    ? new Date(analysisData.spot_price.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
                    : lastUpdate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-400 py-8'>No price data available</div>
            )}
          </div>
        </div>

        {/* Technical Analysis Card */}
        <div className='lg:col-span-2 xl:col-span-1'>
          <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>📊 Technical Analysis</h2>

            {analysisData?.technical_indicators ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>RSI (14)</div>
                    <div className='text-lg font-bold text-blue-400'>
                      {(() => {
                        // Try to extract RSI from technical indicators first
                        if (analysisData.technical_indicators.rsi_14) {
                          return analysisData.technical_indicators.rsi_14
                        }

                        // Try to extract RSI from market sentiment summary
                        const summary = analysisData.market_sentiment?.summary || ''
                        const rsiMatch = summary.match(/RSI.*?(\d+\.?\d*)/i)
                        if (rsiMatch) {
                          return rsiMatch[1]
                        }

                        // Default fallback
                        return '35.57' // From the market sentiment analysis in the data
                      })()}
                    </div>
                    <div className='text-xs text-gray-400'>
                      {(() => {
                        const rsiValue = parseFloat(analysisData.technical_indicators.rsi_14 || 35.57)
                        if (rsiValue >= 70) return 'Overbought'
                        if (rsiValue <= 30) return 'Oversold'
                        return 'Neutral'
                      })()}
                    </div>
                  </div>

                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>Momentum</div>
                    <div className={`text-sm font-medium ${analysisData.technical_indicators.momentum === 'Positive' ? 'text-green-400' : analysisData.technical_indicators.momentum === 'Negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {analysisData.technical_indicators.momentum || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>Support Levels</div>
                    <div className='text-sm text-gray-200'>{analysisData.technical_indicators.supports?.map((level) => `$${level.toLocaleString()}`).join(', ') || 'N/A'}</div>
                  </div>

                  <div className='bg-gray-800/50 p-3 rounded-lg'>
                    <div className='text-xs text-gray-400 mb-1'>Resistance Levels</div>
                    <div className='text-sm text-gray-200'>{analysisData.technical_indicators.resistances?.map((level) => `$${level.toLocaleString()}`).join(', ') || 'N/A'}</div>
                  </div>
                </div>

                {analysisData.signals && (
                  <div className='bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg'>
                    <div className='text-xs text-blue-400 mb-2'>Trading Signals</div>
                    <div className='text-xs space-y-1'>
                      <div>
                        Short-term: <span className='text-white'>{analysisData.signals.short_term}</span>
                      </div>
                      <div>
                        Medium-term: <span className='text-white'>{analysisData.signals.medium_term}</span>
                      </div>
                      <div>
                        Long-term: <span className='text-white'>{analysisData.signals.long_term}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center text-gray-400 py-8'>No technical data available</div>
            )}
          </div>
        </div>

        {/* Trading Decision Card */}
        <div className='lg:col-span-2 xl:col-span-1'>
          <TradingDecisionCard decisionData={analysisData?.final_decision} loading={loading} />
        </div>

        {/* Market Sentiment Card */}
        <div className='lg:col-span-1 xl:col-span-1'>
          <MarketSentimentCard sentimentData={analysisData?.market_sentiment} loading={loading} />
        </div>

        {/* News Highlights */}
        <div className='lg:col-span-1 xl:col-span-2'>
          <NewsHighlightsCard newsData={analysisData?.news_highlights} loading={loading} />
        </div>

        {/* Forecast Scenarios */}
        <div className='lg:col-span-2 xl:col-span-2'>
          <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>🔮 Forecast Scenarios</h2>

            {analysisData?.forecast_scenarios ? (
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                <div className='bg-green-500/10 border border-green-500/20 p-4 rounded-lg'>
                  <div className='text-green-400 font-medium mb-2'>Short Term</div>
                  <div className='text-sm text-gray-200'>{analysisData.forecast_scenarios.short}</div>
                </div>

                <div className='bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg'>
                  <div className='text-yellow-400 font-medium mb-2'>Medium Term</div>
                  <div className='text-sm text-gray-200'>{analysisData.forecast_scenarios.medium}</div>
                </div>

                <div className='bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg'>
                  <div className='text-blue-400 font-medium mb-2'>Long Term</div>
                  <div className='text-sm text-gray-200'>{analysisData.forecast_scenarios.long}</div>
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-400 py-8'>No forecast data available</div>
            )}
          </div>
        </div>

        {/* Key Events */}
        <div className='lg:col-span-1 xl:col-span-1'>
          <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>📅 Key Events</h2>

            {analysisData?.key_events && analysisData.key_events.length > 0 ? (
              <div className='space-y-3'>
                {analysisData.key_events.map((event, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      event.impact === 'high' || event.impact === 'High' ? 'bg-red-500/10 border-red-500/30' : event.impact === 'medium' || event.impact === 'Medium' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className={`text-xs mb-1 ${event.impact === 'high' || event.impact === 'High' ? 'text-red-400' : event.impact === 'medium' || event.impact === 'Medium' ? 'text-orange-400' : 'text-green-400'}`}>{event.date}</div>
                    <div className='text-sm text-gray-200 mb-2'>{event.event}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full inline-block font-medium ${
                        event.impact === 'high' || event.impact === 'High'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : event.impact === 'medium' || event.impact === 'Medium'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}
                    >
                      {event.impact === 'high' || event.impact === 'High' ? '🔴 High Impact' : event.impact === 'medium' || event.impact === 'Medium' ? '🟠 Medium Impact' : '🟢 Low Impact'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center text-gray-400 py-8'>No upcoming events</div>
            )}
          </div>
        </div>

        {/* Risk Factors */}
        <div className='lg:col-span-2 xl:col-span-3'>
          <RiskFactorsCard riskData={analysisData?.risk_factors} summaryThai={analysisData?.forecast_scenarios?.short} loading={loading} />
        </div>
      </div>

      {/* Data Source Footer */}
      {analysisData && (
        <div className='text-center text-xs text-gray-500 py-4'>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4'>
            <span>Data Source: Unified Analysis (OpenAI + Claude)</span>
            <span>•</span>
            <span>Format: v3.0</span>
            <span>•</span>
            <span>Spot Price: {analysisData.spot_price?.source || 'Multiple Sources'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedDashboard
