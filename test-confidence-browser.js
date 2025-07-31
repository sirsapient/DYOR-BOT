// Test file to simulate API response with confidence data
const mockApiResponse = {
  projectName: "Axie Infinity",
  projectType: "Web3Game",
  keyFindings: {
    positives: ["Strong community", "Good tokenomics"],
    negatives: ["High volatility"],
    redFlags: []
  },
  financialData: {
    marketCap: 1000000
  },
  teamAnalysis: {
    studioAssessment: "Sky Mavis - experienced team"
  },
  technicalAssessment: {
    securitySummary: "CertiK audit completed"
  },
  communityHealth: {
    discordData: { server_name: "Axie Community" }
  },
  recommendation: {},
  sourcesUsed: ["CoinGecko", "IGDB", "Etherscan"],
  aiSummary: "Axie Infinity is a blockchain-based game...",
  confidence: {
    overall: {
      score: 75,
      grade: 'B',
      level: 'high',
      description: 'Strong data coverage with good source reliability'
    },
    breakdown: {
      dataCompleteness: { score: 75, found: 6, total: 8, missing: ['whitepaper'] },
      sourceReliability: { score: 94, official: 1, verified: 5, scraped: 0 },
      dataFreshness: { score: 100, averageAge: 0, oldestSource: 'Blockchain Data' }
    },
    sourceDetails: [
      {
        name: 'whitepaper',
        displayName: 'Documentation',
        found: false,
        quality: 'low',
        reliability: 'official',
        dataPoints: 0,
        lastUpdated: '2025-07-31T02:07:36.928Z',
        confidence: 0,
        issues: ['No documentation found'],
        icon: '📄',
        description: 'Official project documentation'
      },
      {
        name: 'onchain_data',
        displayName: 'Blockchain Data',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 3,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 96,
        issues: [],
        icon: '⛓️',
        description: 'On-chain metrics and contracts'
      },
      {
        name: 'team_info',
        displayName: 'Team Information',
        found: true,
        quality: 'medium',
        reliability: 'verified',
        dataPoints: 1,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 77,
        issues: ['Limited team background data'],
        icon: '👥',
        description: 'Founder and team backgrounds'
      },
      {
        name: 'community_health',
        displayName: 'Community',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 100,
        issues: [],
        icon: '💬',
        description: 'Discord, Twitter, Telegram activity'
      },
      {
        name: 'financial_data',
        displayName: 'Financial Data',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 100,
        issues: [],
        icon: '💰',
        description: 'Market cap, funding, trading data'
      },
      {
        name: 'product_data',
        displayName: 'Product Metrics',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 100,
        issues: [],
        icon: '🎮',
        description: 'Game stats, user reviews, usage'
      },
      {
        name: 'security_audits',
        displayName: 'Security Audits',
        found: true,
        quality: 'high',
        reliability: 'official',
        dataPoints: 1,
        lastUpdated: '2025-07-31T02:07:36.926Z',
        confidence: 92,
        issues: ['Limited audit details'],
        icon: '🛡️',
        description: 'Smart contract audit reports'
      },
      {
        name: 'media_coverage',
        displayName: 'Media Coverage',
        found: false,
        quality: 'low',
        reliability: 'scraped',
        dataPoints: 0,
        lastUpdated: '2025-07-31T02:07:36.929Z',
        confidence: 0,
        issues: ['No media coverage found'],
        icon: '📰',
        description: 'News articles and press coverage'
      }
    ],
    limitations: [
      'Missing critical data: whitepaper',
      'No official project sources verified'
    ],
    strengths: [
      '5 high-quality data sources',
      '1 official source verified',
      'Fresh data from 6 recent sources'
    ],
    userGuidance: {
      trustLevel: 'medium',
      useCase: 'General research and due diligence',
      warnings: [],
      additionalResearch: []
    }
  }
};

console.log('Mock API Response with Confidence Data:');
console.log('Has confidence field:', 'confidence' in mockApiResponse);
console.log('Confidence structure:');
console.log('- overall:', mockApiResponse.confidence.overall);
console.log('- breakdown:', mockApiResponse.confidence.breakdown);
console.log('- sourceDetails length:', mockApiResponse.confidence.sourceDetails.length);
console.log('- limitations:', mockApiResponse.confidence.limitations);
console.log('- strengths:', mockApiResponse.confidence.strengths);
console.log('- userGuidance:', mockApiResponse.confidence.userGuidance);

// Test the confidence detection logic
const hasConfidence = mockApiResponse.confidence && 
                     typeof mockApiResponse.confidence === 'object' && 
                     mockApiResponse.confidence.overall;

console.log('\nConfidence Detection Test:');
console.log('Has confidence in response:', hasConfidence);
console.log('Overall score:', mockApiResponse.confidence?.overall?.score);
console.log('Overall grade:', mockApiResponse.confidence?.overall?.grade);
console.log('Overall level:', mockApiResponse.confidence?.overall?.level);

// Test source details
console.log('\nSource Details Test:');
const foundSources = mockApiResponse.confidence?.sourceDetails?.filter(s => s.found) || [];
console.log('Found sources count:', foundSources.length);
console.log('Found sources:', foundSources.map(s => s.displayName));

// Test limitations and strengths
console.log('\nLimitations and Strengths:');
console.log('Limitations:', mockApiResponse.confidence?.limitations);
console.log('Strengths:', mockApiResponse.confidence?.strengths);

console.log('\n✅ Mock confidence data is properly structured and ready for frontend testing!'); 