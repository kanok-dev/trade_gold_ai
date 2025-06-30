# Gold Trading AI Bot - Gemini CLI 2025 Edition

Automated XAU/USD gold trading signal analysis using Gemini CLI 2025 with advanced web search and web fetch tools.

## Features

### 🚀 Gemini CLI 2025 Integration
- **Web Search Tool**: Google search integration via `google_web_search()`
- **Web Fetch Tool**: Direct URL content fetching via `web_fetch()`
- **Advanced AI Analysis**: Structured trading signal analysis
- **Real-time Data**: Live market data from multiple sources

### 📱 Line Notify Integration
- Instant push notifications to your mobile device
- Formatted trading signals with emojis
- Error notifications and system status

### 🔄 Automated Scheduling
- Configurable interval execution (default: 5 minutes)
- Retry logic with exponential backoff
- Graceful error handling and recovery

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Set up Environment Variables**
```bash
export LINE_TOKEN="your_line_notify_token_here"
```

3. **Install Gemini CLI 2025** (if not already installed)
```bash
# Follow the official Gemini CLI installation guide
# Ensure you have the 2025 version with web tools support
```

## Usage

### Quick Test
Test individual Gemini CLI 2025 tools:
```bash
npm run test-tools
```

### Original Bot (Updated for 2025)
```bash
npm run gemini-bot
```

### Advanced Bot with Scheduling
```bash
npm run gold-bot-2025
```

### Manual Scripts
```bash
# Test basic functionality
node test-gemini-tools.js

# Run single analysis
node gemini-bot.js

# Start scheduled bot
node gold-trading-bot-2025.js
```

## Configuration

Edit `config.js` to customize:

```javascript
export const config = {
  // Gemini CLI settings
  gemini: {
    model: 'gemini-2.5-pro',
    timeout: 30000
  },
  
  // News sources for web_fetch
  newsSources: [
    'https://www.reuters.com/markets/commodities/',
    'https://www.bloomberg.com/news/topics/gold',
    // Add more sources...
  ],
  
  // Search queries for google_web_search
  searchQueries: [
    'latest Federal Reserve decision impact on gold prices XAU/USD trading',
    // Add more queries...
  ],
  
  // Scheduling
  schedule: {
    interval: 300000, // 5 minutes
    maxRetries: 3,
    retryDelay: 5000
  }
}
```

## Gemini CLI 2025 Tools Used

### 1. Google Web Search Tool
```javascript
google_web_search(query="your search query")
```
- Performs Google searches via Gemini API
- Returns processed summaries with citations
- Perfect for getting latest market sentiment

### 2. Web Fetch Tool
```javascript
web_fetch(prompt="Analyze content from https://example.com")
```
- Fetches content from specific URLs (up to 20)
- Processes content through Gemini API
- Ideal for analyzing specific financial news sources

### 3. Natural Language Processing
- Structured JSON analysis output
- Trading signal classification
- Risk assessment and time horizon analysis

## File Structure

```
trade_gold_ai/
├── gemini-bot.js              # Updated original bot
├── gold-trading-bot-2025.js   # Advanced scheduled bot
├── test-gemini-tools.js       # Tools testing suite
├── config.js                  # Configuration file
├── package.json               # Dependencies and scripts
└── docs-en/                   # Gemini CLI 2025 documentation
    ├── tools/
    │   ├── web-search.md
    │   ├── web-fetch.md
    │   └── ...
    └── cli/
        ├── commands.md
        └── ...
```

## Example Output

```
🚀 เริ่มการวิเคราะห์ XAU/USD [1/1/2025, 10:00:00 AM]
🔍 Web Search completed
🌐 Web Fetch completed
🤖 Analysis completed
📱 Line notification sent
✅ การวิเคราะห์เสร็จสิ้น

🪙 XAU/USD Trading Signal Alert
📅 1/1/2025, 10:00:00 AM
⚡ Execution: 12.34s

{
  "sentiment": "bullish",
  "confidence": "high",
  "signal": "buy",
  "keyFactors": ["Fed dovish stance", "inflation concerns", "USD weakness"],
  "fedImpact": "Recent Fed minutes suggest pause in rate hikes...",
  "technicalView": "Gold breaking above $2,000 resistance...",
  "riskLevel": "medium",
  "timeHorizon": "short-term",
  "priceTarget": "$2,050-$2,080",
  "summary": "Strong buy signal based on Fed dovish pivot"
}
```

## Troubleshooting

### Common Issues

1. **"Unknown arguments" error**
   - Make sure you have Gemini CLI 2025 installed
   - Check that web tools are enabled

2. **"Command not found: gemini"**
   - Install Gemini CLI according to official documentation
   - Add to your PATH if necessary

3. **Web tools not working**
   - Verify your Gemini CLI version supports web tools
   - Check internet connectivity
   - Ensure proper authentication

4. **Line Notify errors**
   - Verify LINE_TOKEN is set correctly
   - Check token permissions and expiry

### Debug Mode

Run with debug output:
```bash
# Add debug flag to see detailed execution
gemini -d -p "your prompt here"
```

## Key Improvements in 2025 Edition

1. **Web Tools Integration**: Native support for web search and fetch
2. **Parallel Processing**: Concurrent web search and fetch operations
3. **Enhanced Error Handling**: Robust retry logic and fallback mechanisms
4. **Structured Analysis**: JSON-formatted trading signals
5. **Advanced Scheduling**: Configurable intervals with smart retry logic
6. **Source Attribution**: Citations and source tracking
7. **Performance Optimization**: Timeout controls and resource management

## Requirements

- Node.js 18+ with ES modules support
- Gemini CLI 2025 with web tools enabled
- Line Notify token (optional but recommended)
- Internet connection for web tools

## Security Notes

- Never commit your LINE_TOKEN to version control
- Be cautious with third-party URLs in web_fetch
- Monitor API usage and rate limits
- Review tool confirmations in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with `npm run test-tools`
4. Submit a pull request

## License

MIT - See LICENSE file for details
