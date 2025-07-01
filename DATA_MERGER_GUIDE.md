# 🔄 Data Merger Usage Guide

## Overview
The data merger combines different analysis formats (OpenAI, Claude, etc.) into a unified structure that the frontend can consume easily.

## 🚀 Quick Start

### Basic Merge (Most Common)
```bash
# Merge latest analysis files
cd /Volumes/Data/Programming/trade_gold_ai/api
node utils/merge-analysis-data.js
```

### Test Merge with Details
```bash
# See detailed merge process and results
node utils/test-data-merger.js
```

## 📋 Available Commands

### 1. Default Merge
```bash
node utils/merge-analysis-data.js
```
- **Input**: `data/latest_analysis.json` + `data/latest_claude_analysis.json`
- **Output**: `data/unified_analysis.json`

### 2. Custom File Paths
```bash
# Merge specific files
node utils/merge-analysis-data.js \
  --openai ./custom-openai.json \
  --claude ./custom-claude.json \
  --output ./custom-merged.json
```

### 3. Verbose Mode
```bash
# See detailed processing information
node utils/merge-analysis-data.js --verbose
```

### 4. Watch Mode (Auto-Merge)
```bash
# Automatically merge when source files change
node utils/merge-analysis-data.js --watch --verbose
```

### 5. Single Source Merge
```bash
# Merge only OpenAI data
node utils/merge-analysis-data.js --claude ""

# Merge only Claude data  
node utils/merge-analysis-data.js --openai ""
```

## 🎯 Use Cases

### Daily Trading Workflow
```bash
# 1. Run analysis bots
npm run analysis          # Generate latest analysis
npm run gemini-bot       # Generate Claude analysis

# 2. Merge the results
node utils/merge-analysis-data.js

# 3. Check merged results
node utils/test-data-merger.js
```

### Development/Testing
```bash
# Test with specific files
node utils/merge-analysis-data.js \
  --openai ./data/openai-analysis-2025-07-01T12-30-17.json \
  --claude ./data/latest_claude_analysis.json \
  --output ./test-merge.json \
  --verbose
```

### Production Monitoring
```bash
# Continuous monitoring mode
node utils/merge-analysis-data.js --watch --verbose
```

## 📊 Output Structure

The unified analysis includes:

### Core Data
- **timestamp**: When the merge was performed
- **source**: Primary data source (openai_primary/claude_primary)
- **data_freshness_minutes**: How old the data is

### Price Information
- **spot_price**: Current gold price with source verification
- **price_change**: Daily, weekly, monthly percentage changes

### Technical Analysis
- **technical_indicators**: RSI, ATR, support/resistance levels
- **signals**: Short, medium, long-term trading signals
- **trend**: Overall market direction and momentum

### Market Intelligence
- **market_sentiment**: Overall sentiment and confidence scores
- **news_highlights**: Recent news with sentiment analysis
- **key_events**: Upcoming market-moving events
- **risk_factors**: Current market risks

### Trading Recommendation
- **final_decision**: Action (BUY/SELL/HOLD) with confidence and reasoning

## 🔧 File Locations

### Input Files
```
api/data/latest_analysis.json           # Latest OpenAI analysis
api/data/latest_claude_analysis.json    # Latest Claude analysis
api/data/latest_openai_analysis.json    # OpenAI bot specific
api/data/latest_openai_validated_analysis.json  # With validation
```

### Output Files
```
api/data/unified_analysis.json          # Main merged output
api/data/test_unified_analysis.json     # Test output
```

## ⚡ Integration Examples

### In Package.json Scripts
You can add these to your package.json:

```json
{
  "scripts": {
    "merge": "node utils/merge-analysis-data.js",
    "merge-test": "node utils/test-data-merger.js",
    "merge-watch": "node utils/merge-analysis-data.js --watch --verbose",
    "full-analysis": "npm run analysis && npm run gemini-bot && npm run merge"
  }
}
```

### Automated Workflow
```bash
# Complete analysis pipeline
npm run analysis        # Generate OpenAI analysis
npm run gemini-bot     # Generate Claude analysis  
npm run merge          # Merge both analyses
npm start              # Start API server with merged data
```

## 🎛️ Command Line Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--openai` | `-o` | OpenAI analysis file path | `-o ./openai.json` |
| `--claude` | `-c` | Claude analysis file path | `-c ./claude.json` |
| `--output` | `-u` | Output file path | `-u ./merged.json` |
| `--verbose` | `-v` | Show detailed processing | `-v` |
| `--watch` | `-w` | Watch for file changes | `-w` |
| `--help` | `-h` | Show help message | `-h` |

## 🔍 Troubleshooting

### File Not Found
```bash
# Check if source files exist
ls -la api/data/latest_*analysis.json

# Generate missing files
npm run analysis      # For OpenAI
npm run gemini-bot   # For Claude
```

### Permission Issues
```bash
# Make sure script is executable
chmod +x utils/merge-analysis-data.js
```

### Validation Issues
```bash
# Test merge with verbose output
node utils/merge-analysis-data.js --verbose
```

## 🏃‍♂️ Quick Commands Reference

```bash
# Basic merge
npm run merge

# Test merge  
npm run merge-test

# Watch mode
npm run merge-watch

# Full pipeline
npm run full-analysis
```

## 📈 Best Practices

1. **Always test first**: Use `test-data-merger.js` to verify merge results
2. **Use watch mode**: For development, use `--watch` to auto-merge changes
3. **Check data freshness**: Monitor `data_freshness_minutes` in output
4. **Validate sources**: Ensure both OpenAI and Claude data are recent
5. **Monitor file sizes**: Large unified files may indicate data issues

## 🎯 Integration with Frontend

The unified analysis file is designed for easy frontend consumption:

```javascript
// Frontend usage example
fetch('/api/unified-analysis')
  .then(response => response.json())
  .then(data => {
    const price = data.unified_analysis.spot_price.value
    const signal = data.unified_analysis.final_decision.action
    const confidence = data.unified_analysis.final_decision.confidence
    
    // Update UI with merged data
    updatePriceDisplay(price)
    updateTradingSignal(signal, confidence)
  })
```
