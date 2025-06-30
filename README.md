# Gold Trading Bot with Gemini CLI 2025

An advanced gold (XAU/USD) trading signal bot using Google's Gemini CLI 2025 with web search and web fetch capabilities for real-time news analysis.

## Features ✨

- 🔍 **Web Search Integration**: Search for latest Federal Reserve and gold market news
- 🌐 **Web Fetch Tool**: Fetch and analyze content from specific financial news sources
- 🤖 **AI Analysis**: Advanced sentiment analysis and trading signal generation
- 📱 **Line Notify**: Instant trading alerts via Line messaging
- ⚡ **Real-time Processing**: Automated news monitoring and analysis

## Setup Instructions 🚀

### 1. Authentication Setup

Choose ONE authentication method:

#### Option A: Gemini API Key (Recommended)
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set environment variable:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

#### Option B: Google Cloud Project
1. Set up a Google Cloud project
2. Enable the Gemini API
3. Set environment variable:
   ```bash
   export GOOGLE_CLOUD_PROJECT="your_project_id"
   ```

### 2. Line Notify Setup (Optional)
1. Get token from [Line Notify](https://notify-bot.line.me/)
2. Set environment variable:
   ```bash
   export LINE_TOKEN="your_line_token_here"
   ```

### 3. Installation
```bash
# Clone and setup
git clone <your-repo>
cd trade_gold_ai
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your actual keys

# Test the setup
npm run test-tools

# Run the bot
npm start
```

## Usage 💡

### Basic Bot Execution
```bash
npm start
```

### Test Individual Tools
```bash
# Test all Gemini CLI tools
npm run test-tools

# Test with debug mode
npm run test-debug
```

### Scheduled Execution
```bash
# Run every hour (using cron or similar)
0 */1 * * * cd /path/to/trade_gold_ai && npm start
```

## How It Works 🔧

1. **News Search**: Uses Gemini's web search tool to find latest Federal Reserve and gold market news
2. **Content Fetching**: Fetches specific content from Reuters, Bloomberg, and other financial sources
3. **AI Analysis**: Processes news content to extract:
   - Market sentiment (Bullish/Bearish/Neutral)
   - Key price-affecting factors
   - Trading recommendations
   - Risk assessment
4. **Alert System**: Sends formatted trading signals via Line Notify

## Files Overview 📁

- `gemini-bot.js` - Main bot application with enhanced 2025 features
- `test-gemini-tools.js` - Test script for Gemini CLI tools
- `openAI-bot.js` - Alternative OpenAI implementation
- `.env.example` - Environment variables template

## API Limitations ⚠️

- Gemini API has rate limits
- Web search and fetch tools may have daily quotas
- Line Notify has message limits

## Troubleshooting 🛠️

### Authentication Issues
```bash
# Check if API key is set
echo $GEMINI_API_KEY

# Test basic Gemini CLI
gemini -y -p "test prompt"
```

### Tool Issues
```bash
# Run diagnostic tests
npm run test-tools

# Check available tools
gemini --help
```

### Common Errors
- **Command timeout**: Increase timeout values in code
- **Rate limits**: Add delays between API calls
- **Authentication failed**: Verify API key or Google Cloud setup

## Contributing 🤝

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License 📄

MIT License - see LICENSE file for details
