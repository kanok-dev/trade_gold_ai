import { exec } from 'child_process'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Test script for Gemini CLI 2025 Web Tools
class GeminiToolsTester {
  checkAuthentication() {
    console.log('🔑 Checking authentication...')
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 20)}...` : 'Not set')
    console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT || 'Not set')

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_CLOUD_PROJECT) {
      console.error('❌ Gemini CLI authentication not configured!')
      console.error('Please set up authentication first:')
      console.error('1. Get API key from: https://aistudio.google.com/app/apikey')
      console.error('2. Set environment variable: export GEMINI_API_KEY="your_api_key"')
      console.error('3. Or set up Google Cloud Project: export GOOGLE_CLOUD_PROJECT="your_project_id"')
      process.exit(1)
    }
  }

  async testWebSearch() {
    console.log('🔍 Testing Web Search Tool...')
    const prompt = `Search for the latest gold price news and Federal Reserve meeting impact on XAU/USD trading`

    return new Promise((resolve, reject) => {
      const options = {
        timeout: 30000,
        env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
      }

      exec(`/Users/kanok/.nvm/versions/node/v20.19.1/bin/gemini -y -p "${prompt}"`, options, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Web Search Test Failed:', err.message)
          if (stderr) console.error('STDERR:', stderr)
          reject(err)
        } else {
          console.log('✅ Web Search Test Success')
          console.log('Result:', stdout.substring(0, 500) + '...')
          resolve(stdout)
        }
      })
    })
  }
  async testWebFetch() {
    console.log('🌐 Testing Web Fetch Tool...')
    const prompt = `Fetch and analyze the latest gold market news from https://www.reuters.com/markets/commodities/ for trading signals`

    return new Promise((resolve, reject) => {
      const options = {
        timeout: 30000,
        env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
      }

      exec(`/Users/kanok/.nvm/versions/node/v20.19.1/bin/gemini -y -p "${prompt}"`, options, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Web Fetch Test Failed:', err.message)
          if (stderr) console.error('STDERR:', stderr)
          reject(err)
        } else {
          console.log('✅ Web Fetch Test Success')
          console.log('Result:', stdout.substring(0, 500) + '...')
          resolve(stdout)
        }
      })
    })
  }
  async testBasicPrompt() {
    console.log('💬 Testing Basic Prompt...')
    const prompt = `Explain what factors affect gold prices in financial markets`

    return new Promise((resolve, reject) => {
      const options = {
        timeout: 30000,
        env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
      }

      exec(`/Users/kanok/.nvm/versions/node/v20.19.1/bin/gemini -y -p "${prompt}"`, options, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Basic Prompt Test Failed:', err.message)
          if (stderr) console.error('STDERR:', stderr)
          reject(err)
        } else {
          console.log('✅ Basic Prompt Test Success')
          console.log('Result:', stdout.substring(0, 500) + '...')
          resolve(stdout)
        }
      })
    })
  }

  async runAllTests() {
    console.log('🧪 Starting Gemini CLI 2025 Tools Tests...\n')

    // Check authentication first
    this.checkAuthentication()
    console.log('✅ Authentication configured\n')

    try {
      // Test 1: Basic Prompt (should always work)
      await this.testBasicPrompt()
      console.log('\n' + '='.repeat(80) + '\n')

      // Test 2: Web Search Tool
      await this.testWebSearch()
      console.log('\n' + '='.repeat(80) + '\n')

      // Test 3: Web Fetch Tool
      await this.testWebFetch()
      console.log('\n' + '='.repeat(80) + '\n')

      console.log('🎉 All tests completed successfully!')
    } catch (error) {
      console.error('💀 Test suite failed:', error.message)
      process.exit(1)
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new GeminiToolsTester()
  tester.runAllTests()
}

export default GeminiToolsTester
