# Quality Gates Implementation for DYOR BOT

## Overview

The Quality Gates system prevents insufficient analyses by implementing 7 critical checks before allowing AI analysis to proceed. This ensures users receive reliable, well-researched insights rather than speculative analysis based on insufficient data.

## Architecture

### Core Components

1. **QualityGatesEngine** - Main orchestrator that runs all quality checks
2. **ResearchScoringEngine** - Integrated scoring system for research quality
3. **ProjectType Detection** - Automatically determines project type (web3_game, traditional_game, etc.)

### Quality Gates

#### Gate 1: Minimum Score Threshold
- **Requirement**: Research score ≥ 60/100
- **Purpose**: Ensures sufficient overall data quality
- **Blocking**: Yes

#### Gate 2: Critical Data Sources
- **Requirement**: At least 2 of 3 Tier 1 sources (whitepaper, onchain_data, team_info)
- **Requirement**: Minimum 15 total data points
- **Purpose**: Ensures foundational project information is available
- **Blocking**: Yes

#### Gate 3: Identity Verification
- **Requirement**: Team members identified and not anonymous
- **Purpose**: Prevents analysis of projects with hidden teams
- **Blocking**: Yes

#### Gate 4: Technical Foundation
- **Requirement**: Technical documentation OR working product OR verified contracts
- **Purpose**: Ensures project has actual technical substance
- **Blocking**: Yes

#### Gate 5: Community Proof
- **Requirement**: Minimum 100 total community members across platforms
- **Purpose**: Ensures project has real community engagement
- **Blocking**: Yes

#### Gate 6: Financial Transparency
- **Requirement**: Clear tokenomics (Web3) or business model (Traditional)
- **Purpose**: Ensures financial structure is understood
- **Blocking**: Advisory (doesn't block analysis)

#### Gate 7: Red Flag Detection
- **Requirement**: No critical red flags detected
- **Purpose**: Blocks analysis of potentially dangerous projects
- **Blocking**: Yes (Critical)

## Usage

### Basic Integration

```typescript
import { QualityGatesEngine, ProjectType } from './quality-gates';
import { mapDataToFindings } from './research-scoring';

// Initialize quality gates
const qualityGates = new QualityGatesEngine();

// Collect your research data
const allData = { /* your collected data */ };
const findings = mapDataToFindings(allData);

// Determine project type
const projectType: ProjectType = {
  type: 'web3_game', // or 'traditional_game', 'publisher', 'platform', 'unknown'
  confidence: 0.8
};

// Check quality gates
const gateResult = qualityGates.checkQualityGates(findings, projectType);

if (gateResult.passed) {
  // Proceed with AI analysis
  const aiAnalysis = await generateAIAnalysis(findings);
} else {
  // Handle failed gates
  console.log(gateResult.userMessage);
  console.log('Manual suggestions:', gateResult.manualResearchSuggestions);
}
```

### API Integration

The quality gates are automatically integrated into the `/api/research` endpoint. The response includes:

```json
{
  "researchQuality": {
    "qualityGates": {
      "passed": false,
      "gatesFailed": ["critical_sources", "identity_verification"],
      "recommendations": ["Only found 1/3 critical data sources"],
      "manualSuggestions": [
        "Search for project whitepaper, documentation, or technical specs",
        "Look up team members on LinkedIn"
      ],
      "retryAfter": 1440,
      "severity": "high"
    }
  }
}
```

## Project Type Detection

The system automatically detects project type based on available data:

- **Web3 Game**: Has verified smart contracts or blockchain data
- **Traditional Game**: Found on Steam or other gaming platforms
- **Publisher**: Multiple games under same studio
- **Platform**: Gaming platform or marketplace
- **Unknown**: Default when type cannot be determined

## Manual Research Suggestions

When gates fail, the system provides specific, actionable suggestions:

### Critical Sources Missing
- Search for project whitepaper, documentation, or technical specs
- Check project website for detailed information
- Verify token contract on blockchain explorer
- Look up team members on LinkedIn

### Identity Verification Issues
- Search for team members on project website
- Look for founders on LinkedIn or professional networks
- Check if team has revealed identities in recent updates

### Technical Foundation Issues
- Look for project whitepaper or technical documentation
- Check if project has a working demo or MVP
- Verify if smart contracts are deployed and verified

### Community Issues
- Check project Discord or Telegram
- Look for Twitter/X social media presence
- Verify if community exists on other platforms

## Retry Logic

The system suggests appropriate retry times based on the type of failure:

- **Red Flags**: No retry suggested (safety issue)
- **Critical Sources/Technical Issues**: 24 hours (structural issues take time)
- **Community Issues**: 1 week (community growth takes time)
- **Other Issues**: 1 hour default

## Testing

Run the quality gates tests:

```bash
cd backend
npx ts-node src/test-quality-gates.ts
```

This will test various scenarios including:
- High quality research (should pass)
- Insufficient data (should fail)
- Anonymous team (should fail)
- Red flags detected (should block)

## Configuration

### Adjusting Thresholds

You can modify thresholds in `quality-gates.ts`:

```typescript
// Minimum score threshold
private checkMinimumScore(score: ResearchScore): boolean {
  return score.totalScore >= 60 && score.passesThreshold; // Adjust 60 as needed
}

// Minimum community size
if (totalMembers < 100) { // Adjust 100 as needed
  // ...
}

// Minimum data points
if (totalDataPoints < 15) { // Adjust 15 as needed
  // ...
}
```

### Adding New Gates

To add a new quality gate:

1. Add the gate check method to `QualityGatesEngine`
2. Call it in `checkQualityGates()`
3. Add appropriate failure handling and suggestions

## Benefits

1. **Prevents Poor Analysis**: Stops AI from generating analysis on insufficient data
2. **User Guidance**: Provides specific suggestions for manual research
3. **Safety**: Blocks analysis of projects with red flags
4. **Transparency**: Clear explanation of why analysis was blocked
5. **Actionable Feedback**: Specific steps users can take to improve research quality

## Integration with Frontend

The frontend can use the quality gate results to:

1. Show appropriate error messages
2. Display manual research suggestions
3. Implement retry logic with suggested delays
4. Show severity indicators (critical, high, medium)
5. Guide users through manual research steps

## Error Handling

The system gracefully handles:
- Missing data sources
- Network failures
- Invalid project types
- Malformed research findings

All failures provide clear, actionable feedback to users. 