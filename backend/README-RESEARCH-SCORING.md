# Research Scoring Engine for DYOR BOT

## Overview

The Research Scoring Engine is a quality control system that evaluates the completeness and reliability of research data before proceeding with AI analysis. It ensures that only high-quality, comprehensive research data is used for generating project analysis.

## Features

### Data Source Tiers

The engine categorizes data sources into three tiers:

#### Tier 1: Critical Foundation (Must-Have)
- **Whitepaper** (25 points) - Official project documentation
- **On-chain Data** (20 points) - Blockchain transaction and token data
- **Team Info** (15 points) - Developer/company background and experience

#### Tier 2: Market Intelligence (Important)
- **Community Health** (15 points) - Discord, social media activity
- **Financial Data** (10 points) - Market cap, tokenomics, funding
- **Product Data** (10 points) - Game details, development status

#### Tier 3: Supporting Evidence (Nice-to-Have)
- **Security Audits** (3 points) - Code audits, bug bounties
- **Media Coverage** (1 point) - News articles, reviews
- **Social Signals** (1 point) - Sentiment analysis, community engagement

### Scoring System

The engine calculates a total score (0-100) based on:

1. **Data Coverage** (40% of total score)
   - Quality multipliers (high: 1.0, medium: 0.7, low: 0.4)
   - Data point bonuses for comprehensive information

2. **Source Reliability** (40% of total score)
   - Official sources: 10 points
   - Verified sources: 7 points
   - Scraped sources: 4 points

3. **Recency Factor** (20% of total score)
   - Recent data (≤7 days): 5 points
   - Recent data (≤30 days): 4 points
   - Recent data (≤90 days): 3 points
   - Recent data (≤180 days): 2 points
   - Older data: 1 point

### Grade System

- **A** (85-100): Excellent research quality
- **B** (70-84): Good research quality
- **C** (60-69): Acceptable research quality
- **D** (40-59): Poor research quality
- **F** (0-39): Insufficient research quality

### Threshold Requirements

To proceed with AI analysis, research must meet:

1. **Minimum Score**: 60/100
2. **Minimum Data Points**: 15 meaningful data points
3. **Tier 1 Coverage**: At least 2 of 3 critical sources
4. **No Missing Critical Sources**: All required sources must be present

## Integration

### Backend Integration

The Research Scoring Engine is integrated into the `/api/research` endpoint:

```typescript
// Import the scoring engine
import { ResearchScoringEngine, mapDataToFindings } from './research-scoring';

// In the research endpoint
const scoringEngine = new ResearchScoringEngine();
const findings = mapDataToFindings(allData);
const { proceed, reason, score } = scoringEngine.shouldProceedWithAnalysis(findings);

// Only proceed with AI analysis if quality threshold is met
if (proceed) {
  // Generate AI analysis
} else {
  // Return helpful feedback about missing data
}
```

### Response Format

The research endpoint now includes quality metrics:

```json
{
  "projectName": "Example Project",
  "aiSummary": "...",
  "researchQuality": {
    "score": 75,
    "grade": "B",
    "confidence": 0.8,
    "passesThreshold": true,
    "breakdown": {
      "dataCoverage": 32,
      "sourceReliability": 28,
      "recencyFactor": 15
    },
    "missingCritical": [],
    "recommendations": ["Need more recent data"],
    "proceedWithAnalysis": true,
    "reason": null
  }
}
```

## Usage Examples

### Testing the Engine

Run the test file to see the engine in action:

```bash
cd backend
npx ts-node src/test-scoring.ts
```

### Manual Testing

```typescript
import { ResearchScoringEngine, mapDataToFindings } from './research-scoring';

const scoringEngine = new ResearchScoringEngine();

// Test with sample data
const testData = {
  cgData: { /* CoinGecko data */ },
  igdbData: { /* IGDB data */ },
  // ... other data sources
};

const findings = mapDataToFindings(testData);
const { proceed, reason, score } = scoringEngine.shouldProceedWithAnalysis(findings);

console.log(`Score: ${score.totalScore}/100 (Grade: ${score.grade})`);
console.log(`Proceed: ${proceed}`);
console.log(`Reason: ${reason}`);
```

## Configuration

### Adjusting Thresholds

Modify the scoring engine parameters in `research-scoring.ts`:

```typescript
private readonly MINIMUM_THRESHOLD = 60;        // Minimum score to proceed
private readonly MINIMUM_DATA_POINTS = 15;       // Minimum data points required
```

### Adding New Data Sources

To add a new data source:

1. Add to `DATA_SOURCES` array:
```typescript
{ name: 'new_source', tier: 2, weight: 10, reliability: 'verified' }
```

2. Update `mapDataToFindings()` function to map your data to the new source.

## Benefits

1. **Quality Control**: Ensures only high-quality data is used for AI analysis
2. **Transparency**: Provides clear metrics on research quality
3. **User Guidance**: Offers specific recommendations for improving research
4. **Resource Efficiency**: Prevents AI analysis on insufficient data
5. **Consistency**: Standardized evaluation across all research requests

## Troubleshooting

### Common Issues

1. **Low Scores**: Check if critical Tier 1 sources are missing
2. **Missing Data**: Verify API keys and data source availability
3. **Recency Issues**: Ensure data timestamps are properly set

### Debug Mode

Enable detailed logging by modifying the scoring engine:

```typescript
// Add debug logging to calculateResearchScore method
console.log('Data coverage:', breakdown.dataCoverage);
console.log('Source reliability:', breakdown.sourceReliability);
console.log('Recency factor:', breakdown.recencyFactor);
```

## Future Enhancements

1. **Dynamic Weighting**: Adjust weights based on project type
2. **Machine Learning**: Learn optimal thresholds from user feedback
3. **Real-time Updates**: Continuously update data freshness
4. **Custom Sources**: Allow users to add custom data sources
5. **Confidence Intervals**: Provide uncertainty estimates for scores 