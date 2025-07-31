# AI-First Research Orchestration for DYOR BOT

This system uses AI to plan and optimize research before data collection, making the research process more intelligent and efficient.

## Overview

The AI Research Orchestrator provides three main phases:

1. **Phase 1: AI Research Planning** - Generate optimal research strategies based on project type
2. **Phase 2: Adaptive Research** - AI monitors progress and adjusts strategy in real-time
3. **Phase 3: Quality Assessment** - AI evaluates research completeness and quality

## Features

- 🤖 **AI-Driven Planning**: Uses Claude to create optimal research strategies
- 📊 **Adaptive Research**: AI monitors progress and adjusts strategy dynamically
- 🎯 **Quality Gates Integration**: Works with existing quality gates system
- ⚡ **Time Optimization**: Stops research when sufficient data is collected
- 🔍 **Project Classification**: Automatically classifies project types for targeted research

## Installation

1. Install the required dependency:
```bash
npm install @anthropic-ai/sdk
```

2. Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

### Basic Usage

```typescript
import { conductAIOrchestratedResearch } from './ai-research-orchestrator';

const result = await conductAIOrchestratedResearch(
  'Axie Infinity',
  process.env.ANTHROPIC_API_KEY,
  {
    name: 'Axie Infinity',
    website: 'https://axieinfinity.com',
    description: 'A blockchain-based game where players collect, breed, and battle digital pets',
    socialLinks: {
      twitter: 'https://twitter.com/AxieInfinity',
      discord: 'https://discord.gg/axie'
    },
    aliases: ['AXS', 'Axie']
  }
);

if (result.success) {
  console.log('Research completed successfully!');
  console.log(`Project Type: ${result.researchPlan.projectClassification.type}`);
  console.log(`Sources Collected: ${result.meta.sourcesCollected}`);
  console.log(`AI Confidence: ${result.completeness.confidence}`);
} else {
  console.log('Research failed:', result.reason);
}
```

### Advanced Usage with Individual Methods

```typescript
import { AIResearchOrchestrator } from './ai-research-orchestrator';

const orchestrator = new AIResearchOrchestrator(process.env.ANTHROPIC_API_KEY);

// Phase 1: Generate research plan
const plan = await orchestrator.generateResearchPlan('Illuvium', {
  name: 'Illuvium',
  website: 'https://illuvium.io',
  description: 'A blockchain-based game with NFT creatures and land'
});

// Phase 2: Adaptive research during collection
const adaptiveState = await orchestrator.adaptResearchStrategy(
  plan,
  currentFindings,
  timeElapsed
);

// Phase 3: Final assessment
const completeness = await orchestrator.assessResearchCompleteness(plan, finalFindings);
```

## Research Plan Structure

The AI generates research plans with the following structure:

```typescript
interface ResearchPlan {
  projectClassification: {
    type: 'web3_game' | 'traditional_game' | 'publisher' | 'platform' | 'defi' | 'unknown';
    confidence: number;
    reasoning: string;
  };
  prioritySources: {
    source: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
    searchTerms: string[];
    expectedDataPoints: string[];
  }[];
  riskAreas: {
    area: string;
    priority: 'high' | 'medium' | 'low';
    investigationApproach: string;
  }[];
  searchAliases: string[];
  estimatedResearchTime: number;
  successCriteria: {
    minimumSources: number;
    criticalDataPoints: string[];
    redFlagChecks: string[];
  };
}
```

## Available Data Sources

The system recognizes these data sources with different priorities:

### Tier 1 (Critical)
- **whitepaper** - Official project docs, tokenomics, roadmap
- **onchain_data** - Contract verification, token metrics, holder data
- **team_info** - LinkedIn profiles, backgrounds, previous projects

### Tier 2 (Important)
- **community_health** - Discord/Twitter/Telegram engagement
- **financial_data** - Market cap, funding, trading metrics
- **product_data** - Steam stats, game reviews, user metrics

### Tier 3 (Supporting)
- **security_audits** - CertiK, Immunefi audit reports
- **media_coverage** - News articles, influencer coverage
- **social_signals** - Reddit sentiment, YouTube engagement

## Integration with Existing Systems

The AI Research Orchestrator integrates seamlessly with your existing systems:

### Quality Gates Integration
```typescript
// Uses existing QualityGatesEngine
const gateResult = this.qualityGates.checkQualityGates(finalFindings, {
  type: plan.projectClassification.type,
  confidence: plan.projectClassification.confidence
});
```

### Research Scoring Integration
```typescript
// Uses existing ResearchScoringEngine
const score = this.scoringEngine.calculateResearchScore(findings);
```

## Testing

Run the test file to see the system in action:

```bash
# Set your API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Run the test
npx ts-node src/test-ai-orchestrator.ts
```

## Configuration

### Environment Variables
- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)

### Model Configuration
The system uses `claude-3-5-sonnet-20241022` by default. You can modify the model in the orchestrator class:

```typescript
const response = await this.anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Change this if needed
  max_tokens: 2000,
  messages: [{ role: 'user', content: prompt }]
});
```

## Error Handling

The system includes robust error handling:

- **AI Response Parsing**: Falls back to default plans if AI response is malformed
- **API Failures**: Graceful degradation with fallback strategies
- **Invalid Data**: Validation and sanitization of AI responses

## Performance Considerations

- **API Costs**: Each research plan uses ~3-5 API calls to Claude
- **Response Time**: AI planning adds 2-5 seconds to research initialization
- **Caching**: Consider caching research plans for similar projects

## Customization

### Adding New Data Sources
1. Update the `buildResearchPlanningPrompt` method
2. Add the source to your data collection logic
3. Update the `collectFromSource` function

### Modifying AI Prompts
Edit the prompt building methods:
- `buildResearchPlanningPrompt`
- `buildAdaptationPrompt`
- `buildCompletenessPrompt`

### Custom Project Types
Add new project types to the `projectClassification.type` union type and update the AI prompts accordingly.

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   ```
   ⚠️  Please set ANTHROPIC_API_KEY environment variable
   ```

2. **AI Response Parsing Failed**
   ```
   Failed to parse AI research plan: [Error details]
   ```
   - Check API key validity
   - Verify network connectivity
   - Check Anthropic API status

3. **Research Plan Generation Failed**
   - The system will use a fallback plan
   - Check console for specific error messages

### Debug Mode

Enable debug logging by modifying the orchestrator:

```typescript
// Add to AIResearchOrchestrator constructor
this.debug = process.env.DEBUG === 'true';
```

## Contributing

When contributing to the AI Research Orchestrator:

1. Test with multiple project types
2. Validate AI response parsing
3. Update documentation for new features
4. Add appropriate error handling

## License

This system is part of the DYOR BOT project and follows the same licensing terms. 