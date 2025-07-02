import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Gold Trading AI Analysis Sequence Runner
 * Runs the three analysis bots in the correct order with proper error handling
 * Created: July 1, 2025
 */
class AnalysisSequenceRunner {
  constructor() {
    this.scriptDir = __dirname
    this.apiDir = path.dirname(path.dirname(__dirname))
    this.logDir = path.join(this.apiDir, 'logs')

    // Bot configurations
    this.bots = [
      {
        name: 'OpenAI Bot',
        file: 'openAI-bot.js',
        path: path.join(this.scriptDir, 'openAI-bot.js'),
        step: 1,
        delay: 30000 // 30 seconds delay after this bot
      },
      {
        name: 'Claude Bot Improved',
        file: 'claude-bot-improved.js',
        path: path.join(this.scriptDir, 'claude-bot-improved.js'),
        step: 2,
        delay: 15000 // 15 seconds delay after this bot
      },
      {
        name: 'OpenAI Merger Bot',
        file: 'openai-merger-bot.js',
        path: path.join(this.scriptDir, 'openai-merger-bot.js'),
        step: 3,
        delay: 0 // No delay after final bot
      }
    ]

    this.results = {
      timestamp: new Date().toISOString(),
      totalBots: this.bots.length,
      successful: 0,
      failed: 0,
      errors: [],
      botResults: []
    }
  }

  /**
   * Initialize the runner - create directories and check prerequisites
   */
  async init() {
    try {
      // Ensure log directory exists
      await this.ensureDirectory(this.logDir)

      // Check if all bot files exist
      await this.checkBotFiles()

      console.log('✅ Analysis Sequence Runner initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Initialization failed:', error.message)
      return false
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true })
      console.log(`📁 Created directory: ${dirPath}`)
    }
  }

  /**
   * Check if all required bot files exist
   */
  async checkBotFiles() {
    for (const bot of this.bots) {
      if (!fs.existsSync(bot.path)) {
        throw new Error(`Required bot file not found: ${bot.path}`)
      }
    }
    console.log('✅ All bot files verified')
  }

  /**
   * Log message with timestamp
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level}] ${message}`

    console.log(logMessage)

    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }

    // Save to log file
    this.saveLogToFile(logMessage, data)
  }

  /**
   * Save log to file
   */
  async saveLogToFile(message, data = null) {
    try {
      const logFile = path.join(this.logDir, `analysis_sequence_${new Date().toISOString().split('T')[0]}.log`)
      const logEntry = data ? `${message}\n${JSON.stringify(data, null, 2)}\n` : `${message}\n`

      await fs.promises.appendFile(logFile, logEntry, 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error.message)
    }
  }

  /**
   * Run a single bot with proper error handling
   */
  async runBot(bot) {
    return new Promise((resolve) => {
      this.log('INFO', `Starting ${bot.name} (Step ${bot.step})`)

      const startTime = Date.now()
      let output = ''
      let errorOutput = ''

      // Determine working directory based on bot location
      const workingDir = bot.path.includes('legacy-bots') ? this.scriptDir : this.apiDir

      const childProcess = spawn('node', [bot.path], {
        cwd: workingDir,
        env: process.env,
        stdio: 'pipe'
      })

      // Capture stdout
      childProcess.stdout.on('data', (data) => {
        const text = data.toString()
        output += text
        process.stdout.write(text) // Real-time output
      })

      // Capture stderr
      childProcess.stderr.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        process.stderr.write(text) // Real-time error output
      })

      // Handle process completion
      childProcess.on('close', (code) => {
        const endTime = Date.now()
        const duration = endTime - startTime
        const success = code === 0

        const result = {
          bot: bot.name,
          step: bot.step,
          success,
          exitCode: code,
          duration: `${(duration / 1000).toFixed(2)}s`,
          timestamp: new Date().toISOString(),
          output: output.slice(-1000), // Keep last 1000 chars
          error: errorOutput || null
        }

        this.results.botResults.push(result)

        if (success) {
          this.results.successful++
          this.log('SUCCESS', `${bot.name} completed successfully`, {
            duration: result.duration,
            exitCode: code
          })
        } else {
          this.results.failed++
          this.results.errors.push(`${bot.name}: Exit code ${code}`)
          this.log('ERROR', `${bot.name} failed`, {
            exitCode: code,
            duration: result.duration,
            error: errorOutput
          })
        }

        resolve(result)
      })

      // Handle process errors
      childProcess.on('error', (error) => {
        const result = {
          bot: bot.name,
          step: bot.step,
          success: false,
          exitCode: -1,
          duration: '0s',
          timestamp: new Date().toISOString(),
          output: '',
          error: error.message
        }

        this.results.botResults.push(result)
        this.results.failed++
        this.results.errors.push(`${bot.name}: ${error.message}`)

        this.log('ERROR', `${bot.name} process error`, { error: error.message })
        resolve(result)
      })
    })
  }

  /**
   * Wait for specified duration
   */
  async wait(ms) {
    if (ms > 0) {
      this.log('INFO', `⏳ Waiting ${ms / 1000}s before next bot...`)
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }

  /**
   * Execute the complete analysis sequence
   */
  async execute() {
    this.log('INFO', '🚀 Starting Gold Trading AI Analysis Sequence')
    this.log('INFO', `Total bots to run: ${this.bots.length}`)

    const startTime = Date.now()

    try {
      // Initialize
      const initialized = await this.init()
      if (!initialized) {
        throw new Error('Initialization failed')
      }

      // Run each bot in sequence
      for (const bot of this.bots) {
        const result = await this.runBot(bot)

        // Wait between bots (except after the last one)
        if (bot.delay > 0) {
          await this.wait(bot.delay)
        }
      }

      const endTime = Date.now()
      const totalDuration = endTime - startTime

      // Generate final report
      this.results.totalDuration = `${(totalDuration / 1000).toFixed(2)}s`
      this.results.completionTime = new Date().toISOString()

      await this.generateReport()

      const success = this.results.failed === 0
      this.log(success ? 'SUCCESS' : 'PARTIAL', `Analysis sequence completed: ${this.results.successful}/${this.results.totalBots} bots successful`)

      return success
    } catch (error) {
      this.log('ERROR', 'Fatal error in analysis sequence', { error: error.message })
      this.results.errors.push(`Fatal error: ${error.message}`)
      return false
    }
  }

  /**
   * Generate and save execution report
   */
  async generateReport() {
    try {
      const reportFile = path.join(this.logDir, `analysis_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`)

      await fs.promises.writeFile(reportFile, JSON.stringify(this.results, null, 2), 'utf8')

      this.log('INFO', `📊 Execution report saved: ${reportFile}`)

      // Display summary
      console.log('\n📊 EXECUTION SUMMARY')
      console.log('='.repeat(50))
      console.log(`🕐 Total Duration: ${this.results.totalDuration}`)
      console.log(`✅ Successful: ${this.results.successful}/${this.results.totalBots}`)
      console.log(`❌ Failed: ${this.results.failed}/${this.results.totalBots}`)

      if (this.results.errors.length > 0) {
        console.log(`⚠️  Errors: ${this.results.errors.length}`)
        this.results.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`)
        })
      }

      // Display individual bot results
      console.log('\n🤖 BOT RESULTS')
      console.log('='.repeat(50))
      this.results.botResults.forEach((result) => {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} Step ${result.step}: ${result.bot} (${result.duration})`)
      })
    } catch (error) {
      this.log('ERROR', 'Failed to generate report', { error: error.message })
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const runner = new AnalysisSequenceRunner()

  try {
    const success = await runner.execute()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Analysis sequence interrupted by user')
  process.exit(130)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Analysis sequence terminated')
  process.exit(143)
})

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default AnalysisSequenceRunner
export { AnalysisSequenceRunner }
