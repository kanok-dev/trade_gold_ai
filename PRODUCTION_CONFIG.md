# 🔧 Production Configuration Guide

This file contains production-specific configurations for the Gold Trading AI system.

## 📊 API Configuration

### Environment Variables for Production
```env
# Core Settings
NODE_ENV=production
PORT=3001
API_BASE_URL=https://your-api-domain.com

# Security
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Services
OPENAI_API_KEY=your_production_openai_key
ANTHROPIC_API_KEY=your_production_anthropic_key
GEMINI_API_KEY=your_production_gemini_key

# Logging
LOG_LEVEL=info
LOG_FILE_MAX_SIZE=10485760
LOG_FILE_MAX_FILES=10

# Performance
REQUEST_TIMEOUT=30000
MAX_REQUEST_SIZE=10mb
```

### PM2 Production Configuration
Create `api/ecosystem.production.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gold-trading-api-prod',
    script: 'api-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
}
```

### Nginx Production Configuration
```nginx
# /etc/nginx/sites-available/gold-trading-api
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API proxy
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
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🌟 Frontend Configuration

### Environment Variables for Production
```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000

# Environment
VITE_NODE_ENV=production

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Features
VITE_ENABLE_DEBUG=false
VITE_REFRESH_INTERVAL=60000
```

### Vite Production Build Configuration
Update `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
```

### Nginx Production Configuration for Frontend
```nginx
# /etc/nginx/sites-available/gold-trading-frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/gold-trading-frontend/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main application
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy (if frontend and API on same domain)
    location /api {
        proxy_pass https://api.yourdomain.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🐳 Docker Production Setup

### Multi-stage Dockerfile for API
```dockerfile
# api/Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

WORKDIR /app

# Copy dependencies
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

# Create directories
RUN mkdir -p logs data && chown -R nodeuser:nodejs logs data

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "api-server.js"]
```

### Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  gold-trading-api:
    build:
      context: ./api
      dockerfile: Dockerfile.production
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./api/.env.production
    volumes:
      - ./api/data:/app/data:rw
      - ./api/logs:/app/logs:rw
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  gold-trading-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.production
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    depends_on:
      - gold-trading-api
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
    restart: unless-stopped

volumes:
  grafana-storage:
```

## 📊 Monitoring & Alerting

### Performance Monitoring Script
```bash
#!/bin/bash
# monitoring/check-health.sh

API_URL="https://api.yourdomain.com/health"
FRONTEND_URL="https://yourdomain.com"
ALERT_EMAIL="admin@yourdomain.com"

# Check API health
if ! curl -f "$API_URL" > /dev/null 2>&1; then
    echo "API health check failed" | mail -s "Gold Trading API Down" "$ALERT_EMAIL"
fi

# Check frontend
if ! curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "Frontend health check failed" | mail -s "Gold Trading Frontend Down" "$ALERT_EMAIL"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "Disk usage is at ${DISK_USAGE}%" | mail -s "High Disk Usage Alert" "$ALERT_EMAIL"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem:/ {printf "%.2f", $3/$2 * 100}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "Memory usage is at ${MEMORY_USAGE}%" | mail -s "High Memory Usage Alert" "$ALERT_EMAIL"
fi
```

### Log Rotation Configuration
```bash
# /etc/logrotate.d/gold-trading-ai
/path/to/gold-trading-ai/api/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    copytruncate
    notifempty
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔒 Security Checklist

### API Security
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Security headers added
- [ ] API keys rotated regularly
- [ ] Logs monitored for suspicious activity

### Frontend Security
- [ ] Content Security Policy configured
- [ ] XSS protection enabled
- [ ] HTTPS enforced
- [ ] Static files properly cached
- [ ] Debug mode disabled in production
- [ ] Source maps disabled (or secured)

### Infrastructure Security
- [ ] Firewall configured
- [ ] SSH key-based authentication
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] SSL certificates configured
- [ ] Access logs monitored

## 📈 Performance Optimization

### API Optimizations
```javascript
// api/config/performance.js
export const performanceConfig = {
  // Enable compression
  compression: {
    threshold: 1024,
    level: 6
  },
  
  // Cache configuration
  cache: {
    maxAge: 300000, // 5 minutes
    type: 'memory'
  },
  
  // Request limits
  limits: {
    json: '10mb',
    urlencoded: { limit: '10mb', extended: true }
  },
  
  // Timeouts
  timeouts: {
    server: 30000,
    keepAlive: 5000
  }
}
```

### Frontend Optimizations
```javascript
// frontend/src/config/performance.js
export const performanceConfig = {
  // API request timeout
  apiTimeout: 30000,
  
  // Refresh intervals
  dataRefreshInterval: 60000,
  
  // Lazy loading
  enableLazyLoading: true,
  
  // Chart performance
  chartAnimations: false,
  chartResponsive: true
}
```

## 🔄 Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup/backup-daily.sh

BACKUP_DIR="/backup/gold-trading-ai"
DATE=$(date +%Y-%m-%d)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup API data
cp -r /path/to/api/data "$BACKUP_DIR/$DATE/"
cp -r /path/to/api/logs "$BACKUP_DIR/$DATE/"

# Backup configuration
cp /path/to/api/.env "$BACKUP_DIR/$DATE/"
cp /path/to/frontend/.env "$BACKUP_DIR/$DATE/"

# Compress backup
tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Clean old backups
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/backup-$DATE.tar.gz"
```

---

## 🎯 Quick Production Checklist

- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Performance optimizations applied
- [ ] Health checks working
- [ ] Alerts configured

**Remember**: Always test in a staging environment before deploying to production!
