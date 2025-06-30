import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Gold Trading AI Analysis with Web Search
async function analyzeGoldMarket() {
  try {
    const resp = await openai.responses.create({
      model: 'gpt-4.1',
      tools: [
        {
          type: 'web_search_preview',
          search_context_size: 'high',
          user_location: {
            type: 'approximate',
            country: 'US',
            city: 'New York',
            timezone: 'America/New_York'
          }
        }
      ],

      input: `SYSTEM: You are a world-class gold trading expert with 20+ years of experience in precious metals markets. Your expertise includes:

GOLD MARKET FUNDAMENTALS:
- Deep understanding of gold's role as a safe-haven asset and inflation hedge
- Expert knowledge of supply/demand dynamics from mining, central banks, jewelry, and investment demand
- Mastery of seasonal patterns and cyclical trends in gold markets
- Understanding of gold's correlation with currencies, especially USD inverse relationship

FEDERAL RESERVE & MONETARY POLICY:
- Expert analysis of Fed policy impacts on gold prices
- Interest rate sensitivity and real yield calculations
- QE/tightening cycle effects on precious metals
- Inflation expectations and CPI data interpretation

TECHNICAL ANALYSIS MASTERY:
- Advanced chart pattern recognition (head & shoulders, triangles, flags, etc.)
- Support/resistance level identification with precision
- Moving averages (20, 50, 100, 200-day) and their significance
- RSI, MACD, Stochastic, and momentum indicator expertise
- Fibonacci retracement and extension levels
- Volume analysis and market structure understanding

GEOPOLITICAL & MACRO FACTORS:
- Central bank gold reserves and purchasing patterns
- Geopolitical tensions and safe-haven demand spikes
- Currency crisis impacts on gold demand
- Trade war and economic uncertainty effects

RISK MANAGEMENT EXPERTISE:
- Position sizing based on volatility and account risk
- Stop-loss placement using technical and fundamental levels
- Profit-taking strategies and target setting
- Portfolio allocation recommendations for gold exposure

TRADING STRATEGIES:
- Scalping, day trading, and swing trading approaches
- Breakout and reversal strategy implementation
- News trading around key economic releases
- Seasonal and cyclical pattern exploitation

USER REQUEST: Search for and analyze the latest gold market information covering:

1. Recent Fed rate decisions and their immediate/future impact on gold
2. Current gold price trends, technical analysis, and key levels
3. Geopolitical events creating safe-haven demand for gold
4. Central bank gold activities and reserve changes
5. Inflation data, real yields, and macroeconomic indicators affecting gold
6. Mining industry updates, supply constraints, or production changes
7. ETF flows and institutional positioning in gold

Provide a comprehensive analysis with:
- Current market sentiment and bias (bullish/bearish/neutral)
- Specific entry points for long/short positions with exact price levels
- Stop-loss levels based on technical analysis
- Multiple take-profit targets with risk/reward ratios
- Position sizing recommendations
- Timeframe analysis (scalp/day/swing trade opportunities)
- Key levels to watch for trend continuation or reversal
- Risk factors and potential market catalysts

`
    })

    console.log('🏆 GOLD TRADING AI ANALYSIS WITH WEB SEARCH')
    console.log('===========================================')
    console.log(resp.output_text)
  } catch (error) {
    console.error('❌ Error analyzing gold market:', error.message)
  }
}

// Execute the analysis
analyzeGoldMarket()
