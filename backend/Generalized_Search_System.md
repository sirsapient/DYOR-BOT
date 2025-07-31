# Generalized Search System

## Overview

The DYOR BOT has been enhanced with a **generalized search system** that applies the same comprehensive research depth to ALL projects, not just hardcoded ones like Axie Infinity. This ensures that every project receives thorough analysis regardless of its establishment status.

## Key Changes Made

### 1. Removed Hardcoded Project Logic

**Before:**
- Hardcoded `knownUrls` object with specific URLs for Axie Infinity
- Different research strategies for "established" vs "unknown" projects
- Limited search depth for non-established projects

**After:**
- AI-powered dynamic URL discovery for any project
- Same comprehensive research approach for ALL projects
- Enhanced search strategies that work universally

### 2. AI-Powered URL Discovery

The system now uses AI to dynamically discover official URLs for any project:

```typescript
async function discoverOfficialUrlsWithAI(projectName: string, aliases: string[]): Promise<any> {
  // 1. Search for project context
  const searchTerms = [
    `${projectName} official website`,
    `${projectName} whitepaper`,
    `${projectName} documentation`,
    `${projectName} github`
  ];
  
  // 2. Use AI to extract official URLs from search results
  const prompt = `Given the following search results about "${projectName}", identify the official URLs for:
1. Official website
2. Whitepaper/technical paper
3. Documentation/developer docs
4. GitHub repository`;
  
  // 3. Return structured JSON with discovered URLs
}
```

### 3. Enhanced Search Strategies

The system now employs multiple fallback strategies:

1. **AI-Powered Discovery** (Primary)
   - Uses AI to analyze search results and identify official URLs
   - Works for any project, not just hardcoded ones

2. **Domain Pattern Search** (Fallback)
   - Tries common domain patterns (projectname.com, .io, .org)
   - Scrapes websites for whitepaper, docs, and GitHub links

3. **Enhanced Web Search** (Fallback)
   - Uses SerpAPI with specific search terms
   - Validates URLs before accepting them

4. **Comprehensive Tokenomics Search** (Enhanced)
   - 15 different search terms for tokenomics discovery
   - Covers token distribution, vesting, utility, staking, etc.

### 4. Universal Research Depth

Every project now receives the same level of comprehensive analysis:

#### Official Sources Discovery
- **Whitepaper/Technical Paper**: Aggressive search with multiple strategies
- **Documentation**: Developer docs, API docs, technical guides
- **GitHub**: Repository discovery and activity analysis
- **Website**: Official domain and content extraction

#### Tokenomics Analysis (for Web3 projects)
- Token distribution breakdown
- Vesting schedules
- Token utility and use cases
- Staking rewards and mechanisms
- Economic model analysis

#### Technical Assessment
- Smart contract verification
- Security audit discovery
- Code quality assessment
- Blockchain integration analysis

#### Community & Social Analysis
- Discord, Twitter, Telegram presence
- Community engagement metrics
- Social sentiment analysis
- Media coverage and influencer mentions

#### Team & Funding Verification
- Team background research
- Funding round discovery
- Investor analysis
- Previous project experience

## Implementation Details

### Enhanced `findOfficialSourcesForEstablishedProject` Function

```typescript
async function findOfficialSourcesForEstablishedProject(projectName: string, aliases: string[]): Promise<any> {
  // Strategy 1: AI-powered dynamic URL discovery
  const aiDiscoveredUrls = await discoverOfficialUrlsWithAI(projectName, aliases);
  
  // Strategy 2: Domain pattern search fallback
  if (!officialSources.whitepaper || !officialSources.documentation) {
    // Try common domain patterns
  }
  
  // Strategy 3: Enhanced web search fallback
  if (!officialSources.whitepaper || !officialSources.documentation) {
    // Use SerpAPI with specific search terms
  }
}
```

### Enhanced Tokenomics Search

```typescript
const enhancedSearchTerms = [
  `${projectName} tokenomics`,
  `${projectName} token distribution`,
  `${projectName} whitepaper`,
  `${projectName} token economics`,
  `${projectName} documentation`,
  `${projectName} technical paper`,
  `${projectName} economics paper`,
  `${projectName} governance token`,
  `${projectName} token allocation`,
  `${projectName} vesting schedule`,
  `${projectName} token utility`,
  `${projectName} staking rewards`,
  `${projectName} token supply`,
  `${projectName} tokenomics breakdown`,
  `${projectName} economic model`
];
```

### AI Research Orchestrator Enhancement

The AI orchestrator now applies enhanced research depth to ALL projects:

```typescript
return `You are a research strategist for a Web3/Gaming project analysis bot. Your job is to create an optimal research plan that achieves the SAME depth of research for ALL projects as we would for established projects like Axie Infinity.

IMPORTANT: Apply ENHANCED research depth for ALL projects, not just established ones. Every project deserves comprehensive analysis including:
- Aggressive whitepaper and documentation discovery
- Comprehensive tokenomics analysis (for web3 projects)
- Detailed technical assessment
- Thorough community and social media analysis
- Multiple data source validation
- Security audit investigation
- Team background verification`;
```

## Testing the Generalized System

### Test File: `test-generalized-search.js`

This test file verifies that the system works for various project types:

- **Established Projects**: Axie Infinity, Illuvium, Decentraland
- **Gaming Platforms**: Gala Games, Enjin, Immutable X
- **Blockchain Platforms**: WAX, Flow, Polygon
- **DeFi Projects**: Aave, Uniswap, Chainlink

### Test Results

The system successfully:
- ✅ Detects established projects correctly
- ✅ Generates AI discovery context for all projects
- ✅ Finds official domains via pattern search
- ✅ Creates comprehensive research plans
- ✅ Applies enhanced search terms universally
- ✅ Maintains same research depth for all projects

## Benefits of the Generalized System

### 1. Universal Coverage
- Works for any project, not just hardcoded ones
- No need to maintain project-specific URLs
- Scales automatically to new projects

### 2. Consistent Quality
- Same research depth for all projects
- No discrimination based on establishment status
- Comprehensive analysis for every project

### 3. AI-Powered Intelligence
- Dynamic URL discovery using AI
- Context-aware search strategies
- Intelligent fallback mechanisms

### 4. Enhanced Discoverability
- Multiple search strategies
- Comprehensive tokenomics search
- Aggressive documentation discovery

### 5. Future-Proof
- No hardcoded dependencies
- Adapts to new project types
- Continuously improving with AI

## Usage Examples

### Example 1: Established Project (Axie Infinity)
```javascript
// Same comprehensive analysis as before
const result = await researchProject('Axie Infinity');
// Finds: whitepaper, docs, GitHub, tokenomics, team info, etc.
```

### Example 2: New Project (Unknown Game)
```javascript
// Now gets the SAME comprehensive analysis
const result = await researchProject('NewWeb3Game');
// Finds: whitepaper, docs, GitHub, tokenomics, team info, etc.
```

### Example 3: DeFi Project (Non-Gaming)
```javascript
// Comprehensive analysis regardless of project type
const result = await researchProject('NewDeFiProtocol');
// Finds: documentation, GitHub, tokenomics, security audits, etc.
```

## Conclusion

The generalized search system ensures that **every project receives the same level of comprehensive research depth** that was previously only available for hardcoded established projects. This creates a fair, consistent, and thorough analysis experience for all users, regardless of which project they're researching.

The system is now:
- **Universal**: Works for any project type
- **Comprehensive**: Same depth for all projects
- **Intelligent**: AI-powered discovery
- **Robust**: Multiple fallback strategies
- **Future-proof**: No hardcoded dependencies 