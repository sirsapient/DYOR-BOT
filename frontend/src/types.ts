// Core interfaces for DYOR BOT

export interface ProjectResearch {
  projectName: string;
  projectType: 'Web3Game' | 'TraditionalGame' | 'Publisher' | 'Platform';
  keyFindings: {
    positives: string[];
    negatives: string[];
    redFlags: string[];
  };
  financialData: {
    marketCap?: number;
    tokenDistribution?: TokenDistribution;
    fundingInfo?: FundingInfo;
    roninTokenInfo?: RoninTokenInfo;
    avalancheTokenInfo?: AvalancheTokenInfo;
  };
  teamAnalysis: TeamAnalysis;
  technicalAssessment: TechnicalAssessment;
  communityHealth: CommunityHealth;
  sourcesUsed?: string[];
  aiSummary?: string;
  confidence?: ConfidenceMetrics;
  // Additional data fields from backend
  studioAssessment?: any[];
  linkedinSummary?: string;
  glassdoorSummary?: string;
  securitySummary?: string;
  reviewSummary?: string;
  twitterSummary?: string;
  steamReviewSummary?: string;
  redditSummary?: string;
  githubRepo?: string;
  githubStats?: string;
  discordData?: {
    server_name?: string;
    member_count?: number;
  };
  // NEW: Whitepaper and documentation data
  whitepaper?: {
    found: boolean;
    data?: {
      url?: string;
      tokenomics?: any;
      tokenInfo?: any;
      chainInfo?: any;
    };
    quality?: 'high' | 'medium' | 'low';
    timestamp?: Date;
    dataPoints?: number;
  };
  // NEW: Enhanced data from AI orchestrator
  discoveredUrls?: { [key: string]: string };
  collectedData?: { [key: string]: any };
  totalDataPoints?: number;
}

export interface ConfidenceMetrics {
  overall: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    description: string;
  };
  breakdown: {
    dataCompleteness: {
      score: number;
      found: number;
      total: number;
      missing: string[];
    };
    sourceReliability: {
      score: number;
      official: number;
      verified: number;
      scraped: number;
    };
    dataFreshness: {
      score: number;
      averageAge: number; // days
      oldestSource: string;
    };
  };
  sourceDetails: SourceConfidence[];
  limitations: string[];
  strengths: string[];
  userGuidance: {
    trustLevel: 'high' | 'medium' | 'low';
    useCase: string;
    warnings: string[];
    additionalResearch: string[];
  };
}

export interface SourceConfidence {
  name: string;
  displayName: string;
  found: boolean;
  quality: 'high' | 'medium' | 'low';
  reliability: 'official' | 'verified' | 'scraped';
  dataPoints: number;
  lastUpdated: string; // ISO string format
  confidence: number; // 0-100
  issues?: string[];
  icon: string;
  description: string;
}

// Placeholder types for referenced interfaces
export interface TokenDistribution {
  [key: string]: any;
}
export interface FundingInfo {
  [key: string]: any;
}
export interface TeamAnalysis {
  studioAssessment?: any[];
  linkedinSummary?: string;
  glassdoorSummary?: string;
}
export interface TechnicalAssessment {
  securitySummary?: string;
  reviewSummary?: string;
  githubRepo?: string;
  githubStats?: string;
}
export interface CommunityHealth {
  twitterSummary?: string;
  steamReviewSummary?: string;
  discordData?: {
    server_name?: string;
    member_count?: number;
  };
  redditSummary?: string;
}

export interface RoninTokenInfo {
  totalSupply?: string;
  symbol?: string;
  network?: string;
  contractAddress?: string;
  transactionHistory?: {
    transactionCount?: number;
    recentTransactions?: any[];
    network?: string;
  };
  error?: string;
}

export interface AvalancheTokenInfo {
  totalSupply?: string;
  symbol?: string;
  network?: string;
  contractAddress?: string;
  tokenInfo?: {
    tokenName?: string;
    tokenSymbol?: string;
    totalSupply?: string;
    decimals?: number;
  };
  error?: string;
} 