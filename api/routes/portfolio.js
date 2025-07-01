// Portfolio routes
import express from 'express'

const router = express.Router()

// Get portfolio status
router.get('/status', async (req, res) => {
  try {
    // Get portfolio data from data store or return default
    const portfolioData = req.dataStore?.portfolioStatus || {
      goldAllocation: 0,
      cashAllocation: 100,
      totalValue: 10000,
      lastUpdate: new Date().toISOString()
    }

    res.json({
      success: true,
      data: {
        totalValue: portfolioData.totalValue,
        goldAllocation: portfolioData.goldAllocation,
        cashAllocation: portfolioData.cashAllocation,
        positions: [],
        performance: {
          daily: Math.random() * 2 - 1, // Mock data
          weekly: Math.random() * 5 - 2.5,
          monthly: Math.random() * 10 - 5
        },
        lastUpdate: portfolioData.lastUpdate,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error retrieving portfolio status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve portfolio status',
      details: error.message
    })
  }
})

// Update portfolio allocation
router.post('/rebalance', async (req, res) => {
  try {
    const { goldAllocation, cashAllocation } = req.body

    // TODO: Implement portfolio rebalancing logic
    console.log('Portfolio rebalance request:', { goldAllocation, cashAllocation })

    res.json({
      success: true,
      data: {
        goldAllocation,
        cashAllocation,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error rebalancing portfolio:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to rebalance portfolio'
    })
  }
})

export default router
