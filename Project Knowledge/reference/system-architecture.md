# System Architecture - DYOR BOT

## 🎯 **ARCHITECTURE OVERVIEW**

### **Purpose**
DYOR BOT is a comprehensive research tool for analyzing Web3 and gaming projects. It uses over 10 data sources to provide project analysis, key findings, and confidence metrics.

### **Core Design Principles**
- **Dynamic Search Only**: No fallback data, all information from real-time sources
- **AI-Driven Research**: Claude-powered orchestration and analysis
- **Multi-Source Data Collection**: Comprehensive data from multiple APIs and services
- **Quality Gates**: Data validation and completeness checking
- **Confidence Scoring**: Automated analysis and findings generation

---

## 🏗️ **SYSTEM COMPONENTS**

### **Frontend Application**
- **Framework**: React with TypeScript
- **Deployment**: Vercel
- **URL**: https://dyor-bot.vercel.app
- **Features**:
  - Three-panel layout (search, results, confidence)
  - Collapsible sections for better UX
  - Real-time data display
  - Responsive design

### **Backend API**
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Deployment**: Render
- **URL**: https://dyor-bot.onrender.com
- **Features**:
  - RESTful API endpoints
  - AI orchestration integration
  - Multi-source data collection
  - Quality gates and validation

### **AI Orchestrator**
- **Provider**: Anthropic Claude
- **Model**: Claude 3 Sonnet
- **Integration**: Direct API integration
- **Features**:
  - Research planning and execution
  - Data analysis and findings generation
  - Academic report format output
  - Confidence scoring

### **Search Service**
- **Primary Engine**: DuckDuckGo API
- **Fallback Engines**: SearX.be, Brave Search, Qwant
- **Features**:
  - Multiple search engine support
  - Caching system (30-minute duration)
  - Rate limiting and delays
  - Web scraping fallbacks

---

## 🔄 **DATA FLOW ARCHITECTURE**

### **1. User Input Flow**
```
User enters project name → Frontend validation → API call to /api/research
```

### **2. Backend Research Flow**
```
API receives request → AI Orchestrator plans research → Data collection begins
```

### **3. Data Collection Process**
```
1. Project Classification (AI determines project type)
2. Official Source Discovery (website, whitepaper, docs)
3. Financial Data Collection (market cap, token info)
4. Team Analysis (LinkedIn, Glassdoor, studio background)
5. Technical Assessment (security, reviews, GitHub)
6. Community Health (Twitter, Discord, Reddit, Steam)
7. Quality Gates Validation
8. AI Analysis & Findings Generation
9. Confidence Metrics Calculation
```

### **4. Response Structure**
```typescript
ProjectResearch {
  projectName: string;
  projectType: 'Web3Game' | 'TraditionalGame' | 'Publisher' | 'Platform';
  keyFindings: { positives: string[], negatives: string[], redFlags: string[] };
  financialData: { marketCap?, roninTokenInfo?, avalancheTokenInfo? };
  teamAnalysis: TeamAnalysis;
  technicalAssessment: TechnicalAssessment;
  communityHealth: CommunityHealth;
  confidence: ConfidenceMetrics;
  discoveredUrls: { [sourceType: string]: string };
  totalDataPoints: number;
  gameData: GameData;
}
```

---

## 🔧 **CORE MODULES**

### **AI Research Orchestrator**
- **File**: `backend/src/ai-research-orchestrator.ts`
- **Purpose**: Orchestrates research planning and execution
- **Features**:
  - Query classification (simple vs complex)
  - Research strategy generation
  - Data collection coordination
  - Hybrid search architecture

### **Search Service**
- **File**: `backend/src/search-service.ts`
- **Purpose**: Handles all external data discovery
- **Features**:
  - Multiple search engine integration
  - Web scraping capabilities
  - Caching and rate limiting
  - Error handling and fallbacks

### **Data Collection Functions**
- **File**: `backend/src/index.ts` (data collection functions)
- **Purpose**: Collects data from specific sources
- **Features**:
  - Financial data collection (CoinGecko, blockchain explorers)
  - Social media data (Twitter, Discord, Reddit)
  - Game platform data (Steam, Epic, GOG)
  - Team and company information

### **Quality Gates**
- **File**: `backend/src/quality-gates.ts`
- **Purpose**: Validates data quality and completeness
- **Features**:
  - Data completeness checking
  - Source reliability validation
  - Confidence scoring
  - Quality thresholds

### **Research Scoring**
- **File**: `backend/src/research-scoring.ts`
- **Purpose**: Generates confidence metrics and scoring
- **Features**:
  - Data point coverage analysis
  - Confidence calculation
  - Quality assessment
  - Performance metrics

---

## 🌐 **EXTERNAL INTEGRATIONS**

### **Search Engines**
- **DuckDuckGo**: Primary search engine
- **SearX.be**: Privacy-focused fallback
- **Brave Search**: Alternative search engine
- **Qwant**: European search engine

### **Financial Data Sources**
- **CoinGecko**: Primary crypto data source
- **CoinMarketCap**: Alternative financial data
- **Etherscan**: Ethereum blockchain data
- **BSCScan**: BSC blockchain data
- **Ronin Explorer**: Ronin network data

### **Social Media APIs**
- **Twitter**: Via Nitter and web scraping
- **Discord**: Discord API integration
- **Reddit**: Reddit JSON API
- **Telegram**: Web scraping fallback

### **Game Platforms**
- **Steam**: Steam API integration
- **Epic Games Store**: GraphQL API
- **GOG**: GOG API integration
- **Itch.io**: Itch.io API integration

### **Development Platforms**
- **GitHub**: GitHub API integration
- **GitLab**: Web scraping fallback
- **Bitbucket**: Web scraping fallback

### **Documentation Platforms**
- **Google Docs**: Web scraping
- **Notion**: Web scraping
- **Medium**: Web scraping
- **Mirror**: Web scraping

---

## 🎯 **HYBRID SEARCH ARCHITECTURE**

### **Query Classification System**
```typescript
interface QueryClassification {
  complexity: 'simple' | 'complex' | 'unknown';
  confidence: number;
  reasoning: string;
  recommendedApproach: 'direct' | 'orchestrated' | 'hybrid';
}
```

### **Search Approaches**

#### **Direct AI Search**
- **Use Case**: Simple queries, known projects
- **Response Time**: 5-10 seconds
- **Cost**: Low ($0.0073 per search)
- **Data Quality**: Good overview, limited to training data

#### **Orchestrated Search**
- **Use Case**: Complex projects, comprehensive research
- **Response Time**: 25-45 seconds
- **Cost**: Medium ($0.02-0.05 per search)
- **Data Quality**: Comprehensive, real-time verification

#### **Hybrid Search**
- **Use Case**: Intelligent routing based on query complexity
- **Response Time**: Variable based on approach
- **Cost**: Optimized based on complexity
- **Data Quality**: Best of both approaches

---

## 📊 **DATA STRUCTURES**

### **Project Types Supported**
- **Web3Game**: Blockchain-based games
- **TraditionalGame**: Conventional video games
- **Publisher**: Game publishing companies
- **Platform**: Gaming platforms and marketplaces

### **Data Categories**
1. **Basic Project Information** (7 data points)
2. **Financial Data** (8 data points)
3. **Team & Company Information** (7 data points)
4. **Technical Information** (7 data points)
5. **Community & Social** (9 data points)
6. **Game/Product Information** (8 data points)
7. **News & Media** (5 data points)

### **Confidence Metrics**
```typescript
interface ConfidenceMetrics {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidence: number;
  passesThreshold: boolean;
  gatesPassed: number;
  gatesFailed: number;
  breakdown: {
    dataCompleteness: number;
    sourceReliability: number;
    dataFreshness: number;
    coverage: number;
  };
}
```

---

## 🔒 **SECURITY & RELIABILITY**

### **API Key Management**
- **Environment Variables**: All API keys stored in `.env` files
- **Production Security**: Keys configured in deployment platforms
- **Access Control**: No hardcoded keys in source code

### **Rate Limiting**
- **Search Engines**: 1-second delays between requests
- **External APIs**: Respect rate limits and implement backoff
- **Caching**: 30-minute cache duration to reduce API calls

### **Error Handling**
- **Graceful Degradation**: System continues with partial data
- **Fallback Sources**: Multiple data sources for redundancy
- **Error Logging**: Comprehensive error tracking and reporting

### **Data Validation**
- **Quality Gates**: Data completeness and reliability checking
- **Source Verification**: Validate data from multiple sources
- **Confidence Scoring**: Automated quality assessment

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Caching Strategy**
- **Query Classification**: Cache classification results
- **Search Results**: 30-minute cache duration
- **API Responses**: Cache external API responses
- **Data Processing**: Cache processed data structures

### **Concurrency Control**
- **Parallel Requests**: Multiple API calls in parallel where possible
- **Request Queuing**: Queue requests to respect rate limits
- **Resource Management**: Efficient memory and CPU usage

### **Response Time Optimization**
- **Query Classification**: 0-2 seconds for known cases
- **Simple Queries**: 5-10 seconds
- **Complex Queries**: 25-45 seconds
- **Cached Queries**: 2-5 seconds

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Frontend Deployment (Vercel)**
- **Framework**: React with TypeScript
- **Build Process**: Automatic build and deployment
- **Environment**: Production-optimized
- **CDN**: Global content delivery network

### **Backend Deployment (Render)**
- **Runtime**: Node.js with TypeScript
- **Environment**: Production with auto-scaling
- **Database**: No persistent database (stateless)
- **Monitoring**: Built-in health checks and logging

### **Environment Configuration**
- **Development**: Local environment with `.env` files
- **Production**: Environment variables in deployment platforms
- **API Keys**: Securely stored in deployment environments

---

## 🔄 **MONITORING & MAINTENANCE**

### **Health Monitoring**
- **Health Endpoint**: `/api/health` for system status
- **Performance Metrics**: Response time and success rate tracking
- **Error Tracking**: Comprehensive error logging and reporting

### **Data Quality Monitoring**
- **Coverage Tracking**: Monitor data point coverage
- **Source Reliability**: Track source success rates
- **Confidence Metrics**: Monitor confidence score distribution

### **Performance Monitoring**
- **Response Times**: Track query response times
- **Success Rates**: Monitor search success rates
- **API Usage**: Track external API usage and costs

---

**📝 Note:** This architecture is designed for scalability, reliability, and maintainability. The modular design allows for easy updates and enhancements while maintaining the core principles of dynamic data discovery and AI-driven research.
