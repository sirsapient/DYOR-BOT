# DYOR BOT Backend

A comprehensive research system for analyzing Web3 and gaming projects using AI-driven orchestration and multiple data sources.

## Overview

DYOR BOT backend provides intelligent research capabilities for Web3 and gaming projects through:

- 🤖 **AI Research Orchestration** - AI-driven planning and adaptive research strategies
- 📊 **Multi-Source Data Collection** - Whitepapers, GitHub, security audits, social media, and more
- 🎯 **Quality Gates** - Automated quality assessment and confidence scoring
- ⚡ **Real-time Research** - Adaptive research that adjusts based on findings
- 🔍 **Project Classification** - Automatic project type detection for targeted research

## Features

### AI Research Orchestration
- AI-driven research planning using Claude
- Adaptive research strategies that adjust in real-time
- Quality assessment and completeness evaluation
- Project type classification (web3_game, traditional_game, publisher, platform, defi)

### Data Sources
- **Whitepapers & Documentation** - Comprehensive document analysis
- **GitHub Integration** - Repository analysis and activity metrics
- **Security Audits** - Audit report analysis and risk assessment
- **Social Media** - Twitter, Discord, Reddit community analysis
- **Financial Data** - Market cap, token information from multiple chains
- **Team Analysis** - LinkedIn, Glassdoor, company background research
- **Steam Integration** - Game reviews and community sentiment

### Quality Gates
- Automated quality assessment
- Confidence scoring based on data completeness
- Source validation and verification
- Research completeness evaluation

### Blockchain Integrations
- **Ronin Network** - Axie Infinity and gaming token analysis
- **Avalanche Network** - DeFi and gaming project support
- **Multi-chain Support** - Extensible for additional networks

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set required environment variables:
```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export OPENAI_API_KEY="your-openai-api-key"
export GITHUB_TOKEN="your-github-token"
export TWITTER_BEARER_TOKEN="your-twitter-token"
export DISCORD_TOKEN="your-discord-token"
export STEAM_API_KEY="your-steam-api-key"
```

3. Build the project:
```bash
npm run build
```

## Usage

### Basic Research

```typescript
import { conductAIOrchestratedResearch } from './src/ai-research-orchestrator';

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
```

### API Endpoints

- `POST /api/research` - Conduct comprehensive project research
- `GET /api/health` - Health check endpoint

### Research Results

The system returns comprehensive research data including:

- **AI Summary** - AI-generated project analysis
- **Key Findings** - Positive aspects, negative aspects, and red flags
- **Financial Data** - Market cap, token information, multi-chain data
- **Team Analysis** - Company background, LinkedIn insights, reviews
- **Technical Assessment** - Security analysis, GitHub activity, review scores
- **Community Health** - Social media activity, Discord data, Steam reviews
- **Confidence Scoring** - Overall confidence grade and detailed breakdown

## Architecture

### Core Components

- **AI Research Orchestrator** (`ai-research-orchestrator.ts`) - Main research coordination
- **Search Service** (`search-service.ts`) - Multi-source data collection
- **Quality Gates** (`quality-gates.ts`) - Quality assessment and validation
- **Research Scoring** (`research-scoring.ts`) - Confidence and completeness scoring
- **Confidence Indicators** (`confidence-indicators.ts`) - Visual confidence display

### Data Flow

1. **Research Planning** - AI generates optimal research strategy
2. **Data Collection** - Parallel collection from multiple sources
3. **Adaptive Research** - AI adjusts strategy based on findings
4. **Quality Assessment** - Automated quality gates and validation
5. **Result Compilation** - Comprehensive report generation

## Development

### Project Structure

```
src/
├── ai-research-orchestrator.ts  # Main research coordination
├── search-service.ts            # Multi-source data collection
├── quality-gates.ts             # Quality assessment
├── research-scoring.ts          # Confidence scoring
├── confidence-indicators.ts     # Visual indicators
├── types.ts                     # TypeScript definitions
└── index.ts                     # Main entry point
```

### Testing

```bash
# Run tests
npm test

# Run specific test
npm test -- test-research.js
```

### Building

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Anthropic Claude API key for AI orchestration
- `OPENAI_API_KEY` - OpenAI API key for additional AI features
- `GITHUB_TOKEN` - GitHub API token for repository analysis
- `TWITTER_BEARER_TOKEN` - Twitter API token for social analysis
- `DISCORD_TOKEN` - Discord bot token for community analysis
- `STEAM_API_KEY` - Steam API key for game reviews
- `PORT` - Server port (default: 3001)

### Quality Gates Configuration

Quality gates can be configured in `quality-gates.ts`:

```typescript
const qualityGates = {
  minimumSources: 3,
  minimumConfidence: 70,
  requiredSources: ['whitepaper', 'github'],
  timeLimit: 300000 // 5 minutes
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please check the documentation or create an issue in the repository.
