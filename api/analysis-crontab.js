import cron from 'node-cron'
import { AnalysisSequenceRunner } from './backup/legacy-bots/run-analysis-sequence.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Crontab Manager for Gold Trading AI Analysis
 * Automatically runs analysis sequence every 6 hours when API server starts
 * Created: July 1, 2025
 */
class AnalysisCrontabManager {
  constructor() {
    this.cronJobs = new Map()
    this.logDir = path.join(__dirname, 'logs')
    this.isRunning = false
    this.lastRun = null
    this.nextRun = null
    this.runCount = 0

    // Cron schedule: every 6 hours (0 */6 * * * = at minute 0 of every 6th hour)
    this.schedule = '0 */4 * * *'

    // Alternative schedules for testing
    this.schedules = {
      every4hours: '0 */4 * * *', // Every 4 hours at minute 0
      every6hours: '0 */6 * * *', // Every 6 hours at minute 0
      every2hours: '0 */2 * * *', // Every 2 hours (for testing)
      every30min: '*/30 * * * *', // Every 30 minutes (for testing)
      every5min: '*/5 * * * *', // Every 5 minutes (for development)
      daily: '0 0 * * *', // Daily at midnight
      twiceDaily: '0 0,12 * * *' // Twice daily at midnight and noon
    }
  }

  /**
   * Initialize the crontab manager
   */
  async init() {
    try {
      // Ensure log directory exists
      await this.ensureDirectory(this.logDir)

      this.log('INFO', 'Analysis Crontab Manager initialized')
      return true
    } catch (error) {
      this.log('ERROR', 'Failed to initialize crontab manager', error.message)
      return false
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true })
    }
  }

  /**
   * Log with timestamp
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [CRON] [${level}] ${message}`

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
      const logFile = path.join(this.logDir, `crontab_${new Date().toISOString().split('T')[0]}.log`)
      const logEntry = data ? `${message}\n${JSON.stringify(data, null, 2)}\n` : `${message}\n`

      await fs.promises.appendFile(logFile, logEntry, 'utf8')
    } catch (error) {
      console.error('Failed to write to cron log file:', error.message)
    }
  }

  /**
   * Calculate next run time based on cron schedule
   */
  calculateNextRun() {
    try {
      const task = cron.schedule(this.schedule, () => {}, { scheduled: false })
      // This is a workaround to get next execution time
      const now = new Date()
      const nextTick = new Date(now.getTime() + 4 * 60 * 60 * 1000) // Add 6 hours
      return nextTick
    } catch (error) {
      this.log('ERROR', 'Failed to calculate next run time', error.message)
      return null
    }
  }

  /**
   * Execute analysis sequence
   */
  async executeAnalysis() {
    if (this.isRunning) {
      this.log('WARNING', 'Analysis already running, skipping this execution')
      return false
    }

    this.isRunning = true
    this.runCount++

    try {
      this.log('INFO', `🚀 Starting scheduled analysis execution #${this.runCount}`)

      const runner = new AnalysisSequenceRunner()
      const success = await runner.execute()

      this.lastRun = new Date().toISOString()
      this.nextRun = this.calculateNextRun()?.toISOString()

      if (success) {
        this.log('SUCCESS', `✅ Scheduled analysis #${this.runCount} completed successfully`)
      } else {
        this.log('ERROR', `❌ Scheduled analysis #${this.runCount} completed with errors`)
      }

      // Save execution status
      await this.saveExecutionStatus(success)

      return success
    } catch (error) {
      this.log('ERROR', `Fatal error in scheduled analysis #${this.runCount}`, error.message)
      return false
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Save execution status to file
   */
  async saveExecutionStatus(success) {
    try {
      const statusFile = path.join(this.logDir, 'cron_status.json')
      const status = {
        lastRun: this.lastRun,
        nextRun: this.nextRun,
        runCount: this.runCount,
        isRunning: this.isRunning,
        lastSuccess: success,
        schedule: this.schedule,
        timestamp: new Date().toISOString()
      }

      await fs.promises.writeFile(statusFile, JSON.stringify(status, null, 2), 'utf8')
      this.log('INFO', 'Execution status saved')
    } catch (error) {
      this.log('ERROR', 'Failed to save execution status', error.message)
    }
  }

  /**
   * Start the cron job with specified schedule
   */
  start(customSchedule = null) {
    try {
      const schedule = customSchedule || this.schedule

      this.log('INFO', `Starting cron job with schedule: ${schedule}`)
      this.log('INFO', `Schedule means: ${this.describeSchedule(schedule)}`)

      const task = cron.schedule(
        schedule,
        async () => {
          await this.executeAnalysis()
        },
        {
          scheduled: true,
          timezone: 'UTC'
        }
      )

      this.cronJobs.set('analysis', task)
      this.nextRun = this.calculateNextRun()?.toISOString()

      this.log('SUCCESS', `✅ Cron job started successfully`)
      this.log('INFO', `Next scheduled run: ${this.nextRun}`)

      return true
    } catch (error) {
      this.log('ERROR', 'Failed to start cron job', error.message)
      return false
    }
  }

  /**
   * Stop the cron job
   */
  stop() {
    try {
      const task = this.cronJobs.get('analysis')
      if (task) {
        task.stop()
        this.cronJobs.delete('analysis')
        this.log('INFO', 'Cron job stopped')
        return true
      } else {
        this.log('WARNING', 'No active cron job to stop')
        return false
      }
    } catch (error) {
      this.log('ERROR', 'Failed to stop cron job', error.message)
      return false
    }
  }

  /**
   * Describe what a cron schedule means in human terms
   */
  describeSchedule(schedule) {
    const descriptions = {
      '0 */4 * * *': 'Every 4 hours at minute 0',
      '0 */6 * * *': 'Every 6 hours at minute 0',
      '0 */2 * * *': 'Every 2 hours at minute 0',
      '*/30 * * * *': 'Every 30 minutes',
      '*/5 * * * *': 'Every 5 minutes',
      '0 0 * * *': 'Daily at midnight',
      '0 0,12 * * *': 'Twice daily at midnight and noon'
    }

    return descriptions[schedule] || 'Custom schedule'
  }

  /**
   * Get current status
   */
  getStatus() {
    const hasActiveJob = this.cronJobs.has('analysis')

    return {
      isActive: hasActiveJob,
      isRunning: this.isRunning,
      schedule: this.schedule,
      scheduleDescription: this.describeSchedule(this.schedule),
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      runCount: this.runCount,
      totalJobs: this.cronJobs.size
    }
  }

  /**
   * Manually trigger analysis (outside of schedule)
   */
  async triggerManual() {
    this.log('INFO', '🔧 Manual analysis trigger requested')
    return await this.executeAnalysis()
  }

  /**
   * Change schedule (requires restart)
   */
  changeSchedule(newSchedule) {
    try {
      // Validate schedule
      const testTask = cron.schedule(newSchedule, () => {}, { scheduled: false })
      testTask.destroy()

      this.schedule = newSchedule

      // Restart if currently running
      if (this.cronJobs.has('analysis')) {
        this.stop()
        this.start()
      }

      this.log('INFO', `Schedule changed to: ${newSchedule} (${this.describeSchedule(newSchedule)})`)
      return true
    } catch (error) {
      this.log('ERROR', 'Invalid cron schedule provided', error.message)
      return false
    }
  }
}

/**
 * Create and export singleton instance
 */
const crontabManager = new AnalysisCrontabManager()

/**
 * Initialize and start crontab when module is loaded
 */
async function initializeCrontab() {
  try {
    await crontabManager.init()

    // Start with default 6-hour schedule
    crontabManager.start()

    console.log('✅ Analysis Crontab Manager started successfully')

    return crontabManager
  } catch (error) {
    console.error('❌ Failed to initialize crontab manager:', error.message)
    return null
  }
}

export default crontabManager
export { AnalysisCrontabManager, initializeCrontab }
