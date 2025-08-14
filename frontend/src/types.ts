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
  // NEW: Game Data for download links
  gameData?: GameData;
  // NEW: Enhanced data from AI orchestrator
  discoveredUrls?: { [key: string]: string };
  collectedData?: { [key: string]: any };
  totalDataPoints?: number;
  // PHASE 2: Enhanced AI Summary and Token/NFT Data
  enhancedAISummary?: EnhancedAISummary;
  tokenData?: TokenData[];
  nftData?: NFTData[];
  interactiveSources?: InteractiveSource[];
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
  studioAssessment?: StudioInfo[];
  teamMembers?: TeamMember[];
  linkedinSummary?: string;
  glassdoorSummary?: string;
}

export interface StudioInfo {
  companyName: string;
  isDeveloper?: boolean;
  isPublisher?: boolean;
  firstProjectDate?: string;
  website?: string;
  linkedinUrl?: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  linkedinUrl?: string;
  previousExperience?: string;
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

export interface GameData {
  downloadLinks: GameDownloadLink[];
  found: boolean;
  dataPoints: number;
}

export interface GameDownloadLink {
  platform: 'steam' | 'epic' | 'website' | 'appstore' | 'googleplay' | 'itchio' | 'gog' | 'humble' | 'other';
  url: string;
  title?: string;
  price?: string;
  rating?: number;
  reviews?: number;
}

// ===== PHASE 2 INTERFACES =====

export interface EnhancedAISummary {
  executiveSummary: string;
  projectOverview: string;
  financialAnalysis: string;
  teamAssessment: string;
  technicalEvaluation: string;
  communityHealth: string;
  riskAssessment: string;
  recommendations: string;
}

export interface TokenData {
  name: string;
  symbol: string;
  contractAddress: string;
  network: string;
  totalSupply?: string;
  decimals?: number;
  verificationUrl: string;
  marketCap?: number;
  price?: number;
}

export interface NFTData {
  collectionName: string;
  marketplace: 'opensea' | 'magiceden' | 'other';
  collectionUrl: string;
  floorPrice?: number;
  floorPriceCurrency?: string;
  totalSupply?: number;
  network: 'ethereum' | 'solana' | 'other';
  description?: string;
  imageUrl?: string;
}

export interface InteractiveSource {
  name: string;
  url: string;
  category: 'official' | 'social' | 'financial' | 'technical' | 'community';
  type: string;
  description?: string;
  lastUpdated?: string;
  reliability: 'high' | 'medium' | 'low';
  verified: boolean;
} 