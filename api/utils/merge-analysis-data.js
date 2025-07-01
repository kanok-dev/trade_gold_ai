#!/usr/bin/env node

/**
 * Command Line Tool for Merging Analysis Data Formats
 * Usage: node merge-analysis-data.js [options]
 */

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { DataFormatMerger } from './data-format-merger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class AnalysisDataMergerCLI {
  constructor() {
    this.merger = new DataFormatMerger()
    this.defaultPaths = {
      openai: path.join(__dirname, '../data/latest_analysis.json'),
      claude: path.join(__dirname, '../data/latest_claude_analysis.json'),
      output: path.join(__dirname, '../data/unified_analysis.json')
    }
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2)
    const options = {
      openaiPath: this.defaultPaths.openai,
      claudePath: this.defaultPaths.claude,
      outputPath: this.defaultPaths.output,
      help: false,
      verbose: false,
      watch: false
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      switch (arg) {
        case '--openai':
        case '-o':
          options.openaiPath = args[++i]
          break
        case '--claude':
        case '-c':
          options.claudePath = args[++i]
          break
        case '--output':
        case '-u':
          options.outputPath = args[++i]
          break
        case '--help':
        case '-h':
          options.help = true
          break
        case '--verbose':
        case '-v':
          options.verbose = true
          break
        case '--watch':
        case '-w':
          options.watch = true
          break
        default:
          console.warn(`Unknown option: ${arg}`)
      }
    }

    return options
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
Analysis Data Format Merger

USAGE:
  node merge-analysis-data.js [options]

OPTIONS:
  -o, --openai <path>     Path to OpenAI analysis file (default: ../data/latest_analysis.json)
  -c, --claude <path>     Path to Claude analysis file (default: ../data/latest_claude_analysis.json)
  -u, --output <path>     Path to output unified file (default: ../data/unified_analysis.json)
  -v, --verbose           Enable verbose output
  -w, --watch             Watch for file changes and auto-merge
  -h, --help              Show this help message

EXAMPLES:
  # Merge with default paths
  node merge-analysis-data.js

  # Merge specific files
  node merge-analysis-data.js --openai ./openai.json --claude ./claude.json --output ./merged.json

  # Watch for changes and auto-merge
  node merge-analysis-data.js --watch --verbose

  # Merge only OpenAI data
  node merge-analysis-data.js --claude ""

  # Merge only Claude data
  node merge-analysis-data.js --openai ""
`)
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Perform the merge operation
   */
  async performMerge(options) {
    const { openaiPath, claudePath, outputPath, verbose } = options

    if (verbose) {
      console.log('🔄 Starting analysis data merge...')
      console.log(`📂 OpenAI data: ${openaiPath || 'None'}`)
      console.log(`📂 Claude data: ${claudePath || 'None'}`)
      console.log(`📄 Output file: ${outputPath}`)
    }

    // Check input files
    const openaiExists = openaiPath && (await this.fileExists(openaiPath))
    const claudeExists = claudePath && (await this.fileExists(claudePath))

    if (!openaiExists && !claudeExists) {
      throw new Error('No valid input files found. At least one analysis file must exist.')
    }

    if (verbose) {
      console.log(`✅ OpenAI file ${openaiExists ? 'found' : 'not found'}`)
      console.log(`✅ Claude file ${claudeExists ? 'found' : 'not found'}`)
    }

    // Load and merge data
    const mergedData = await this.merger.loadAndMergeFiles(openaiExists ? openaiPath : null, claudeExists ? claudePath : null)

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Save merged data
    await this.merger.saveMergedData(mergedData, outputPath)

    if (verbose) {
      console.log(`✅ Merged data saved to: ${outputPath}`)
      console.log(`📊 Data source: ${mergedData.source}`)
      console.log(`🕐 Timestamp: ${mergedData.timestamp}`)
      console.log(`⏰ Data freshness: ${mergedData.data_freshness_minutes} minutes`)

      const analysis = mergedData.unified_analysis
      if (analysis.spot_price?.value) {
        console.log(`💰 Current price: $${analysis.spot_price.value}`)
      }
      if (analysis.final_decision?.action) {
        console.log(`📈 Recommendation: ${analysis.final_decision.action} (${analysis.final_decision.confidence}% confidence)`)
      }
    }

    return mergedData
  }

  /**
   * Watch files for changes
   */
  async watchFiles(options) {
    const { openaiPath, claudePath, verbose } = options
    const fs = require('fs')

    console.log('👀 Watching for file changes...')
    console.log('Press Ctrl+C to stop watching')

    const filesToWatch = [openaiPath, claudePath].filter(Boolean)

    for (const filePath of filesToWatch) {
      if (await this.fileExists(filePath)) {
        fs.watchFile(filePath, { interval: 1000 }, async (curr, prev) => {
          if (curr.mtime > prev.mtime) {
            if (verbose) {
              console.log(`\n📝 File changed: ${filePath}`)
            }

            try {
              await this.performMerge(options)
              console.log('✅ Auto-merge completed')
            } catch (error) {
              console.error('❌ Auto-merge failed:', error.message)
            }
          }
        })

        if (verbose) {
          console.log(`👁️  Watching: ${filePath}`)
        }
      }
    }

    // Perform initial merge
    try {
      await this.performMerge(options)
      console.log('✅ Initial merge completed')
    } catch (error) {
      console.error('❌ Initial merge failed:', error.message)
    }

    // Keep process alive
    return new Promise(() => {})
  }

  /**
   * Main entry point
   */
  async run() {
    try {
      const options = this.parseArguments()

      if (options.help) {
        this.showHelp()
        return
      }

      if (options.watch) {
        await this.watchFiles(options)
      } else {
        await this.performMerge(options)
        console.log('✅ Analysis data merge completed successfully')
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AnalysisDataMergerCLI()
  cli.run()
}

export { AnalysisDataMergerCLI }
