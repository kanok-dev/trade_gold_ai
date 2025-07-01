// Analysis routes
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Get latest analysis - Now serves the unified analysis data
router.get('/latest', async (req, res) => {
  try {
    const unifiedAnalysisPath = path.join(__dirname, '../data', 'unified_analysis.json')

    try {
      const analysisData = await fs.readFile(unifiedAnalysisPath, 'utf8')
      const parsedData = JSON.parse(analysisData)

      res.json({
        success: true,
        source: 'unified',
        timestamp: parsedData.unifiedTimestamp || new Date().toISOString(),
        data: parsedData
      })
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Unified analysis file not found.',
          message: 'Please run the data merging script to generate the unified analysis.'
        })
      }
      // For other errors (like JSON parsing), let the generic handler catch it.
      throw fileError
    }
  } catch (error) {
    console.error('Error serving unified analysis data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unified analysis data.',
      details: error.message
    })
  }
})

// Get historical analysis data
router.get('/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7

    // TODO: Implement historical data retrieval
    res.json({
      success: true,
      data: [],
      message: `Historical data for ${days} days (to be implemented)`
    })
  } catch (error) {
    console.error('Error retrieving historical data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve historical data'
    })
  }
})

// Get current market data
router.get('/market', async (req, res) => {
  try {
    // TODO: Implement real-time market data fetching
    res.json({
      success: true,
      data: {
        price: 3307.25,
        change: 19.65,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error retrieving market data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve market data'
    })
  }
})

export default router
