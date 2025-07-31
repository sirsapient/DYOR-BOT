// Simple test for Research Scoring Engine
import { ResearchScoringEngine, mapDataToFindings, ResearchFindings } from './research-scoring';

// Test data that would typically come from the research endpoint
const testData = {
  cgData: {
    name: 'Test Token',
    market_data: {
      market_cap: { usd: 1000000 },
      circulating_supply: 1000000,
      total_supply: 10000000
    },
    description: { en: 'A test token for gaming' },
    links: {
      homepage: ['https://testproject.com'],
      chat_url: ['https://discord.gg/test']
    }
  },
  igdbData: {
    name: 'Test Game',
    summary: 'A blockchain-based game',
    involved_companies: [
      { company: 123, developer: true, publisher: false }
    ]
  },
  steamData: {
    name: 'Test Game',
    steam_appid: 123456,
    review_score_desc: 'Very Positive'
  },
  discordData: {
    server_name: 'Test Community',
    approximate_member_count: 5000,
    approximate_presence_count: 1000
  },
  etherscanData: {
    tokenName: 'Test Token',
    tokenSymbol: 'TEST',
    totalSupply: '10000000'
  },
  securitySummary: 'CertiK: Audit completed, score 85',
  twitterSummary: 'Twitter: 10k followers, positive sentiment',
  redditSummary: 'Reddit: 5 positive, 1 negative posts',
  telegramSummary: 'Telegram: 2k members, active community'
};

function testScoringEngine() {
  console.log('Testing Research Scoring Engine...\n');
  
  const scoringEngine = new ResearchScoringEngine();
  
  // Test 1: Map data to findings
  console.log('1. Mapping data to findings...');
  const findings = mapDataToFindings(testData);
  console.log('Findings:', JSON.stringify(findings, null, 2));
  
  // Test 2: Calculate research score
  console.log('\n2. Calculating research score...');
  const score = scoringEngine.calculateResearchScore(findings);
  console.log('Score:', JSON.stringify(score, null, 2));
  
  // Test 3: Check if should proceed with analysis
  console.log('\n3. Checking if should proceed with analysis...');
  const { proceed, reason, score: analysisScore } = scoringEngine.shouldProceedWithAnalysis(findings);
  console.log('Proceed:', proceed);
  console.log('Reason:', reason);
  console.log('Analysis Score:', JSON.stringify(analysisScore, null, 2));
  
  // Test 4: Test with minimal data (should fail)
  console.log('\n4. Testing with minimal data...');
  const minimalFindings: ResearchFindings = {
    financial_data: {
      found: true,
      data: { test: 'data' },
      quality: 'low',
      timestamp: new Date(),
      dataPoints: 2
    }
  };
  
  const minimalScore = scoringEngine.calculateResearchScore(minimalFindings);
  const { proceed: minimalProceed, reason: minimalReason } = scoringEngine.shouldProceedWithAnalysis(minimalFindings);
  
  console.log('Minimal Score:', JSON.stringify(minimalScore, null, 2));
  console.log('Minimal Proceed:', minimalProceed);
  console.log('Minimal Reason:', minimalReason);
  
  console.log('\nTest completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testScoringEngine();
}

export { testScoringEngine }; 