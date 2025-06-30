import { exec } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

// Alternative test using direct command execution without child process issues
class GeminiWorkingTest {
  async testDirectCommand() {
    console.log('🧪 Testing Gemini CLI with direct shell execution...')

    return new Promise((resolve, reject) => {
      // Use a shell script approach to avoid Node.js child_process issues
      const testScript = `
        export GEMINI_API_KEY="${process.env.GEMINI_API_KEY}"
        echo "Testing with API key: \${GEMINI_API_KEY:0:20}..."
        timeout 10 gemini -y -p "What factors affect gold prices?"
      `

      exec(testScript, { shell: '/bin/bash', timeout: 15000 }, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Direct command failed:', err.message)
          if (stderr) console.error('STDERR:', stderr)
          reject(err)
        } else {
          console.log('✅ Direct command success!')
          console.log('Result:', stdout)
          resolve(stdout)
        }
      })
    })
  }

  async testAlternativeAPI() {
    console.log('🔄 Testing alternative: Direct Gemini API call...')

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'What are the main factors that affect gold prices in financial markets? Provide a brief analysis.'
              }
            ]
          }
        ]
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Direct API call success!')
      console.log('Result:', data.candidates[0].content.parts[0].text.substring(0, 500) + '...')
      return data.candidates[0].content.parts[0].text
    } else {
      console.error('❌ Direct API call failed:', response.status, response.statusText)
      throw new Error(`API call failed: ${response.status}`)
    }
  }

  async runTests() {
    console.log('🧪 Starting Gemini Working Tests...\n')

    try {
      // Test 1: Direct shell command
      await this.testDirectCommand()
      console.log('\n' + '='.repeat(80) + '\n')
    } catch (error) {
      console.error('Direct command test failed:', error.message)
    }

    try {
      // Test 2: Direct API call
      await this.testAlternativeAPI()
      console.log('\n' + '='.repeat(80) + '\n')
    } catch (error) {
      console.error('Direct API test failed:', error.message)
    }

    console.log('🎉 Working tests completed!')
  }
}

const tester = new GeminiWorkingTest()
tester.runTests().catch(console.error)
