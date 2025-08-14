# Startup Procedures - DYOR BOT

## 🚀 **QUICK START GUIDE**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control
- API keys (see [Configuration Reference](reference/configuration-reference.md))

---

## 📋 **STARTUP PROCEDURES**

### **1. Initial Setup (First Time Only)**

#### **Step 1: Clone Repository**
```bash
git clone <repository-url>
cd "DYOR BOT"
```

#### **Step 2: Quick Setup (Windows)**
```bash
# Run the quick setup script
.\quick-setup.ps1
```

#### **Step 3: Manual Setup (Alternative)**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

#### **Step 4: Environment Configuration**
```bash
# Copy environment templates
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edit backend/.env with your API keys
# Required: ANTHROPIC_API_KEY
# Optional: COINMARKETCAP_API_KEY, ETHERSCAN_API_KEY, etc.
```

### **2. Daily Startup**

#### **Option A: Quick Start (Windows)**
```bash
# Start both frontend and backend
.\start-dev.ps1
```

#### **Option B: Manual Start**
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm start
```

#### **Option C: Development Mode**
```bash
# Terminal 1: Backend with auto-reload
cd backend
npm run dev

# Terminal 2: Frontend with auto-reload
cd frontend
npm start
```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Required API Keys**

#### **Backend Environment (.env)**
```env
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional but recommended
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Server configuration
PORT=4000
NODE_ENV=development
```

#### **Frontend Environment (.env)**
```env
# API URL (use localhost for development)
REACT_APP_API_URL=http://localhost:4000

# For production, use the deployed backend URL
# REACT_APP_API_URL=https://dyor-bot.onrender.com
```

### **API Key Setup**

#### **Anthropic Claude API Key**
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to `backend/.env`

#### **Optional API Keys**
- **CoinMarketCap**: https://coinmarketcap.com/api/ (for enhanced financial data)
- **Etherscan**: https://etherscan.io/apis (for Ethereum blockchain data)
- **BSCScan**: https://bscscan.com/apis (for BSC blockchain data)

---

## 🌐 **ACCESS POINTS**

### **Local Development**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### **Production**
- **Frontend**: https://dyor-bot.vercel.app
- **Backend API**: https://dyor-bot.onrender.com
- **Health Check**: https://dyor-bot.onrender.com/api/health

---

## 🧪 **TESTING STARTUP**

### **Data Point Testing**
```bash
# Run comprehensive data point testing
npm run test-data-points

# Test single project
npm run test-single "Axie Infinity"

# Run all tests
npm test
```

### **Manual Testing**
```bash
# Health check
curl http://localhost:4000/api/health

# Test research endpoint
curl -X POST http://localhost:4000/api/research \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Axie Infinity"}'
```

---

## 🔍 **TROUBLESHOOTING STARTUP ISSUES**

### **Common Issues**

#### **Port Already in Use**
```bash
# Check what's using the port
netstat -ano | findstr :4000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F
```

#### **API Key Issues**
```bash
# Check if API key is set
echo $ANTHROPIC_API_KEY

# Test Claude API directly
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}'
```

#### **Dependency Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Environment File Issues**
```bash
# Check if .env files exist
ls -la backend/.env
ls -la frontend/.env

# Verify environment variables are loaded
node -e "console.log(process.env.ANTHROPIC_API_KEY)"
```

---

## 📊 **STARTUP VERIFICATION**

### **Health Check Checklist**
- [ ] Backend API responding at http://localhost:4000/api/health
- [ ] Frontend accessible at http://localhost:3000
- [ ] API key configured and working
- [ ] No error messages in console
- [ ] Can search for "Axie Infinity" successfully

### **Performance Verification**
- [ ] Simple queries complete in 5-10 seconds
- [ ] Complex queries complete in 25-45 seconds
- [ ] AI analysis generates comprehensive reports
- [ ] Data collection working across multiple sources

---

## 🚨 **EMERGENCY STARTUP**

### **If Normal Startup Fails**

#### **Step 1: Check System Status**
```bash
# Check if processes are running
tasklist | findstr node
tasklist | findstr npm
```

#### **Step 2: Force Restart**
```bash
# Kill all Node.js processes
taskkill /F /IM node.exe

# Clear ports
netstat -ano | findstr :4000
netstat -ano | findstr :3000
```

#### **Step 3: Minimal Startup**
```bash
# Start only backend first
cd backend
npm start

# Test backend only
curl http://localhost:4000/api/health

# If backend works, start frontend
cd ../frontend
npm start
```

#### **Step 4: Production Fallback**
If local development fails, use production URLs:
- **Frontend**: https://dyor-bot.vercel.app
- **Backend**: https://dyor-bot.onrender.com

---

## 🔄 **AUTOMATED STARTUP**

### **Windows PowerShell Scripts**

#### **Quick Setup Script (quick-setup.ps1)**
```powershell
# Install dependencies for both backend and frontend
Write-Host "Setting up DYOR BOT development environment..."

# Backend setup
Write-Host "Setting up backend..."
cd backend
npm install
cd ..

# Frontend setup
Write-Host "Setting up frontend..."
cd frontend
npm install
cd ..

Write-Host "Setup complete! Run .\start-dev.ps1 to start development servers."
```

#### **Start Development Script (start-dev.ps1)**
```powershell
# Start both frontend and backend servers
Write-Host "Starting DYOR BOT development servers..."

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Development servers started!"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:4000"
```

---

## 📝 **STARTUP LOGS**

### **Backend Startup Log**
```
DYOR BOT Backend starting...
✅ Environment variables loaded
✅ API keys configured
✅ Database connections established
✅ Search service initialized
✅ AI orchestrator ready
🚀 Server running on port 4000
```

### **Frontend Startup Log**
```
DYOR BOT Frontend starting...
✅ React development server starting
✅ API URL configured: http://localhost:4000
✅ Components loaded
🚀 Server running on port 3000
```

---

## 🎯 **STARTUP SUCCESS INDICATORS**

### **✅ Successful Startup When:**
- Both servers start without errors
- Health check endpoint responds
- Frontend loads without console errors
- Can perform a test search successfully
- AI analysis generates comprehensive reports

### **❌ Startup Issues When:**
- Port conflicts prevent server startup
- API keys are missing or invalid
- Dependencies fail to install
- Environment variables not loaded
- Network connectivity issues

---

**📝 Note:** These startup procedures ensure DYOR BOT is properly configured and running for development or testing. Always verify the system is working before proceeding with development or testing tasks.
