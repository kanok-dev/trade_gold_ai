#!/usr/bin/env node

/**
 * Test script for OpenAI Analysis Merger Bot
 */

import OpenAIAnalysisMerger from './backup/legacy-bots/openai-merger-bot.js'

async function testMergerBot() {
  console.log('🧪 Testing OpenAI Analysis Merger Bot')
  console.log('====================================\n')

  const merger = new OpenAIAnalysisMerger()

  try {
    const success = await merger.execute()

    if (success) {
      console.log('\n🎉 Test completed successfully!')
      console.log('Check the unified_analysis.json file for results.')
    } else {
      console.log('\n❌ Test failed!')
    }

    return success
  } catch (error) {
    console.error('❌ Test error:', error.message)
    return false
  }
}

// Run test
testMergerBot()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('Fatal test error:', error)
    process.exit(1)
  })
