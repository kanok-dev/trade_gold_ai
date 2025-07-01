import React, { useState, useEffect } from 'react'
import ApiService from '../services/api.js'
import PriceCard from './PriceCard'
import PortfolioCard from './PortfolioCard'
import AnalysisCard from './AnalysisCard'
import NewsCard from './NewsCard'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentPrice: '$3,307.25',
    priceChange: '+$19.65',
    portfolioData: {
      goldAllocation: 0,
      cashAllocation: 100,
      recommendation: 'HOLD'
    },
    analysisData: {
      marketRegime: 'Neutral',
      riskScore: 4.3,
      confidence: 61
    },
    latestNews: []
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadDashboardData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...')

      // Load latest analysis
      const analysisResponse = await ApiService.getLatestAnalysis()
      if (analysisResponse.success) {
        updateDashboardFromAnalysis(analysisResponse.data)
      }

      // Load portfolio status
      const portfolioResponse = await ApiService.getPortfolioStatus()
      if (portfolioResponse.success) {
        setDashboardData((prev) => ({
          ...prev,
          portfolioData: {
            goldAllocation: portfolioResponse.data.goldAllocation || 0,
            cashAllocation: portfolioResponse.data.cashAllocation || 100,
            recommendation: 'HOLD'
          }
        }))
      }

      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const updateDashboardFromAnalysis = (analysisData) => {
    console.log('📊 Processing new unified analysis data:', analysisData)

    // The API returns the data nested under a `data` property.
    // The unified analysis data is under the `unified_analysis` key.
    const analysis = analysisData.unified_analysis

    if (analysis) {
      console.log('📊 Found unified analysis, updating dashboard...')

      setDashboardData((prev) => {
        // Format price change from percentage
        const dailyChange = analysis.price_change?.daily_pct
        const priceChangeString = dailyChange ? `${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)}%` : prev.priceChange

        const newData = {
          ...prev,
          currentPrice: analysis.spot_price?.value ? `$${analysis.spot_price.value.toFixed(2)}` : prev.currentPrice,
          priceChange: priceChangeString,
          analysisData: {
            marketRegime: analysis.market_sentiment?.overall || 'Neutral',
            riskScore: prev.analysisData.riskScore, // Keep previous or default as it's not in the new structure
            confidence: analysis.final_decision?.confidence || 0
          },
          latestNews: analysis.news_highlights?.slice(0, 5) || []
        }

        console.log('📊 Updated dashboard with:', {
          currentPrice: newData.currentPrice,
          priceChange: newData.priceChange,
          marketRegime: newData.analysisData.marketRegime,
          confidence: newData.analysisData.confidence,
          newsCount: newData.latestNews.length
        })

        return newData
      })
    } else {
      console.log('❌ No unified analysis found in data structure')
    }
  }

  const triggerManualAnalysis = async () => {
    try {
      setLoading(true)
      console.log('🔄 Triggering manual analysis...')

      const response = await ApiService.triggerAnalysis()
      if (response.success) {
        updateDashboardFromAnalysis(response.analysis)
        console.log('✅ Manual analysis completed')
      }
    } catch (error) {
      console.error('❌ Error triggering analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row justify-between items-center gap-4 glass-card p-4 rounded-xl'>
        <div className='flex flex-col lg:flex-row items-center gap-4'>
          <span className='text-sm lg:text-base text-gray-300'>Last Update: {lastUpdate.toLocaleTimeString()}</span>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${loading ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
            onClick={triggerManualAnalysis}
            disabled={loading}
          >
            {loading ? '🔄 Updating...' : '🔄 Refresh Analysis'}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6'>
        <PriceCard currentPrice={dashboardData.currentPrice} priceChange={dashboardData.priceChange} loading={loading} />

        <PortfolioCard portfolioData={dashboardData.portfolioData} loading={loading} />

        <AnalysisCard analysisData={dashboardData.analysisData} loading={loading} />

        <NewsCard latestNews={dashboardData.latestNews} loading={loading} />
      </div>
    </div>
  )
}

export default Dashboard
