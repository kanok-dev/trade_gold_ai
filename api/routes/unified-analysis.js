/**
 * Unified Analysis API Route
 * Provides merged and standardized analysis data for frontend consumption
 */

import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { DataFormatMerger } from '../utils/data-format-merger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const merger = new DataFormatMerger()

// Data file paths
const DATA_PATHS = {
  openai: path.join(__dirname, '../data/latest_analysis.json'),
  claude: path.join(__dirname, '../data/latest_claude_analysis.json'),
  unified: path.join(__dirname, '../data/unified_analysis.json')
}

/**
 * GET /api/analysis/unified
 * Returns unified analysis data in standardized format
 */
router.get('/unified', async (req, res) => {
  try {
    const { source, refresh } = req.query

    // Check if we should refresh or use cached unified data
    const shouldRefresh = refresh === 'true' || !(await fileExists(DATA_PATHS.unified))

    let unifiedData

    if (shouldRefresh) {
      // Generate fresh unified data
      unifiedData = await merger.loadAndMergeFiles((await fileExists(DATA_PATHS.openai)) ? DATA_PATHS.openai : null, (await fileExists(DATA_PATHS.claude)) ? DATA_PATHS.claude : null)

      // Save the unified data for future use
      await merger.saveMergedData(unifiedData, DATA_PATHS.unified)
    } else {
      // Load cached unified data
      const unifiedContent = await fs.readFile(DATA_PATHS.unified, 'utf8')
      unifiedData = JSON.parse(unifiedContent)

      // Update freshness
      if (unifiedData.timestamp) {
        const now = new Date()
        const dataTime = new Date(unifiedData.timestamp)
        unifiedData.data_freshness_minutes = Math.floor((now - dataTime) / (1000 * 60))
      }
    }

    // Filter by source if requested
    if (source && source !== 'all') {
      unifiedData = filterBySource(unifiedData, source)
    }

    res.json({
      success: true,
      data: unifiedData,
      generated_at: new Date().toISOString(),
      cached: !shouldRefresh
    })
  } catch (error) {
    console.error('Error generating unified analysis:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate unified analysis',
      message: error.message
    })
  }
})

/**
 * GET /api/analysis/sources
 * Returns information about available data sources
 */
router.get('/sources', async (req, res) => {
  try {
    const sources = {}

    // Check OpenAI data
    if (await fileExists(DATA_PATHS.openai)) {
      const stats = await fs.stat(DATA_PATHS.openai)
      const content = await fs.readFile(DATA_PATHS.openai, 'utf8')
      const data = JSON.parse(content)

      sources.openai = {
        available: true,
        last_modified: stats.mtime,
        timestamp: data.timestamp || data.saved_at,
        bot_version: data.bot_version,
        file_size: stats.size,
        age_minutes: Math.floor((new Date() - new Date(data.timestamp || data.saved_at)) / (1000 * 60))
      }
    } else {
      sources.openai = { available: false }
    }

    // Check Claude data
    if (await fileExists(DATA_PATHS.claude)) {
      const stats = await fs.stat(DATA_PATHS.claude)
      const content = await fs.readFile(DATA_PATHS.claude, 'utf8')
      const data = JSON.parse(content)

      sources.claude = {
        available: true,
        last_modified: stats.mtime,
        timestamp: data.timestamp,
        model: data.response?.model,
        file_size: stats.size,
        age_minutes: Math.floor((new Date() - new Date(data.timestamp)) / (1000 * 60)),
        token_usage: data.token_usage
      }
    } else {
      sources.claude = { available: false }
    }

    // Check unified data
    if (await fileExists(DATA_PATHS.unified)) {
      const stats = await fs.stat(DATA_PATHS.unified)
      const content = await fs.readFile(DATA_PATHS.unified, 'utf8')
      const data = JSON.parse(content)

      sources.unified = {
        available: true,
        last_modified: stats.mtime,
        timestamp: data.timestamp,
        source: data.source,
        file_size: stats.size,
        age_minutes: Math.floor((new Date() - new Date(data.timestamp)) / (1000 * 60))
      }
    } else {
      sources.unified = { available: false }
    }

    res.json({
      success: true,
      sources,
      checked_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking sources:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check data sources',
      message: error.message
    })
  }
})

/**
 * POST /api/analysis/merge
 * Triggers a fresh merge of analysis data
 */
router.post('/merge', async (req, res) => {
  try {
    const { force } = req.body

    const startTime = Date.now()

    // Always generate fresh unified data
    const unifiedData = await merger.loadAndMergeFiles((await fileExists(DATA_PATHS.openai)) ? DATA_PATHS.openai : null, (await fileExists(DATA_PATHS.claude)) ? DATA_PATHS.claude : null)

    // Save the unified data
    await merger.saveMergedData(unifiedData, DATA_PATHS.unified)

    const processingTime = Date.now() - startTime

    res.json({
      success: true,
      message: 'Analysis data merged successfully',
      data: unifiedData,
      processing_time_ms: processingTime,
      merged_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error merging analysis data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to merge analysis data',
      message: error.message
    })
  }
})

/**
 * GET /api/analysis/schema
 * Returns the unified data format schema
 */
router.get('/schema', (req, res) => {
  res.json({
    success: true,
    schema: merger.standardFormat,
    version: '3.0',
    description: 'Unified analysis data format schema'
  })
})

/**
 * Helper function to check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Filter unified data by source origin
 */
function filterBySource(data, sourceFilter) {
  const filtered = JSON.parse(JSON.stringify(data))
  const analysis = filtered.unified_analysis

  // Filter news highlights
  if (analysis.news_highlights) {
    analysis.news_highlights = analysis.news_highlights.filter((news) => news.origin === sourceFilter)
  }

  // Filter key events
  if (analysis.key_events) {
    analysis.key_events = analysis.key_events.filter((event) => event.origin === sourceFilter)
  }

  // Filter risk factors
  if (analysis.risk_factors) {
    analysis.risk_factors = analysis.risk_factors.filter((risk) => risk.origin === sourceFilter)
  }

  return filtered
}

export default router
