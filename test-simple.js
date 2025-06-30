import { spawn } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

console.log('🧪 Simple Gemini CLI Test with spawn')
console.log('API Key:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 20)}...` : 'Not set')

const prompt = 'What is 2+2?'

console.log('Testing with prompt:', prompt)

const child = spawn('gemini', ['-y', '-p', prompt], {
  env: { ...process.env },
  stdio: ['pipe', 'pipe', 'pipe']
})

let stdout = ''
let stderr = ''

child.stdout.on('data', (data) => {
  stdout += data.toString()
})

child.stderr.on('data', (data) => {
  stderr += data.toString()
})

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Success!')
    console.log('Result:', stdout)
  } else {
    console.error('❌ Error - Exit code:', code)
    if (stderr) console.error('STDERR:', stderr)
    if (stdout) console.error('STDOUT:', stdout)
  }
})

// Add timeout
setTimeout(() => {
  child.kill()
  console.error('❌ Timeout - killing process')
}, 15000)
