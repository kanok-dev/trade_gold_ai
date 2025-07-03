import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the api directory (two levels up from current location)
dotenv.config({ path: path.join(__dirname, '../../.env') })
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const feedNewsAIBot = async () => {
  try {
    const response = await openai.responses.create({
      prompt: {
        id: 'pmpt_6865dda6b28481949472cf7fcf6fcd150482bcf7cac98a3b',
        version: '7'
      }
    })

    return response
  } catch (error) {
    console.error('Error running OpenAI bot:', error)
    throw error
  }
}

export async function feedNews() {
  try {
    const result = await feedNewsAIBot()
    try {
      const jsonData = JSON.parse(result.output_text)
      console.log('Output text is valid JSON.')

      jsonData.usage = result.usage
      jsonData.timestamp = new Date().toISOString()

      const newsDir = path.join(__dirname, 'news')

      try {
        await fs.mkdir(newsDir, { recursive: true })
      } catch (mkdirErr) {
        if (mkdirErr.code !== 'EEXIST') throw mkdirErr
      }

      const fileName = `news_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const filePath = path.join(newsDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2))

      console.log(`JSON data saved to ${filePath}`)
    } catch (jsonError) {
      console.error('Output text is not valid JSON:', jsonError)
    }
  } catch (error) {
    console.error('Bot run failed:', error)
  }
}

feedNews()
