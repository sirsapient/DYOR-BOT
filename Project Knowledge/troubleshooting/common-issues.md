# Common Issues & Solutions - DYOR BOT

## 🚨 **CRITICAL ISSUES**

### **Issue 1: No Data Found**
**Symptoms**: Empty research results, low confidence scores, "Could not find" messages

**Possible Causes**:
- Project name too generic or misspelled
- Official sources not discovered
- API rate limits hit
- Network connectivity issues
- External APIs down

**Quick Fixes**:
1. **Check Project Name**: Verify spelling and try variations
2. **Test with Known Project**: Try "Axie Infinity" as reference
3. **Check API Status**: Verify external APIs are operational
4. **Check Rate Limits**: Wait and retry if rate limited
5. **Check Network**: Ensure internet connectivity

**Debugging Steps**:
```bash
# Test with known working project
curl -X POST http://localhost:4000/api/research \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Axie Infinity"}'

# Check health endpoint
curl http://localhost:4000/api/health
```

### **Issue 2: Backend Not Responding**
**Symptoms**: Frontend shows loading indefinitely, API calls timeout

**Possible Causes**:
- Backend server crashed
- Port conflicts
- Environment variables missing
- API keys invalid

**Quick Fixes**:
1. **Restart Backend**: `cd backend && npm start`
2. **Check Port**: Ensure port 4000 is available
3. **Verify Environment**: Check `.env` file exists and has API keys
4. **Check Logs**: Look for error messages in console

**Debugging Steps**:
```bash
# Check if backend is running
netstat -ano | findstr :4000

# Check environment variables
node -e "console.log(process.env.ANTHROPIC_API_KEY)"

# Restart backend
cd backend
npm start
```

### **Issue 3: AI Analysis Failing**
**Symptoms**: No AI analysis generated, generic responses, API errors

**Possible Causes**:
- Anthropic API key invalid or expired
- API rate limits exceeded
- Insufficient data for analysis
- Network connectivity issues

**Quick Fixes**:
1. **Verify API Key**: Check Anthropic API key in `.env`
2. **Check API Limits**: Verify usage limits not exceeded
3. **Test API Directly**: Test Claude API independently
4. **Check Data Quality**: Ensure sufficient data collected

**Debugging Steps**:
```bash
# Test Claude API directly
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## ⚠️ **PERFORMANCE ISSUES**

### **Issue 4: Slow Response Times**
**Symptoms**: Searches taking >60 seconds, timeouts

**Possible Causes**:
- Complex queries using orchestrated approach
- External APIs slow to respond
- Network latency
- Insufficient caching

**Quick Fixes**:
1. **Use Simple Queries**: Try shorter, more specific project names
2. **Check Network**: Ensure stable internet connection
3. **Clear Cache**: Restart servers to clear any cached issues
4. **Check External APIs**: Some APIs may be slow

**Expected Performance**:
- **Simple Queries**: 5-10 seconds
- **Complex Queries**: 25-45 seconds
- **Cached Queries**: 2-5 seconds

### **Issue 5: Inconsistent Results**
**Symptoms**: Same project returning different results, missing data points

**Possible Causes**:
- External APIs returning different data
- Rate limiting affecting some requests
- Web scraping blocked intermittently
- Caching issues

**Quick Fixes**:
1. **Clear Cache**: Restart servers
2. **Retry Search**: Try the same search again
3. **Check API Status**: Verify external APIs are stable
4. **Use Known Project**: Test with "Axie Infinity" for consistency

---

## 🔧 **DEVELOPMENT ISSUES**

### **Issue 6: Frontend Not Loading**
**Symptoms**: React app not starting, build errors, blank page

**Possible Causes**:
- Dependencies not installed
- Port conflicts
- Environment variables missing
- Build errors

**Quick Fixes**:
1. **Reinstall Dependencies**: `cd frontend && npm install`
2. **Check Port**: Ensure port 3000 is available
3. **Check Environment**: Verify `REACT_APP_API_URL` in `.env`
4. **Clear Cache**: `npm cache clean --force`

**Debugging Steps**:
```bash
# Check frontend dependencies
cd frontend
npm install

# Start frontend
npm start

# Check for build errors
npm run build
```

### **Issue 7: Environment Variables Not Loading**
**Symptoms**: API calls failing, "undefined" values

**Possible Causes**:
- `.env` file missing or corrupted
- Variables not properly named
- Server not restarted after changes

**Quick Fixes**:
1. **Check .env File**: Ensure file exists and has correct format
2. **Verify Variable Names**: Check spelling and format
3. **Restart Server**: Restart backend after changes
4. **Check File Location**: Ensure `.env` is in correct directory

**Environment File Format**:
```env
# Backend .env
ANTHROPIC_API_KEY=your_key_here
PORT=4000
NODE_ENV=development

# Frontend .env
REACT_APP_API_URL=http://localhost:4000
```

### **Issue 8: TypeScript Errors**
**Symptoms**: Compilation errors, type mismatches

**Possible Causes**:
- Type definitions missing
- Version mismatches
- Incorrect type usage

**Quick Fixes**:
1. **Install Types**: `npm install @types/node`
2. **Check Versions**: Ensure TypeScript and Node.js versions compatible
3. **Fix Types**: Add proper type annotations
4. **Clear Cache**: Restart TypeScript server

---

## 🌐 **DEPLOYMENT ISSUES**

### **Issue 9: Production vs Development Differences**
**Symptoms**: Different behavior between local and production

**Possible Causes**:
- Environment variables different
- API endpoints pointing to wrong URLs
- Caching differences
- Network restrictions

**Quick Fixes**:
1. **Check Environment**: Verify production environment variables
2. **Update API URLs**: Ensure frontend points to production backend
3. **Clear Caches**: Clear any cached data
4. **Check Network**: Ensure production has internet access

### **Issue 10: Render/Vercel Deployment Issues**
**Symptoms**: Deployment fails, build errors

**Possible Causes**:
- Build configuration issues
- Environment variables not set
- Dependencies missing
- Port configuration issues

**Quick Fixes**:
1. **Check Build Logs**: Review deployment logs for errors
2. **Set Environment Variables**: Configure in deployment platform
3. **Update Dependencies**: Ensure all dependencies in package.json
4. **Check Port Configuration**: Ensure proper port setup

---

## 🔍 **DATA COLLECTION ISSUES**

### **Issue 11: 403 Forbidden Errors**
**Symptoms**: Web scraping failing, "403 Forbidden" messages

**Possible Causes**:
- Anti-bot protection
- Rate limiting
- User-Agent blocking
- IP restrictions

**Quick Fixes**:
1. **Wait and Retry**: Some sites have rate limits
2. **Check User-Agent**: System uses multiple User-Agent headers
3. **Use Alternative Sources**: System has fallback data sources
4. **Check Logs**: Review specific error messages

### **Issue 12: Missing Financial Data**
**Symptoms**: No market cap, token prices, or financial metrics

**Possible Causes**:
- CoinGecko API issues
- Token not found in database
- Network-specific data missing
- API rate limits

**Quick Fixes**:
1. **Check Token Name**: Try different variations of project name
2. **Verify Network**: Ensure correct blockchain network
3. **Check API Status**: Verify CoinGecko API operational
4. **Use Alternative APIs**: System has multiple financial data sources

### **Issue 13: Missing Social Media Data**
**Symptoms**: No Twitter, Discord, or Reddit information

**Possible Causes**:
- Social media APIs down
- Rate limiting
- Incorrect handle discovery
- Privacy settings

**Quick Fixes**:
1. **Check API Status**: Verify social media APIs operational
2. **Try Manual Search**: Check if handles exist manually
3. **Wait and Retry**: Some APIs have rate limits
4. **Check Discovery**: System tries multiple handle variations

---

## 📊 **TESTING ISSUES**

### **Issue 14: Data Point Testing Failing**
**Symptoms**: Test scripts not running, coverage not improving

**Possible Causes**:
- Test environment not configured
- API keys missing for testing
- Test data outdated
- Script errors

**Quick Fixes**:
1. **Check Environment**: Ensure test environment configured
2. **Verify API Keys**: Check all required API keys set
3. **Update Test Data**: Refresh test project data
4. **Check Scripts**: Verify test scripts are current

**Testing Commands**:
```bash
# Run data point testing
npm run test-data-points

# Test single project
npm run test-single "Axie Infinity"

# Check test results
cat test-results.json
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **Critical System Failure**
1. **Stop All Processes**: Kill all Node.js processes
2. **Check Logs**: Review error logs for root cause
3. **Restart Fresh**: Start with clean environment
4. **Use Production**: Fall back to production URLs if needed

### **Data Loss or Corruption**
1. **Backup Current State**: Save any important data
2. **Reset Environment**: Clear caches and restart
3. **Verify Configuration**: Check all settings
4. **Test Core Functionality**: Verify basic operations work

---

## 📞 **GETTING HELP**

### **When to Escalate**
- System completely non-functional
- Data corruption or loss
- Security concerns
- Performance degradation >50%

### **Information to Provide**
- Error messages and logs
- Steps to reproduce issue
- Environment details (OS, Node.js version)
- Recent changes made

### **Self-Help Resources**
- [Debug History](debug-history.md) - Complete debugging history
- [System Status](current-status/system-status.md) - Current system status
- [Testing Framework](testing/testing-framework.md) - Testing procedures
- [Startup Procedures](procedures/startup-procedures.md) - Startup troubleshooting

---

**📝 Note:** Most issues can be resolved with the quick fixes above. If problems persist, check the debug history for similar issues and their solutions.
