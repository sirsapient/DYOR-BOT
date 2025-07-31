const { mapDataToFindings } = require('./dist/research-scoring');
const { generateConfidenceMetrics } = require('./dist/confidence-indicators');

// Test data similar to what the API would receive
const testData = {
  cgData: {
    name: "Axie Infinity",
    market_data: {
      market_cap: { usd: 1000000 },
      circulating_supply: 1000000
    },
    description: { en: "A blockchain-based game" },
    links: {
      homepage: ["https://axieinfinity.com"],
      chat_url: ["https://discord.gg/axie"]
    }
  },
  igdbData: {
    name: "Axie Infinity",
    summary: "A blockchain-based game",
    involved_companies: [
      { company: 123, developer: true, publisher: false }
    ]
  },
  steamData: {
    name: "Axie Infinity",
    steam_appid: 123456,
    review_score_desc: "Very Positive"
  },
  discordData: {
    server_name: "Axie Community",
    approximate_member_count: 5000,
    approximate_presence_count: 1000
  },
  etherscanData: {
    tokenName: "Axie Infinity",
    tokenSymbol: "AXS",
    totalSupply: "10000000"
  },
  securitySummary: "CertiK: Audit completed, score 85",
  twitterSummary: "Twitter: 10k followers, positive sentiment",
  redditSummary: "Reddit: 5 positive, 1 negative posts",
  telegramSummary: "Telegram: 2k members, active community",
  studioAssessment: [
    {
      companyName: "Sky Mavis",
      isDeveloper: true,
      isPublisher: true,
      firstProjectDate: "2018"
    }
  ]
};

console.log('Testing confidence calculation...');
console.log('Input data keys:', Object.keys(testData));

try {
  // Step 1: Map data to findings
  const findings = mapDataToFindings(testData);
  console.log('Findings created:', Object.keys(findings));
  console.log('Findings count:', Object.keys(findings).length);
  
  // Step 2: Create a mock research score
  const score = {
    totalScore: 75,
    grade: 'B',
    confidence: 0.75,
    passesThreshold: true,
    breakdown: {
      dataCoverage: 25,
      sourceReliability: 30,
      recencyFactor: 20
    },
    missingCritical: [],
    recommendations: []
  };
  
  // Step 3: Create a mock research plan
  const researchPlan = {
    projectClassification: {
      type: 'web3_game',
      confidence: 0.8,
      reasoning: 'Based on available data'
    },
    prioritySources: [],
    riskAreas: [],
    searchAliases: ['Axie Infinity', 'AXS'],
    estimatedResearchTime: 30,
    successCriteria: {
      minimumSources: 3,
      criticalDataPoints: [],
      redFlagChecks: []
    }
  };
  
  // Step 4: Generate confidence metrics
  console.log('Generating confidence metrics...');
  const confidenceMetrics = generateConfidenceMetrics(findings, score, researchPlan);
  
  console.log('Confidence metrics generated successfully!');
  console.log('Overall score:', confidenceMetrics.overall.score);
  console.log('Overall grade:', confidenceMetrics.overall.grade);
  console.log('Overall level:', confidenceMetrics.overall.level);
  console.log('Source details count:', confidenceMetrics.sourceDetails.length);
  
} catch (error) {
  console.error('Error in confidence calculation:', error);
  console.error('Stack trace:', error.stack);
} 