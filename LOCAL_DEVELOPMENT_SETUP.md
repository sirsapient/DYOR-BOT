# DYOR BOT Local Development Setup

## Overview
This guide will help you set up DYOR BOT for local development with permanent API key storage, eliminating the need to update keys every time you run locally.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

## Step 1: Clone and Setup Project

```bash
# Navigate to your project directory
cd "DYOR BOT"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: API Key Setup

### Required API Keys
You'll need to obtain these API keys for full functionality:

1. **Anthropic Claude API Key** (REQUIRED)
   - Visit: https://console.anthropic.com/
   - Create account and get API key
   - This is required for AI orchestration

2. **Optional API Keys** (for enhanced functionality):
   - **CoinMarketCap**: https://coinmarketcap.com/api/
   - **Etherscan**: https://etherscan.io/apis
   - **Snowtrace**: https://snowtrace.io/apis
   - **IGDB**: https://api.igdb.com/ (for gaming data)
   - **YouTube**: https://developers.google.com/youtube/v3/getting-started

### Permanent API Key Storage

#### Option A: Environment Files (Recommended)
```bash
# Backend setup
cd backend
cp env.example .env
# Edit .env with your actual API keys

# Frontend setup
cd ../frontend
cp env.example .env
# Edit .env to point to local backend
```

#### Option B: Windows Environment Variables (Permanent)
```powershell
# Open PowerShell as Administrator and run:
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your_key_here", "User")
[Environment]::SetEnvironmentVariable("COINMARKETCAP_API_KEY", "your_key_here", "User")
[Environment]::SetEnvironmentVariable("ETHERSCAN_API_KEY", "your_key_here", "User")
# ... repeat for other keys

# Restart your terminal/IDE after setting these
```

#### Option C: Windows Credential Manager (Most Secure)
```powershell
# Store API keys in Windows Credential Manager
cmdkey /add:ANTHROPIC_API_KEY /user:your_username /pass:your_api_key
cmdkey /add:COINMARKETCAP_API_KEY /user:your_username /pass:your_api_key
# ... repeat for other keys
```

## Step 3: Backend Setup

```bash
cd backend

# Create .env file with your API keys
cp env.example .env
# Edit .env with your actual keys

# Build TypeScript
npm run build

# Start development server
npm run dev
```

The backend will run on `http://localhost:4000`

## Step 4: Frontend Setup

```bash
cd frontend

# Create .env file pointing to local backend
cp env.example .env
# Edit .env to set REACT_APP_API_URL=http://localhost:4000

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## Step 5: Testing Local Setup

1. **Backend Health Check**:
   ```bash
   curl http://localhost:4000/api/health
   # Should return: {"status":"ok"}
   ```

2. **Test Research Endpoint**:
   ```bash
   curl -X POST http://localhost:4000/api/research \
     -H "Content-Type: application/json" \
     -d '{"projectName": "Axie Infinity"}'
   ```

3. **Frontend Test**:
   - Open http://localhost:3000
   - Search for "Axie Infinity"
   - Verify results appear

## Development Workflow

### Quick Start Scripts
Create these scripts in your project root for easy development:

```bash
# start-dev.sh (for Unix/Mac)
#!/bin/bash
echo "Starting DYOR BOT development environment..."
cd backend && npm run dev &
cd frontend && npm start &
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
```

```powershell
# start-dev.ps1 (for Windows)
Write-Host "Starting DYOR BOT development environment..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:3000"
```

### Environment Switching
For easy switching between local and production:

```bash
# Local development
REACT_APP_API_URL=http://localhost:4000

# Production testing
REACT_APP_API_URL=https://dyor-bot.onrender.com
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**:
   ```bash
   # Check if .env file exists
   ls -la backend/.env
   
   # Verify environment variables are loaded
   echo $ANTHROPIC_API_KEY
   ```

2. **Port Already in Use**:
   ```bash
   # Kill process on port 4000
   npx kill-port 4000
   
   # Or change port in .env
   PORT=4001
   ```

3. **CORS Issues**:
   - Backend already has CORS configured
   - If issues persist, check frontend .env has correct API URL

4. **TypeScript Build Errors**:
   ```bash
   cd backend
   npm run build
   # Fix any TypeScript errors before running dev
   ```

### Debug Mode
Enable detailed logging:

```bash
# Backend debug mode
DEBUG=* npm run dev

# Frontend debug mode
REACT_APP_DEBUG=true npm start
```

## API Key Security Best Practices

1. **Never commit .env files**:
   - .env files are already in .gitignore
   - Use env.example for documentation

2. **Use different keys for development/production**:
   - Development: Use free tier keys
   - Production: Use paid tier keys

3. **Rotate keys regularly**:
   - Set calendar reminders to rotate API keys
   - Monitor API usage for unexpected activity

4. **Use environment-specific keys**:
   - Local: .env file
   - Production: Environment variables in deployment platform

## Next Steps

Once local development is working:

1. **Test with different projects**: Try various Web3 games and tokens
2. **Monitor API usage**: Keep track of API call limits
3. **Optimize search reliability**: Focus on the core optimization goal
4. **Add new data sources**: Expand the system's capabilities

## Support

If you encounter issues:
1. Check the DEBUG_GUIDE.md for known issues
2. Verify all API keys are correctly set
3. Check network connectivity
4. Review console logs for error messages
