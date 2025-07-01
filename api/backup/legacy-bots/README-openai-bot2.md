# OpenAI Bot 2 - Enhanced Gold Trading Analysis

## Overview
This is an enhanced version of the OpenAI-powered gold trading analysis bot that saves structured JSON data to the `/data` directory. The bot processes comprehensive market analysis including technical indicators, sentiment analysis, and trading recommendations.

## Features

### 🔥 New Features
- **JSON Data Persistence**: Saves analysis data in structured JSON format
- **Multiple File Outputs**: Creates daily, unique timestamped, and latest analysis files
- **Data Validation**: Handles and validates JSON responses from OpenAI
- **Error Handling**: Comprehensive error logging and debugging
- **Analysis Comparison**: Compares current analysis with previous results
- **Rich Console Output**: Detailed logging with emojis and formatting

### 📊 Data Format
The bot expects and handles JSON responses in this format:
```json
{
  "timestamp": "2025-07-01T15:30:00Z",
  "data_freshness_minutes": 2,
  "spot_price_verification": { ... },
  "price_statistics": { ... },
  "technical_analysis": { ... },
  "market_sentiment": { ... },
  "news_highlights": [ ... ],
  "forecast_scenarios": { ... },
  "finalDecision": { ... },
  "summary_thai": "..."
}
```

## Usage

### Running the Bot
```bash
# Run the actual bot (requires OpenAI API key)
npm run openai-bot2

# Run the demo with mock data
npm run demo-openai-bot2

# Run tests
npm run test-openai-bot2
```

### Environment Setup
Ensure you have the following environment variable:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## File Structure

### Generated Files
- `data/analysis_YYYY-MM-DD.json` - Daily analysis (overwrites)
- `data/analysis_YYYY-MM-DDTHH-MM-SS.json` - Unique timestamped files
- `data/latest_analysis.json` - Always contains the most recent analysis
- `data/error_*.json` - Error logs for debugging

### Enhanced Metadata
Each saved file includes:
```json
{
  // ... original analysis data ...
  "saved_at": "2025-07-01T05:26:13.456Z",
  "bot_version": "openAI-bot2",
  "data_source": "OpenAI GPT-4.1",
  "file_format_version": "2.0"
}
```

## Key Improvements

1. **Robust JSON Handling**: Properly parses and validates JSON responses
2. **Multiple File Strategy**: Creates both daily and unique timestamped files
3. **Error Recovery**: Saves error responses for debugging
4. **Analysis Comparison**: Shows price changes from previous analysis
5. **Rich Logging**: Comprehensive console output with analysis summary
6. **Data Integrity**: Validates saved data structure

## Error Handling

The bot handles several error scenarios:
- **JSON Parse Errors**: Saves raw response for debugging
- **API Errors**: Logs full error details with stack trace
- **File System Errors**: Graceful handling of file write issues

## Analysis Summary

The bot provides real-time analysis summaries including:
- 🎯 Trading decision and confidence level
- 💰 Current gold price and daily change
- 📈 Price movement compared to previous analysis
- 📝 Summary in Thai language

## Testing

Run the test suite to verify functionality:
```bash
npm run test-openai-bot2
```

The demo mode allows you to see the bot in action without using API credits:
```bash
npm run demo-openai-bot2
```

## Integration

This bot integrates with the broader trade_gold_ai system and can be used alongside:
- Other trading bots in the `/backup/legacy-bots/` directory
- The main API server for web access
- The frontend dashboard for visualization

## Dependencies

- `openai` - OpenAI API client
- `dotenv` - Environment variable management
- `fs` - File system operations
- `path` - File path utilities

All dependencies are already included in the main `package.json`.
