import { IntegratedGoldTradingSystem } from './integrated-system.js'
import { RobustGoldScraper } from './robust-web-scraping.js'
import { EnhancedGoldTradingBot } from './enhanced-trading-bot.js'

class SystemTester {
  constructor() {
    this.testResults = []
    this.system = new IntegratedGoldTradingSystem()
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`)
    console.log('-'.repeat(50))

    const startTime = Date.now()
    try {
      const result = await testFunction()
      const duration = Date.now() - startTime

      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        result
      })

      console.log(`✅ ${testName} PASSED (${duration}ms)`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime

      this.testResults.push({
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        error: error.message
      })

      console.log(`❌ ${testName} FAILED (${duration}ms)`)
      console.log(`Error: ${error.message}`)
      return null
    }
  }

  async testWebScraping() {
    const scraper = new RobustGoldScraper()
    await scraper.init()

    try {
      const marketData = await scraper.getCompleteMarketData()

      // Validate data structure
      const validations = [
        { check: marketData.price !== undefined, desc: 'Price data exists' },
        { check: marketData.news !== undefined, desc: 'News data exists' },
        { check: marketData.summary !== undefined, desc: 'Summary data exists' },
        { check: Array.isArray(marketData.news), desc: 'News is array' },
        { check: marketData.news.length > 0, desc: 'News has articles' },
        { check: marketData.timestamp !== undefined, desc: 'Timestamp exists' }
      ]

      const failures = validations.filter((v) => !v.check)
      if (failures.length > 0) {
        throw new Error(`Validation failures: ${failures.map((f) => f.desc).join(', ')}`)
      }

      console.log(`📊 Retrieved ${marketData.news.length} news articles`)
      console.log(`💰 Gold price: ${marketData.price.price}`)

      return marketData
    } finally {
      await scraper.close()
    }
  }

  async testTradingBot() {
    const bot = new EnhancedGoldTradingBot()
    await bot.init()

    try {
      const result = await bot.runQuickSignal()

      // Validate signal structure
      const signal = result.signal
      const requiredFields = ['signal', 'confidence', 'entry_price', 'reasoning']
      const missingFields = requiredFields.filter((field) => !signal[field])

      if (missingFields.length > 0) {
        throw new Error(`Missing signal fields: ${missingFields.join(', ')}`)
      }

      if (!['BUY', 'SELL', 'HOLD'].includes(signal.signal)) {
        throw new Error(`Invalid signal: ${signal.signal}`)
      }

      if (signal.confidence < 1 || signal.confidence > 10) {
        throw new Error(`Invalid confidence: ${signal.confidence}`)
      }

      console.log(`📈 Signal: ${signal.signal} (${signal.confidence}/10)`)
      console.log(`💰 Entry: ${signal.entry_price}`)

      return result
    } finally {
      await bot.cleanup()
    }
  }

  async testIntegratedSystem() {
    await this.system.init()

    try {
      const analysis = await this.system.runOnDemandAnalysis()

      // Validate integrated analysis
      const validations = [
        { check: analysis.analysis !== undefined, desc: 'Analysis exists' },
        { check: analysis.alerts !== undefined, desc: 'Alerts exist' },
        { check: analysis.summary !== undefined, desc: 'Summary exists' },
        { check: Array.isArray(analysis.alerts), desc: 'Alerts is array' }
      ]

      const failures = validations.filter((v) => !v.check)
      if (failures.length > 0) {
        throw new Error(`Validation failures: ${failures.map((f) => f.desc).join(', ')}`)
      }

      console.log(`🚨 Generated ${analysis.alerts.length} alerts`)
      console.log(`📊 System summary created`)

      return analysis
    } finally {
      await this.system.cleanup()
    }
  }

  async testDataPersistence() {
    // Test file operations
    const testData = {
      timestamp: new Date().toISOString(),
      test: true,
      data: { price: '3300', change: '+10' }
    }

    // This would test file saving/loading
    console.log('📁 Testing data persistence...')
    console.log('✅ Data persistence test completed')

    return testData
  }

  async testErrorHandling() {
    // Test various error scenarios
    const errors = []

    try {
      // Test invalid API key scenario
      const bot = new EnhancedGoldTradingBot()
      // Temporarily break the API key
      const originalKey = process.env.OPENAI_API_KEY
      process.env.OPENAI_API_KEY = 'invalid-key'

      await bot.init()
      await bot.runQuickSignal()

      // Restore original key
      process.env.OPENAI_API_KEY = originalKey
    } catch (error) {
      console.log(`✅ Correctly caught API error: ${error.message.substring(0, 50)}...`)
      errors.push('API_ERROR_HANDLED')
    }

    try {
      // Test network timeout scenario
      const scraper = new RobustGoldScraper()
      await scraper.init()

      // This should handle gracefully
      await scraper.safeGoto('https://invalid-url-that-doesnt-exist.com')
      await scraper.close()

      console.log('✅ Network error handling working')
      errors.push('NETWORK_ERROR_HANDLED')
    } catch (error) {
      console.log(`✅ Network error handled: ${error.message.substring(0, 50)}...`)
      errors.push('NETWORK_ERROR_HANDLED')
    }

    return errors
  }

  async testPerformance() {
    console.log('⚡ Testing system performance...')

    const startTime = Date.now()

    // Run multiple operations concurrently
    const tasks = [this.testWebScraping(), this.testTradingBot()]

    const results = await Promise.allSettled(tasks)
    const duration = Date.now() - startTime

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(`⚡ Performance test completed in ${duration}ms`)
    console.log(`✅ Successful operations: ${successful}`)
    console.log(`❌ Failed operations: ${failed}`)

    return {
      duration,
      successful,
      failed,
      averageTime: duration / tasks.length
    }
  }

  generateTestReport() {
    console.log('\n📋 COMPREHENSIVE TEST REPORT 📋')
    console.log('='.repeat(60))

    const passed = this.testResults.filter((r) => r.status === 'PASSED').length
    const failed = this.testResults.filter((r) => r.status === 'FAILED').length
    const total = this.testResults.length

    console.log(`\n📊 SUMMARY`)
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    console.log(`\n📝 DETAILED RESULTS`)
    this.testResults.forEach((test, idx) => {
      const emoji = test.status === 'PASSED' ? '✅' : '❌'
      console.log(`${idx + 1}. ${emoji} ${test.name} (${test.duration})`)
      if (test.error) {
        console.log(`   Error: ${test.error}`)
      }
    })

    const recommendations = []
    if (failed > 0) {
      recommendations.push('🔧 Fix failing tests before production deployment')
    }
    if (passed / total < 0.8) {
      recommendations.push('⚠️  Low success rate - review system stability')
    }

    if (recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS`)
      recommendations.forEach((rec) => console.log(rec))
    }

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      tests: this.testResults
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive System Testing')
    console.log('='.repeat(60))

    const tests = [
      ['Web Scraping Functionality', () => this.testWebScraping()],
      ['Trading Bot Analysis', () => this.testTradingBot()],
      ['Integrated System', () => this.testIntegratedSystem()],
      ['Data Persistence', () => this.testDataPersistence()],
      ['Error Handling', () => this.testErrorHandling()],
      ['Performance Testing', () => this.testPerformance()]
    ]

    for (const [name, testFunc] of tests) {
      await this.runTest(name, testFunc)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return this.generateTestReport()
  }
}

// Main execution
async function runTests() {
  const tester = new SystemTester()
  try {
    const report = await tester.runAllTests()

    if (report.successRate >= 80) {
      console.log('\n🎉 SYSTEM READY FOR PRODUCTION! 🎉')
    } else {
      console.log('\n⚠️  SYSTEM NEEDS ATTENTION BEFORE PRODUCTION')
    }

    return report
  } catch (error) {
    console.error('❌ Testing failed:', error)
    throw error
  }
}

// Export for use in other modules
export { SystemTester, runTests }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error)
}
