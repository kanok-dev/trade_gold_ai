# Enhanced Gold Trading Dashboard Frontend

## Overview
A fully responsive React-based dashboard for displaying comprehensive gold trading analysis data from the OpenAI Bot 2. The frontend supports both legacy and enhanced data formats with mobile-first design principles.

## Features

### 🎨 Enhanced UI Components
- **EnhancedPriceCard**: Comprehensive price analysis with verification data
- **TechnicalAnalysisCard**: RSI, ATR, support/resistance levels, pattern detection
- **TradingDecisionCard**: Decision breakdown with confidence levels and reasoning
- **MarketSentimentCard**: Fear & Greed Index, institutional positioning
- **NewsHighlightsCard**: Thai news with sentiment analysis and categorization
- **ForecastScenariosCard**: Short, medium, and long-term price forecasts
- **KeyEventsCard**: Economic calendar with importance levels
- **RiskFactorsCard**: Risk analysis with Thai summary

### 📱 Mobile Responsive Design
- **Adaptive Grid Layouts**: Responsive from mobile to desktop
- **Touch-Friendly Interface**: 44px minimum touch targets
- **Collapsible Content**: Expandable news and summaries
- **Optimized Typography**: Responsive text sizing
- **Safe Area Support**: iPhone notch and gesture support

### 🔄 Data Management
- **Dual Dashboard Support**: Toggle between legacy and enhanced views
- **Real-time Updates**: Auto-refresh every 60 seconds
- **Fallback Loading**: Graceful handling of missing data
- **Error Recovery**: Comprehensive error handling and retry mechanisms

## Data Schema Support

### Enhanced Data Format (OpenAI Bot 2)
```json
{
  "timestamp": "2025-07-01T15:30:00Z",
  "data_freshness_minutes": 2,
  "price_statistics": {
    "current_spot_usd": 3280.50,
    "daily_change_pct": -0.44,
    "weekly_change_pct": -1.88,
    "ytd_performance_pct": 42.1
  },
  "technical_analysis": {
    "rsi_14d": 65,
    "momentum": "Corrective down, medium-term bullish",
    "key_support_levels": [3280, 3245, 3210],
    "key_resistance_levels": [3324, 3345, 3380]
  },
  "finalDecision": {
    "action": "HOLD",
    "confidence": 63,
    "reasoning": "...",
    "decisions": [...]
  },
  "news_highlights": [...],
  "forecast_scenarios": {...},
  "summary_thai": "..."
}
```

## Responsive Breakpoints

### Mobile First Design
- **Mobile**: 320px - 640px (sm)
- **Tablet**: 641px - 1024px (md/lg)
- **Desktop**: 1025px+ (xl/2xl)

### Grid Layouts
- **Mobile**: Single column layout
- **Tablet**: 2-column layout for cards
- **Desktop**: 3-column layout with strategic card sizing

## Component Architecture

### Card System
Each component follows a consistent pattern:
```jsx
- Loading state with spinner
- Empty state handling
- Responsive layout with breakpoints
- Touch-friendly interactions
- Accessibility support
```

### Color Coding System
- **Green**: Positive/Bullish indicators
- **Red**: Negative/Bearish indicators  
- **Yellow**: Neutral/Hold indicators
- **Blue**: Information/Links
- **Purple**: Special categories
- **Orange**: Warnings/Risk factors

## Setup & Development

### Dependencies
```json
{
  "react": "^18.2.0",
  "tailwindcss": "^4.1.11",
  "recharts": "^2.8.0",
  "axios": "^1.6.0"
}
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve on port 3000
npm run serve
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3001
```

## Mobile Optimizations

### Performance
- **Code Splitting**: Lazy loading of dashboard components
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Size**: Optimized imports and tree shaking

### UX Enhancements
- **Touch Gestures**: Swipe support for news cards
- **Haptic Feedback**: Touch feedback on supported devices
- **Dark Mode**: Automatic dark mode detection
- **Reduced Motion**: Accessibility support for motion sensitivity

### Network Handling
- **Offline Support**: Cached data display when offline
- **Progressive Loading**: Skeleton screens during data fetch
- **Error Boundaries**: Graceful error handling

## API Integration

### Endpoints
- `GET /data/latest_analysis.json` - Latest OpenAI analysis
- `GET /api/analysis/latest` - Legacy analysis format
- `GET /data/{filename}` - Specific analysis files

### Data Flow
1. **Primary**: Try OpenAI Bot 2 format first
2. **Fallback**: Use legacy format if enhanced unavailable
3. **Error Handling**: Display user-friendly error messages
4. **Retry Logic**: Automatic retry with exponential backoff

## Accessibility Features

### WCAG Compliance
- **Color Contrast**: AAA compliance for text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators

### Responsive Typography
- **Scalable Text**: rem-based sizing
- **Line Height**: Optimized for readability
- **Font Loading**: System font fallbacks

## Browser Support

### Modern Browsers
- **Chrome**: 90+
- **Safari**: 14+
- **Firefox**: 88+
- **Edge**: 90+

### Mobile Browsers
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 14+

## Deployment

### Static Hosting
The app builds to static files and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Setup
1. Set `VITE_API_URL` to your backend server
2. Ensure CORS is configured for your domain
3. Set up SSL/TLS for production

## Future Enhancements

### Planned Features
- **Chart Integration**: Price charts with technical indicators
- **Real-time Websockets**: Live price updates
- **Push Notifications**: Alert system for important events
- **Offline Mode**: Service worker for offline functionality
- **PWA Support**: Install as mobile app

### Performance Monitoring
- **Analytics**: User interaction tracking
- **Performance Metrics**: Core Web Vitals monitoring
- **Error Tracking**: Crash reporting and debugging
