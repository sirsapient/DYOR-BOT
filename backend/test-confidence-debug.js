const { generateConfidenceMetrics } = require('./dist/confidence-indicators');

console.log('Starting confidence test...');

// Mock data to test confidence calculation
const mockFindings = {
  financial_data: {
    found: true,
    data: { market_cap: 1000000 },
    quality: 'high',
    timestamp: new Date(),
    dataPoints: 5
  },
  product_data: {
    found: true,
    data: { name: 'Test Game' },
    quality: 'high',
    timestamp: new Date(),
    dataPoints: 3
  },
  community_health: {
    found: true,
    data: { discord_members: 1000 },
    quality: 'medium',
    timestamp: new Date(),
    dataPoints: 2
  }
};

const mockScore = {
  totalScore: 75,
  grade: 'B',
  confidence: 0.75,
  passesThreshold: true,
  breakdown: {
    dataCoverage: 80,
    sourceReliability: 70,
    recencyFactor: 75
  },
  missingCritical: [],
  recommendations: []
};

const mockResearchPlan = {
  projectClassification: {
    type: 'web3_game',
    confidence: 0.8,
    reasoning: 'Test reasoning'
  },
  prioritySources: [],
  riskAreas: [],
  searchAliases: ['test'],
  estimatedResearchTime: 30,
  successCriteria: {
    minimumSources: 3,
    criticalDataPoints: [],
    redFlagChecks: []
  }
};

console.log('Testing confidence calculation...');
console.log('Findings:', Object.keys(mockFindings));
console.log('Score:', mockScore);
console.log('Research Plan:', mockResearchPlan);

try {
  console.log('About to call generateConfidenceMetrics...');
  const result = generateConfidenceMetrics(mockFindings, mockScore, mockResearchPlan);
  console.log('Confidence calculation result:', result);
  console.log('Result type:', typeof result);
  console.log('Result keys:', Object.keys(result));
  console.log('Overall score:', result.overall?.score);
  console.log('Overall grade:', result.overall?.grade);
} catch (error) {
  console.error('Error in confidence calculation:', error);
  console.error('Error stack:', error.stack);
} 