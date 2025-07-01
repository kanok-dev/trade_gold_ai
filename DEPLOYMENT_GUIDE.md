# 🚀 Gold Trading AI - Deployment Guide

This guide covers deploying both the API backend and React frontend for the Gold Trading AI system.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [API Deployment](#api-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Production Configuration](#production-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 5GB free space
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows 10+

### Required API Keys
- **OpenAI API Key**: For GPT-4.1 analysis
- **Anthropic API Key**: For Claude analysis
- **Gemini API Key**: For additional analysis (optional)
- **Line Notify Token**: For trading alerts (optional)

## 🌐 Environment Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd trade_gold_ai
```

### 2. Install Dependencies

#### API Dependencies
```bash
cd api
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

Create `.env` files for both API and frontend:

#### API Environment (api/.env)
```env
# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Services
LINE_TOKEN=your_line_notify_token_here

# Server Configuration
PORT=3001
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com

# CORS Settings
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend Environment (frontend/.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_TIMEOUT=30000

# Environment
VITE_NODE_ENV=production
```

## 🖥️ API Deployment

### Option 1: Traditional VPS/Server Deployment

#### 1. Prepare the Server
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy the API
```bash
# Upload your code to the server
# Transfer files via SCP, Git, or your preferred method

cd /path/to/your/api
npm install --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gold-trading-api',
    script: 'api-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. Configure Nginx (Optional)
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile (api/Dockerfile)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "api-server.js"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  gold-trading-api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./api/.env
    volumes:
      - ./api/data:/app/data
      - ./api/logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 3. Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f gold-trading-api
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-gold-api

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set ANTHROPIC_API_KEY=your_key
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix api heroku main
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy API
cd api
vercel --prod
```

## 🌟 Frontend Deployment

### Option 1: Static Site Deployment

#### 1. Build the Frontend
```bash
cd frontend
npm run build
```

#### 2. Deploy to Nginx
```bash
# Copy build files to web server
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo tee /etc/nginx/sites-available/gold-trading-frontend << EOF
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/gold-trading-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Cloud Platform Deployment

#### Vercel (Recommended)
```bash
cd frontend
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
# Build locally
npm run build

# Deploy via Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build
      run: |
        cd frontend
        npm run build
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile (frontend/Dockerfile)
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create nginx.conf (frontend/nginx.conf)
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://gold-trading-api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🔒 Production Configuration

### 1. Security Settings

#### API Security
```javascript
// api/config/security.js
export const securityConfig = {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  }
}
```

#### Environment Validation
```javascript
// api/config/env.js
import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

### 2. Performance Optimization

#### API Optimizations
```javascript
// Enable response compression
import compression from 'compression'
app.use(compression())

// Cache static files
app.use(express.static('public', {
  maxAge: '1y'
}))

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' })
  })
  next()
})
```

#### Frontend Optimizations
```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js']
        }
      }
    }
  }
}
```

### 3. Logging Configuration

#### API Logging
```javascript
// api/utils/logger.js
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## 📊 Monitoring & Maintenance

### 1. Health Checks

#### API Health Endpoint
```javascript
// api/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  })
})
```

### 2. Automated Deployment Scripts

#### Deploy Script (deploy.sh)
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Deploy API
echo "📡 Deploying API..."
cd api
npm ci --production
pm2 reload ecosystem.config.js --env production

# Deploy Frontend
echo "🌟 Deploying Frontend..."
cd ../frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/

echo "✅ Deployment completed!"
```

### 3. Backup Strategy

#### Database Backup (if applicable)
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/gold-trading-ai/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# Backup data files
cp -r /path/to/api/data $BACKUP_DIR/

# Backup logs
cp -r /path/to/api/logs $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Not Starting
```bash
# Check logs
pm2 logs gold-trading-api

# Check environment variables
pm2 env 0

# Restart process
pm2 restart gold-trading-api
```

#### 2. Frontend Build Errors
```bash
# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env
```

#### 3. CORS Issues
```javascript
// Ensure proper CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

#### 4. Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Monitor memory usage
pm2 monit
```

### Performance Monitoring

#### 1. API Monitoring
```bash
# Real-time monitoring
pm2 monit

# Performance metrics
pm2 status
pm2 info gold-trading-api
```

#### 2. Log Analysis
```bash
# View recent errors
tail -f logs/error.log

# Search for specific errors
grep -i "error" logs/combined.log | tail -20
```

## 📚 Additional Resources

### Scripts Reference

#### API Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run merge-analysis` - Run analysis merger bot
- `npm run gemini-bot` - Run Gemini analysis bot

#### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Examples

#### Development
```env
NODE_ENV=development
API_BASE_URL=http://localhost:3001
```

#### Staging
```env
NODE_ENV=staging
API_BASE_URL=https://staging-api.yourdomain.com
```

#### Production
```env
NODE_ENV=production
API_BASE_URL=https://api.yourdomain.com
```

---

## 🎯 Quick Deployment Checklist

- [ ] Clone repository
- [ ] Install dependencies (API & Frontend)
- [ ] Configure environment variables
- [ ] Test locally
- [ ] Build frontend
- [ ] Deploy API (choose method)
- [ ] Deploy frontend (choose method)
- [ ] Configure domain/DNS
- [ ] Set up SSL certificates
- [ ] Configure monitoring
- [ ] Test production deployment
- [ ] Set up backup strategy

## 💡 Tips for Success

1. **Always test locally first** before deploying to production
2. **Use environment variables** for all configuration
3. **Monitor logs regularly** to catch issues early
4. **Keep dependencies updated** for security
5. **Use HTTPS** in production
6. **Set up automated backups**
7. **Document any custom configurations**

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
