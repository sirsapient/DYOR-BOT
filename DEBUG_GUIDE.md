# DYOR BOT Debug Guide & Knowledge Base

## Table of Contents
1. [System Overview](#system-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Expected Data Sources](#expected-data-sources)
4. [Reference Test Case: Axie Infinity](#reference-test-case-axie-infinity)
5. [Debugging History](#debugging-history)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Quality Gates & Validation](#quality-gates--validation)
8. [API Endpoints & Testing](#api-endpoints--testing)

---

## System Overview

### Purpose
DYOR BOT is a comprehensive research tool for analyzing Web3 and gaming projects. It uses over 10 data sources to provide project analysis, key findings, and confidence metrics.

### Core Components
- **Frontend**: React app with three-panel layout (search, results, confidence)
- **Backend**: Node.js/Express API with AI orchestration
- **AI Orchestrator**: Claude-powered research planning and execution
- **Quality Gates**: Data validation and completeness checking
- **Research Scoring**: Automated analysis and findings generation

### Project Types Supported
- Web3Game
- TraditionalGame  
- Publisher
- Platform

---

## Data Flow Architecture

### 1. User Input Flow
```
User enters project name → Frontend validation → API call to /api/research
```

### 2. Backend Research Flow
```
API receives request → AI Orchestrator plans research → Data collection begins
```

### 3. Data Collection Process
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

### 4. Response Structure
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
}
```

---

## Expected Data Sources

### Primary Sources (Must Find)
1. **Official Website** - Project homepage and about section
2. **Whitepaper** - Technical documentation and tokenomics
3. **GitHub Repository** - Code activity and development status
4. **Social Media** - Twitter, Discord, Reddit presence
5. **Financial Data** - Market cap, token information

### Secondary Sources (Nice to Have)
1. **Team Information** - LinkedIn profiles, company background
2. **Security Audits** - Audit reports and security assessments
3. **Community Reviews** - Steam reviews, user feedback
4. **Press Coverage** - News articles and media mentions

### Data Quality Indicators
- **Official Sources**: Direct from project team (highest quality)
- **Verified Sources**: Third-party but reliable (medium quality)
- **Scraped Sources**: Automated collection (lower quality)

---

## Reference Test Case: Axie Infinity

### Expected Data for Axie Infinity

#### Basic Information
- **Project Name**: Axie Infinity
- **Project Type**: Web3Game
- **Website**: https://axieinfinity.com
- **Description**: Blockchain-based game where players collect, breed, and battle digital pets

#### Financial Data
- **Token Symbol**: AXS (Axie Infinity Shards)
- **Network**: Ronin Network (primary), Ethereum (secondary)
- **Market Cap**: Should be discoverable via CoinGecko/CoinMarketCap
- **Contract Addresses**: 
  - Ronin: Should be discoverable
  - Ethereum: Should be discoverable

#### Official Sources (Must Find)
1. **Website**: https://axieinfinity.com
2. **Whitepaper**: Should be discoverable on website
3. **Documentation**: https://docs.axieinfinity.com
4. **GitHub**: Should have active repositories
5. **Social Media**:
   - Twitter: https://twitter.com/AxieInfinity
   - Discord: https://discord.gg/axie
   - Reddit: r/AxieInfinity

#### Team Information
- **Studio**: Sky Mavis
- **Founded**: 2018
- **Team Size**: Should be discoverable via LinkedIn
- **Background**: Gaming and blockchain experience

#### Technical Data
- **Security Audits**: Should have audit reports
- **GitHub Activity**: Active development
- **Reviews**: Steam reviews if applicable

#### Community Health
- **Discord Members**: Large community (100k+)
- **Twitter Followers**: Significant following
- **Reddit Activity**: Active subreddit
- **Steam Reviews**: If on Steam platform

### Validation Checklist
- [ ] Website discovered and accessible
- [ ] Whitepaper found and parsed
- [ ] GitHub repositories identified
- [ ] Social media links discovered
- [ ] Financial data collected
- [ ] Team information gathered
- [ ] Community metrics found
- [ ] Technical assessment completed

---

## Debugging History

### Session 1: Initial Backend Issues
**Date**: [Current Session]
**Issue**: AI wanted to hardcode Axie Infinity data instead of dynamically finding it
**Root Cause**: Research system not properly discovering official sources
**Solution**: Need to improve source discovery algorithms

### Session 2: SerpAPI Limit Reached
**Date**: [Current Session]
**Issue**: Hit SerpAPI usage limit, preventing backend from functioning
**Root Cause**: SerpAPI is expensive and has usage limits
**Solution**: Implemented free DuckDuckGo API alternative with caching and fallback methods
**Status**: ✅ RESOLVED - Backend now functional without SerpAPI
**Notes**: 
- Basic search functionality working
- Caching system implemented (30-minute cache duration)
- Contract address discovery may need additional sources
- Official source discovery working but with reduced results compared to SerpAPI

### Session 2: Data Collection Gaps
**Date**: [Future Sessions]
**Issue**: [To be documented]
**Root Cause**: [To be documented]
**Solution**: [To be documented]

### Session 3: Quality Gates Failures
**Date**: [Future Sessions]
**Issue**: [To be documented]
**Root Cause**: [To be documented]
**Solution**: [To be documented]

---

## Common Issues & Solutions

### Issue 1: No Data Found
**Symptoms**: Empty research results, low confidence scores
**Possible Causes**:
- Project name too generic
- Official sources not discovered
- API rate limits hit
- Network connectivity issues

**Debugging Steps**:
1. Check API logs for errors
2. Verify project name spelling
3. Test with known project (Axie Infinity)
4. Check rate limit status
5. Validate network connectivity

### Issue 2: Incomplete Data Collection
**Symptoms**: Partial results, missing key data sources
**Possible Causes**:
- Source discovery algorithms failing
- Parsing errors on websites
- API endpoints changed
- Authentication issues

**Debugging Steps**:
1. Review discovered URLs in response
2. Check individual source collection logs
3. Test source URLs manually
4. Verify API endpoints still work
5. Check authentication tokens

### Issue 3: AI Analysis Issues
**Symptoms**: Poor quality findings, generic responses
**Possible Causes**:
- Insufficient data for analysis
- AI prompt issues
- Context window limitations
- API key problems

**Debugging Steps**:
1. Verify data completeness before AI analysis
2. Review AI prompts and context
3. Check AI API key validity
4. Test with more data sources
5. Validate AI response quality

---

## Quality Gates & Validation

### Quality Gate Criteria
1. **Data Completeness**: Minimum required sources found
2. **Source Reliability**: Official vs verified vs scraped ratio
3. **Data Freshness**: How recent the data is
4. **Coverage**: Key areas (financial, team, technical, community)

### Confidence Scoring
- **Grade A (90-100%)**: Comprehensive data from official sources
- **Grade B (80-89%)**: Good data with some gaps
- **Grade C (70-79%)**: Adequate data for basic analysis
- **Grade D (60-69%)**: Limited data, use with caution
- **Grade F (0-59%)**: Insufficient data, not recommended

### Validation Rules
- Must find at least 3 official sources
- Financial data should include market cap or token info
- Team information should include company background
- Community health should include at least 2 social platforms

---

## API Endpoints & Testing

### Main Research Endpoint
```
POST /api/research
Content-Type: application/json

Request:
{
  "projectName": "Axie Infinity"
}

Response:
{
  "projectName": "Axie Infinity",
  "projectType": "Web3Game",
  "keyFindings": { ... },
  "financialData": { ... },
  "teamAnalysis": { ... },
  "technicalAssessment": { ... },
  "communityHealth": { ... },
  "confidence": { ... },
  "discoveredUrls": { ... },
  "totalDataPoints": 150
}
```

### Health Check Endpoint
```
GET /api/health
Response: { "status": "ok" }
```

### Testing Commands
```bash
# Test health endpoint
curl https://dyor-bot.onrender.com/api/health

# Test research endpoint
curl -X POST https://dyor-bot.onrender.com/api/research \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Axie Infinity"}'
```

---

## Next Steps & Priorities

### Immediate Priorities
1. **Fix Source Discovery**: Ensure all official Axie Infinity sources are found
2. **Improve Data Parsing**: Better extraction of financial and team data
3. **Enhance AI Analysis**: More specific and actionable findings
4. **Add Error Handling**: Better error messages and recovery

### Future Enhancements
1. **Real-time Data**: Live market data integration
2. **Historical Analysis**: Track project changes over time
3. **Comparative Analysis**: Compare multiple projects
4. **Advanced Filtering**: Filter by project type, market cap, etc.

---

## Notes & Observations

### Current System Strengths
- Comprehensive data collection approach
- AI-driven research orchestration
- Quality gates for validation
- Confidence scoring system

### Current System Weaknesses
- Source discovery sometimes misses official sources
- AI analysis can be generic
- Limited real-time data
- No historical tracking

### Key Learnings
- Axie Infinity serves as excellent test case due to comprehensive data availability
- Official source discovery is critical for data quality
- AI analysis quality depends heavily on input data quality
- Quality gates help prevent poor research results

---

*Last Updated: [Current Date]*
*Version: 1.0*
