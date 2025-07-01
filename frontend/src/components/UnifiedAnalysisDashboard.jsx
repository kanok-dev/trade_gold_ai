/**
 * Unified Analysis Dashboard Component
 * Displays merged analysis data from multiple sources in a unified format
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'

const UnifiedAnalysisDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null)
  const [sources, setSources] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // API base URL
  const API_BASE = '/api/analysis'

  /**
   * Fetch unified analysis data
   */
  const fetchAnalysisData = async (refresh = false) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/unified`, {
        params: { refresh: refresh ? 'true' : 'false' }
      })

      if (response.data.success) {
        setAnalysisData(response.data.data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError('Failed to load analysis data')
      }
    } catch (err) {
      setError(`Error loading data: ${err.message}`)
      console.error('Error fetching analysis data:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch data sources information
   */
  const fetchSources = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sources`)
      if (response.data.success) {
        setSources(response.data.sources)
      }
    } catch (err) {
      console.error('Error fetching sources:', err)
    }
  }

  /**
   * Trigger fresh data merge
   */
  const triggerMerge = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE}/merge`)

      if (response.data.success) {
        setAnalysisData(response.data.data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError('Failed to merge data')
      }
    } catch (err) {
      setError(`Error merging data: ${err.message}`)
      console.error('Error triggering merge:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchAnalysisData()
    fetchSources()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalysisData(true)
        fetchSources()
      }, 60000) // Refresh every minute
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleString()
  }

  /**
   * Get status color based on data freshness
   */
  const getStatusColor = (minutes) => {
    if (minutes < 5) return 'text-green-600'
    if (minutes < 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  /**
   * Format price change with color
   */
  const formatPriceChange = (change) => {
    if (!change) return 'N/A'
    const color = change >= 0 ? 'text-green-600' : 'text-red-600'
    const sign = change >= 0 ? '+' : ''
    return (
      <span className={color}>
        {sign}
        {change.toFixed(2)}%
      </span>
    )
  }

  if (loading && !analysisData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (error && !analysisData) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        <strong className='font-bold'>Error: </strong>
        <span className='block sm:inline'>{error}</span>
        <button onClick={() => fetchAnalysisData(true)} className='mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm'>
          Retry
        </button>
      </div>
    )
  }

  const analysis = analysisData?.unified_analysis

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-3xl font-bold text-gray-900'>Gold Analysis Dashboard</h1>
          <div className='flex space-x-2'>
            <button onClick={() => fetchAnalysisData(true)} disabled={loading} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button onClick={triggerMerge} disabled={loading} className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'>
              Force Merge
            </button>
            <label className='flex items-center'>
              <input type='checkbox' checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className='mr-2' />
              Auto Refresh
            </label>
          </div>
        </div>

        {/* Data Status */}
        {analysisData && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='font-semibold'>Source:</span> {analysisData.source}
            </div>
            <div>
              <span className='font-semibold'>Updated:</span> {formatTimestamp(analysisData.timestamp)}
            </div>
            <div>
              <span className='font-semibold'>Freshness:</span>
              <span className={getStatusColor(analysisData.data_freshness_minutes)}> {analysisData.data_freshness_minutes} min ago</span>
            </div>
            <div>
              <span className='font-semibold'>Last Fetched:</span> {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
          </div>
        )}
      </div>

      {/* Current Price */}
      {analysis?.spot_price && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Current Gold Price (XAU/USD)</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>${analysis.spot_price.value?.toFixed(2)}</div>
              <div className='text-sm text-gray-600'>{analysis.spot_price.source}</div>
            </div>
            <div className='text-center'>
              <div className='text-lg'>Daily Change</div>
              <div className='text-xl font-semibold'>{formatPriceChange(analysis.price_change.daily_pct)}</div>
            </div>
            <div className='text-center'>
              <div className='text-lg'>Weekly Change</div>
              <div className='text-xl font-semibold'>{formatPriceChange(analysis.price_change.weekly_pct)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Trading Signals */}
      {analysis?.signals && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Trading Signals</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-lg font-semibold'>Short Term</div>
              <div className={`text-xl font-bold ${analysis.signals.short_term === 'BUY' ? 'text-green-600' : analysis.signals.short_term === 'SELL' ? 'text-red-600' : 'text-yellow-600'}`}>{analysis.signals.short_term || 'N/A'}</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold'>Medium Term</div>
              <div className={`text-xl font-bold ${analysis.signals.medium_term === 'BUY' ? 'text-green-600' : analysis.signals.medium_term === 'SELL' ? 'text-red-600' : 'text-yellow-600'}`}>{analysis.signals.medium_term || 'N/A'}</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-semibold'>Long Term</div>
              <div className={`text-xl font-bold ${analysis.signals.long_term === 'BUY' ? 'text-green-600' : analysis.signals.long_term === 'SELL' ? 'text-red-600' : 'text-yellow-600'}`}>{analysis.signals.long_term || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Final Recommendation */}
      {analysis?.final_decision && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Final Recommendation</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <div className='text-center'>
                <div className={`text-2xl font-bold ${analysis.final_decision.action === 'BUY' ? 'text-green-600' : analysis.final_decision.action === 'SELL' ? 'text-red-600' : 'text-yellow-600'}`}>{analysis.final_decision.action}</div>
                <div className='text-lg text-gray-600'>{analysis.final_decision.confidence}% Confidence</div>
              </div>
            </div>
            <div>
              <div className='text-sm text-gray-700'>
                <strong>Reasoning:</strong> {analysis.final_decision.reasoning}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Levels */}
      {(analysis?.technical_indicators?.supports?.length > 0 || analysis?.technical_indicators?.resistances?.length > 0) && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Technical Levels</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-semibold text-green-600 mb-2'>Support Levels</h3>
              <div className='space-y-1'>
                {analysis.technical_indicators.supports.map((level, index) => (
                  <div key={index} className='text-green-600 font-mono'>
                    ${level.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-red-600 mb-2'>Resistance Levels</h3>
              <div className='space-y-1'>
                {analysis.technical_indicators.resistances.map((level, index) => (
                  <div key={index} className='text-red-600 font-mono'>
                    ${level.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Highlights */}
      {analysis?.news_highlights?.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Latest News</h2>
          <div className='space-y-3'>
            {analysis.news_highlights.slice(0, 5).map((news, index) => (
              <div key={index} className='border-l-4 border-blue-500 pl-4'>
                <div className='flex justify-between items-start'>
                  <a href={news.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:text-blue-800 font-medium'>
                    {news.headline}
                  </a>
                  <span className={`text-sm px-2 py-1 rounded ${news.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : news.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{news.sentiment}</span>
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  {news.source} • {formatTimestamp(news.timestamp)} • From {news.origin}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Sources Status */}
      {sources && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold mb-4'>Data Sources Status</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {Object.entries(sources).map(([sourceName, sourceData]) => (
              <div key={sourceName} className='border rounded p-3'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='font-semibold capitalize'>{sourceName}</h3>
                  <span className={`w-3 h-3 rounded-full ${sourceData.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                {sourceData.available ? (
                  <div className='text-sm text-gray-600 space-y-1'>
                    <div>Age: {sourceData.age_minutes} min</div>
                    <div>Updated: {formatTimestamp(sourceData.timestamp)}</div>
                    {sourceData.model && <div>Model: {sourceData.model}</div>}
                    {sourceData.bot_version && <div>Version: {sourceData.bot_version}</div>}
                  </div>
                ) : (
                  <div className='text-sm text-red-600'>Not available</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          <strong className='font-bold'>Warning: </strong>
          <span className='block sm:inline'>{error}</span>
        </div>
      )}
    </div>
  )
}

export default UnifiedAnalysisDashboard
