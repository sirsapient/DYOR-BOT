# DYOR BOT System Architecture

## 🎯 **System Overview**

DYOR BOT is a comprehensive Web3 project research platform that combines AI orchestration with dynamic data collection to provide comprehensive project analysis. The system operates in two modes: **AI Orchestrated Research** (preferred) and **Fallback Batch Search** (when AI is unavailable).

## 🏗️ **High-Level Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   AI Services   │
│   (React)       │◄──►│   (Node.js)      │◄──►│   (Claude)      │
│                 │    │                  │    │                 │
│ • Search UI     │    │ • Research       │    │ • Research      │
│ • Results       │    │   Orchestrator   │    │   Planning      │
│ • Data Sources  │    │ • Data          │    │ • Analysis      │
│ • AI Summary    │    │   Collection     │    │ • Summaries     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  External APIs   │
                       │                  │
                       │ • CoinGecko      │
                       │ • Etherscan      │
                       │ • Twitter        │
                       │ • Discord        │
                       │ • GitHub         │
                       └──────────────────┘
```

## 🔄 **Data Flow Architecture**

### **1. Research Request Flow**
```
User Search Request
        │
        ▼
┌─────────────────┐
│  /api/research  │
│   Endpoint      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ API Key Check   │
│ ANTHROPIC_API_KEY│
└─────────────────┘
        │
        ▼
┌─────────────────┐    ┌─────────────────┐
│ AI Orchestrator │    │ Fallback Batch  │
│ (Preferred)     │    │ Search          │
└─────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Research Plan   │    │ Basic Search    │
│ Generation      │    │ Engine          │
└─────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Parallel Data   │    │ Sequential      │
│ Collection      │    │ Data Collection │
└─────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ AI Analysis &   │    │ Basic Data      │
│ Summary         │    │ Processing      │
└─────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Frontend        │    │ Frontend        │
│ Data Format     │    │ Data Format     │
└─────────────────┘    └─────────────────┘
```

## 🧩 **Core Components**

### **1. Frontend (React)**
- **Location**: `frontend/src/App.tsx`
- **Key Features**:
  - Search interface
  - Results display (2-column layout)
  - Interactive data sources (left column)
  - AI summary display (right column)
  - Data export functionality

### **2. Backend API Server**
- **Location**: `backend/src/index.ts`
- **Main Endpoint**: `/api/research`
- **Key Functions**:
  - Request validation
  - API key management
  - Research orchestration
  - Data transformation
  - Response formatting

### **3. AI Research Orchestrator**
- **Location**: `backend/src/ai-research-orchestrator.ts`
- **Key Functions**:
  - `conductAIOrchestratedResearch()`
  - Research plan generation
  - Source classification
  - Data collection coordination
  - AI analysis integration

### **4. Data Collection Functions**
- **Location**: `backend/src/index.ts` (enhancedDataCollectionFunctions)
- **Key Functions**:
  - `fetchWhitepaperUrl()`
  - `fetchTwitterProfileAndTweets()`
  - `fetchDiscordServerData()`
  - `fetchWebsiteAboutSection()`
  - `discoverOfficialUrlsWithAI()`

## 🔍 **Current Issues Analysis**

### **Issue 1: AI Summary Format Mismatch**
**Problem**: AI summary not matching Axie Infinity academic style
**Root Cause**: AI orchestrator is failing and falling back to batch search
**Evidence**: 
- Backend logs show "AI research failed"
- Fallback path generates incomplete summary
- `discoveredUrls` and `gameData.downloadLinks` are empty

### **Issue 2: Interactive Sources Not Working**
**Problem**: All sources show "INVALID URL" status
**Root Cause**: Data collection functions not working for template sources
**Evidence**:
- Template uses: `official_website`, `whitepaper`, `github_repos`, `social_media`, `financial_data`
- `collectFromSourceWithRealFunctions()` missing cases for `official_website` and `github_repos`
- Data collection returns `null` for missing source types

## 📊 **Data Collection Flow**

### **Template-Based Research Plan**
```typescript
web3_game: {
  prioritySources: [
    { source: 'official_website', searchTerms: ['official website', 'homepage'] },
    { source: 'whitepaper', searchTerms: ['whitepaper', 'tokenomics', 'economics'] },
    { source: 'github_repos', searchTerms: ['github', 'repository', 'code'] },
    { source: 'social_media', searchTerms: ['twitter', 'discord', 'telegram'] },
    { source: 'financial_data', searchTerms: ['token price', 'market cap', 'trading'] }
  ]
}
```

### **Data Collection Process**
1. **Source Classification**: Template determines source types
2. **URL Discovery**: `discoverOfficialUrlsWithAI()` finds URLs
3. **Data Collection**: `collectFromSourceWithRealFunctions()` processes each source
4. **Data Processing**: AI orchestrator analyzes collected data
5. **Summary Generation**: Claude generates comprehensive report

## 🚨 **Critical Path Issues**

### **Missing Source Type Handlers**
The `collectFromSourceWithRealFunctions()` function is missing cases for:
- `official_website` → Should collect website data
- `github_repos` → Should collect repository information
- `financial_data` → Should collect financial metrics

### **Data Flow Breakdown**
```
Template Source → collectFromSourceWithRealFunctions() → Missing Case → Returns null → No Data Collected
```

### **Fallback Path Issues**
When AI orchestrator fails:
1. Falls back to `conductBatchSearch()`
2. Returns different data structure
3. `discoveredUrls` becomes empty `{}`
4. `gameData.downloadLinks` becomes empty `[]`
5. Frontend shows "INVALID URL" for all sources

## 🛠️ **Required Fixes**

### **Fix 1: Add Missing Source Type Handlers**
```typescript
case 'official_website':
  // Handle website data collection
  break;
  
case 'github_repos':
  // Handle GitHub repository data collection
  break;
```

### **Fix 2: Ensure AI Orchestrator Success**
- Debug why AI orchestrator is failing
- Check data collection function availability
- Verify source type normalization

### **Fix 3: Data Structure Consistency**
- Ensure both paths return same `ProjectResearch` format
- Populate `discoveredUrls` and `gameData.downloadLinks` consistently
- Match Axie Infinity mock data structure

## 📈 **System Performance Metrics**

### **Current Performance**
- **AI Orchestrator**: ❌ Failing (falling back to batch search)
- **Batch Search**: ✅ Working (but wrong data format)
- **Data Collection**: ❌ Incomplete (missing source handlers)
- **Frontend Display**: ❌ Broken (wrong data structure)

### **Target Performance**
- **AI Orchestrator**: ✅ Success rate >90%
- **Data Collection**: ✅ All source types working
- **Frontend Display**: ✅ Proper Axie Infinity format
- **Response Time**: <5 seconds for comprehensive research

## 🔧 **Debugging Strategy**

### **Step 1: Verify AI Orchestrator**
- Check backend logs for AI orchestrator errors
- Verify API key configuration
- Test individual data collection functions

### **Step 2: Fix Source Type Handlers**
- Add missing cases to `collectFromSourceWithRealFunctions()`
- Test each source type individually
- Verify data collection success

### **Step 3: Validate Data Structure**
- Ensure consistent `ProjectResearch` format
- Test frontend display with fixed data
- Verify interactive sources functionality

## 📚 **Key Files for Debugging**

1. **`backend/src/index.ts`** - Main API endpoint and data transformation
2. **`backend/src/ai-research-orchestrator.ts`** - AI research orchestration
3. **`frontend/src/App.tsx`** - Frontend display logic
4. **`frontend/src/mockData.ts`** - Expected data format reference

## 🎯 **Next Steps**

1. **Immediate**: Fix missing source type handlers
2. **Short-term**: Debug AI orchestrator failures
3. **Medium-term**: Implement comprehensive testing
4. **Long-term**: Optimize performance and add new features

---

**Last Updated**: 2025-09-03  
**Status**: 🔴 Critical Issues Identified  
**Priority**: Fix data collection and AI orchestrator
