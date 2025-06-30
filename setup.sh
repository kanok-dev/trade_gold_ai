#!/bin/bash

echo "🚀 Gold Trading Bot Setup Script"
echo "================================"

# Check if gemini CLI is installed
if ! command -v gemini &> /dev/null; then
    echo "❌ Gemini CLI not found!"
    echo "Please install Gemini CLI first:"
    echo "https://github.com/google-gemini/gemini-cli"
    exit 1
fi

echo "✅ Gemini CLI found"

# Check authentication
if [ -z "$GEMINI_API_KEY" ] && [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo ""
    echo "🔑 Authentication Setup Required"
    echo "Choose ONE option:"
    echo ""
    echo "Option 1: Gemini API Key (Recommended)"
    echo "1. Get API key: https://aistudio.google.com/app/apikey"
    echo "2. Run: export GEMINI_API_KEY=\"your_api_key\""
    echo ""
    echo "Option 2: Google Cloud Project"
    echo "1. Set up Google Cloud project"
    echo "2. Run: export GOOGLE_CLOUD_PROJECT=\"your_project_id\""
    echo ""
    echo "Then run this setup script again."
    exit 1
fi

echo "✅ Authentication configured"

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file - please edit with your actual values"
fi

# Test the setup
echo "🧪 Testing Gemini CLI..."
npm run test-tools

echo ""
echo "🎉 Setup complete!"
echo "To run the bot: npm start"
echo "To test tools: npm run test-tools"
