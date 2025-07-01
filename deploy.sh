#!/bin/bash

# 🚀 Gold Trading AI - Quick Deploy Script
# This script automates the deployment process for both API and Frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # API Environment
    if [ ! -f "api/.env" ]; then
        print_warning "API .env file not found. Creating template..."
        cat > api/.env << EOF
# AI Service API Keys (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Services
LINE_TOKEN=your_line_notify_token_here

# Server Configuration
PORT=3001
NODE_ENV=production
EOF
        print_warning "Please edit api/.env with your actual API keys before continuing."
        read -p "Press Enter when you've updated the API keys..."
    fi
    
    # Frontend Environment
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cat > frontend/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# Environment
VITE_NODE_ENV=production
EOF
    fi
    
    print_success "Environment files configured"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install API dependencies
    print_status "Installing API dependencies..."
    cd api
    npm install
    cd ..
    
    # Install Frontend dependencies
    print_status "Installing Frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build Frontend
    print_status "Building Frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Check if PM2 is available
    if command_exists pm2; then
        print_status "Starting API with PM2..."
        cd api
        
        # Create PM2 ecosystem file if it doesn't exist
        if [ ! -f "ecosystem.config.js" ]; then
            cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gold-trading-api',
    script: 'api-server.js',
    instances: 1,
    exec_mode: 'fork',
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
    time: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
        fi
        
        # Create logs directory
        mkdir -p logs
        
        # Start with PM2
        pm2 start ecosystem.config.js --env production
        pm2 save
        
        cd ..
        print_success "API started with PM2"
    else
        print_warning "PM2 not found. Starting API in background..."
        cd api
        mkdir -p logs
        nohup node api-server.js > logs/combined.log 2>&1 &
        API_PID=$!
        echo $API_PID > api.pid
        cd ..
        print_success "API started with PID: $API_PID"
    fi
}

# Setup nginx (optional)
setup_nginx() {
    if command_exists nginx; then
        read -p "Do you want to configure Nginx for the frontend? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Configuring Nginx..."
            
            # Backup existing config if exists
            if [ -f "/etc/nginx/sites-available/gold-trading-frontend" ]; then
                sudo cp /etc/nginx/sites-available/gold-trading-frontend /etc/nginx/sites-available/gold-trading-frontend.backup
            fi
            
            # Create Nginx config
            sudo tee /etc/nginx/sites-available/gold-trading-frontend > /dev/null << EOF
server {
    listen 80;
    server_name localhost;
    root $(pwd)/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF
            
            # Enable site
            sudo ln -sf /etc/nginx/sites-available/gold-trading-frontend /etc/nginx/sites-enabled/
            
            # Test and reload Nginx
            sudo nginx -t && sudo systemctl reload nginx
            
            print_success "Nginx configured successfully"
        fi
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait a moment for services to start
    sleep 5
    
    # Check API health
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        print_success "API is running and healthy"
    else
        print_error "API health check failed"
        return 1
    fi
    
    # Check if frontend files exist
    if [ -f "frontend/dist/index.html" ]; then
        print_success "Frontend build files found"
    else
        print_error "Frontend build files not found"
        return 1
    fi
    
    print_success "Deployment verification completed"
}

# Show deployment info
show_deployment_info() {
    echo
    echo "=================================================="
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=================================================="
    echo
    echo "📡 API Server:"
    echo "   URL: http://localhost:3001"
    echo "   Health Check: http://localhost:3001/health"
    echo
    echo "🌟 Frontend:"
    if command_exists nginx && [ -f "/etc/nginx/sites-enabled/gold-trading-frontend" ]; then
        echo "   URL: http://localhost (via Nginx)"
    else
        echo "   Files: ./frontend/dist/"
        echo "   Serve with: cd frontend && npx serve dist"
    fi
    echo
    echo "📊 Available API Scripts:"
    echo "   npm run merge-analysis  - Run analysis merger"
    echo "   npm run gemini-bot     - Run Gemini analysis"
    echo "   npm run openai-bot     - Run OpenAI analysis"
    echo
    echo "🔧 Management Commands:"
    if command_exists pm2; then
        echo "   pm2 status             - Check API status"
        echo "   pm2 logs gold-trading-api - View API logs"
        echo "   pm2 restart gold-trading-api - Restart API"
    else
        echo "   ps aux | grep node     - Check running processes"
        echo "   tail -f api/logs/combined.log - View API logs"
    fi
    echo
    echo "📚 Documentation:"
    echo "   See DEPLOYMENT_GUIDE.md for detailed instructions"
    echo
}

# Main deployment function
main() {
    echo "🚀 Gold Trading AI - Quick Deployment Script"
    echo "=============================================="
    echo
    
    # Get current directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"
    
    # Run deployment steps
    check_prerequisites
    setup_environment
    install_dependencies
    build_applications
    start_services
    setup_nginx
    verify_deployment
    show_deployment_info
    
    print_success "Deployment completed successfully! 🎉"
}

# Handle interruption
trap 'print_error "Deployment interrupted"; exit 1' INT

# Run main function
main "$@"
