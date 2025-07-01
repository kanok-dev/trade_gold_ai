import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Extract JSON analysis from existing Claude response files
function extractAnalysisFromFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // Check if it's already a clean analysis
    if (data.priceData && data.sentiment && !data.response) {
      console.log('✅ File already contains clean analysis')
      return data
    }

    // Extract from full response
    const response = data.response || data
    const content = response.content || []

    let jsonText = ''

    // Look for JSON content in Claude's response
    for (const item of content) {
      if (item.type === 'text' && item.text) {
        const text = item.text

        // Look for JSON block patterns
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"timestamp"[\s\S]*\}/) || text.match(/\{[\s\S]*"priceData"[\s\S]*\}/)

        if (jsonMatch) {
          jsonText = jsonMatch[1] || jsonMatch[0]
          break
        }
      }
    }

    // Clean and parse JSON
    if (jsonText) {
      jsonText = jsonText.replace(/```json|```/g, '').trim()
      return JSON.parse(jsonText)
    }

    throw new Error('No JSON analysis found in response')
  } catch (error) {
    console.error('❌ Error extracting analysis:', error.message)
    return null
  }
}

// Process command line arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage: node extract-json-analysis.js <input-file> [output-file]')
  console.log('Example: node extract-json-analysis.js ../data/claude-analysis-2025-07-01T13-45-10.json')
  process.exit(1)
}

const inputFile = args[0]
const outputFile = args[1] || inputFile.replace('.json', '-clean.json')

console.log(`🔍 Extracting JSON analysis from: ${inputFile}`)

const analysis = extractAnalysisFromFile(inputFile)

if (analysis) {
  fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2))
  console.log(`✅ Clean analysis saved to: ${outputFile}`)
  console.log('\n📊 Analysis Preview:')
  console.log(`📈 Price: $${analysis.priceData?.spotPrice || 'N/A'}`)
  console.log(`📊 Sentiment: ${analysis.sentiment || 'N/A'}`)
  console.log(`🎯 Signal: ${analysis.signal || 'N/A'}`)
  console.log(`⚠️ Risk Level: ${analysis.riskLevel || 'N/A'}`)
} else {
  console.log('❌ Failed to extract analysis')
  process.exit(1)
}
