module.exports = {
  apps: [
    {
      name: 'gold-trading-frontend',
      script: 'npm',
      args: 'run preview',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/Volumes/Data/Programming/trade_gold_ai/frontend',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 4173,
        VITE_API_URL: 'http://localhost:3001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4173,
        VITE_API_URL: 'https://golden-api.kanoks.me'
      },

      // Logging
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '500M',
      restart_delay: 1000,
      max_restarts: 5,
      min_uptime: '10s',

      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Additional options
      merge_logs: true,
      autorestart: true,

      // Instance variables
      instance_var: 'INSTANCE_ID'
    },

    // Development server (optional - for hot reload during development)
    {
      name: 'gold-trading-frontend-dev',
      script: 'npx',
      args: 'vite --port 3000 --host 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/Volumes/Data/Programming/trade_gold_ai/frontend',

      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        VITE_API_URL: 'http://localhost:3001'
      },

      error_file: './logs/frontend-dev-err.log',
      out_file: './logs/frontend-dev-out.log',
      log_file: './logs/frontend-dev-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      restart_delay: 2000,
      max_restarts: 3,
      min_uptime: '30s',

      // Disabled by default - enable for development
      disabled: true
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/trade_gold_ai.git',
      path: '/var/www/trade_gold_ai/frontend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
}
