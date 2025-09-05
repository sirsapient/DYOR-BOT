# Universal API Manager

## 🎯 **Overview**

The Universal API Manager is a comprehensive system that provides centralized API rate limiting, monitoring, and intelligent coordination across all APIs used in the DYOR Bot system. It ensures optimal API usage, prevents rate limit violations, and provides detailed analytics.

## 🚀 **Key Features**

### ✅ **Rate Limiting & Throttling**
- **Automatic rate limit enforcement** for all APIs
- **Intelligent request queuing** when limits are reached
- **Dynamic throttling** based on API responses
- **Burst handling** for APIs with burst limits

### ✅ **API Coordination**
- **Intelligent API selection** based on cost, latency, and success rate
- **Automatic fallback** to alternative APIs when primary fails
- **Task-specific API routing** (blockchain, NFT, search, etc.)
- **Confidence scoring** for API selection decisions

### ✅ **Monitoring & Analytics**
- **Real-time usage tracking** for all APIs
- **Performance metrics** (response time, success rate, cost)
- **Historical analytics** with time-based filtering
- **Health status monitoring** for all APIs

### ✅ **Cost Management**
- **Per-request cost tracking** in USD
- **Daily/monthly cost limits** and alerts
- **Free tier monitoring** for APIs with free limits
- **Cost optimization recommendations**

## 📊 **Supported APIs**

### **Blockchain APIs**
- **Etherscan** - Ethereum blockchain data
- **BSCScan** - Binance Smart Chain data
- **PolygonScan** - Polygon blockchain data
- **Snowtrace** - Avalanche blockchain data

### **NFT APIs**
- **OpenSea** - Ethereum NFT marketplace
- **Magic Eden** - Solana NFT marketplace

### **Search APIs**
- **DuckDuckGo** - Free search API
- **SearX** - Open-source search engine
- **Brave Search** - Privacy-focused search

### **Financial APIs**
- **CoinGecko** - Cryptocurrency data
- **CoinMarketCap** - Market data

### **Social Media APIs**
- **Twitter API** - Social media data
- **Reddit API** - Community discussions

### **AI APIs**
- **Anthropic Claude** - AI analysis and research

### **Gaming APIs**
- **Steam API** - Game data and player counts
- **Steam Charts** - Historical gaming data

### **Development APIs**
- **GitHub API** - Repository and code data

## 🔧 **Configuration**

### **API Rate Limits**
```typescript
{
  name: 'etherscan',
  rateLimit: {
    requests: 5,        // 5 requests
    window: 1000,       // per 1 second
    burst: 10           // optional burst limit
  },
  cost: {
    perRequest: 0.0001, // $0.0001 per request
    freeTier: 100000    // 100k free requests per day
  },
  priority: 'high',     // high/medium/low priority
  fallbacks: ['bscscan', 'polygonscan']
}
```

### **Retry Configuration**
```typescript
retryConfig: {
  maxRetries: 3,           // Maximum retry attempts
  backoffMultiplier: 2,    // Exponential backoff multiplier
  baseDelay: 1000          // Base delay in milliseconds
}
```

## 📈 **Usage Examples**

### **Basic API Call**
```typescript
import { universalAPIManager } from './universal-api-manager';

// Make a rate-limited API call
const response = await universalAPIManager.makeAPICall(
  'etherscan',
  '?module=account&action=balance&address=0x...',
  { method: 'GET' },
  'high' // priority
);
```

### **Intelligent API Coordination**
```typescript
// Get optimal API for blockchain research
const coordination = universalAPIManager.getOptimalAPICoordination('blockchain', {
  maxCost: 0.01,        // Maximum $0.01 per request
  maxLatency: 5000,     // Maximum 5 second response time
  minSuccessRate: 90    // Minimum 90% success rate
});

console.log(`Using ${coordination.primaryAPI} with ${coordination.confidence * 100}% confidence`);
```

### **API Status Monitoring**
```typescript
// Get comprehensive API status
const status = universalAPIManager.getAPIStatus();
console.log(`Total Usage: ${status.totalUsage} requests`);
console.log(`Total Cost: $${status.totalCost.toFixed(4)}`);
console.log(`Success Rate: ${status.overallSuccessRate.toFixed(1)}%`);
```

### **Usage Analytics**
```typescript
// Get usage statistics for last 24 hours
const stats = universalAPIManager.getUsageStatistics();
console.log(`Requests by API:`, stats.requestsByAPI);
console.log(`Requests by Hour:`, stats.requestsByHour);
```

## 🎯 **Integration with Existing Services**

### **Enhanced Search Service**
```typescript
import { EnhancedSearchService } from './integrate-api-manager';

const searchService = new EnhancedSearchService();
const results = await searchService.search('Elumia blockchain game');
```

### **Enhanced NFT Service**
```typescript
import { EnhancedNFTService } from './integrate-api-manager';

const nftService = new EnhancedNFTService();
const nfts = await nftService.searchNFTs('Elumia');
```

### **Enhanced Blockchain Service**
```typescript
import { EnhancedBlockchainService } from './integrate-api-manager';

const blockchainService = new EnhancedBlockchainService();
const tokenData = await blockchainService.getTokenData('0x...', 'ethereum');
```

## 📊 **Dashboard & Monitoring**

### **Real-time Dashboard**
```typescript
import { APIManagerDashboard } from './integrate-api-manager';

const dashboard = new APIManagerDashboard();
dashboard.printDashboard();
```

### **API Health Status**
- ✅ **Healthy** - Success rate > 90%, response time < 5s
- ⚠️ **Warning** - Success rate 70-90%, response time 5-10s
- ❌ **Critical** - Success rate < 70%, throttled, or response time > 10s

## 🔄 **Automatic Features**

### **Rate Limit Handling**
- **Automatic queuing** when rate limits are reached
- **Intelligent backoff** with exponential delays
- **Request prioritization** based on urgency
- **Fallback routing** to alternative APIs

### **Error Recovery**
- **Automatic retries** with configurable backoff
- **Circuit breaker pattern** for failing APIs
- **Graceful degradation** when APIs are unavailable
- **Health monitoring** and automatic recovery

### **Cost Optimization**
- **Free tier prioritization** for APIs with free limits
- **Cost-based routing** to cheaper alternatives
- **Usage alerts** when approaching cost limits
- **Automatic fallback** to free alternatives

## 📈 **Performance Metrics**

### **Real-time Metrics**
- **Request count** per API
- **Success/failure rates** per API
- **Average response times** per API
- **Cost tracking** per API and total

### **Historical Analytics**
- **Usage trends** over time
- **Performance degradation** detection
- **Cost analysis** and optimization opportunities
- **API reliability** scoring

## 🚨 **Alerts & Recommendations**

### **Automatic Alerts**
- **Rate limit violations** detected
- **High error rates** (> 10% failures)
- **Cost threshold** exceeded
- **API downtime** detected

### **Optimization Recommendations**
- **Switch to faster APIs** when latency is high
- **Use free alternatives** when costs are high
- **Implement caching** for frequently accessed data
- **Adjust rate limits** based on usage patterns

## 🔧 **Configuration Management**

### **Dynamic Configuration**
```typescript
// Update API configuration at runtime
universalAPIManager.updateAPIConfig('etherscan', {
  rateLimit: { requests: 10, window: 1000 } // Increase rate limit
});
```

### **Emergency Controls**
```typescript
// Reset API limits (for testing or recovery)
universalAPIManager.resetAPI('etherscan');
```

## 📊 **Test Results**

The Universal API Manager has been successfully tested with:

- ✅ **Rate limiting** - Properly enforces limits and queues requests
- ✅ **API coordination** - Intelligently selects optimal APIs
- ✅ **Fallback handling** - Seamlessly switches to alternatives
- ✅ **Cost tracking** - Accurately tracks and reports costs
- ✅ **Performance monitoring** - Provides real-time metrics
- ✅ **Error handling** - Gracefully handles API failures

## 🎯 **Benefits**

### **For Developers**
- **Simplified API management** - One interface for all APIs
- **Automatic rate limiting** - No need to manually track limits
- **Intelligent routing** - Optimal API selection automatically
- **Comprehensive monitoring** - Full visibility into API usage

### **For Operations**
- **Cost control** - Prevent unexpected API costs
- **Reliability** - Automatic fallbacks ensure uptime
- **Performance** - Optimized API selection for speed
- **Scalability** - Handles high-volume API usage

### **For Business**
- **Cost optimization** - Minimize API expenses
- **Service reliability** - Ensure consistent data collection
- **Performance insights** - Understand API usage patterns
- **Risk mitigation** - Prevent rate limit violations

## 🚀 **Next Steps**

1. **Integrate with AI Orchestrator** - Use API Manager for all AI research calls
2. **Add more APIs** - Expand support for additional data sources
3. **Implement caching** - Add intelligent caching to reduce API calls
4. **Create web dashboard** - Build a web interface for monitoring
5. **Add machine learning** - Use ML to predict optimal API selection

---

The Universal API Manager provides a robust foundation for managing all API interactions in the DYOR Bot system, ensuring optimal performance, cost control, and reliability. 🎯
