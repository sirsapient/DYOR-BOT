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
  };
  teamAnalysis: TeamAnalysis;
  technicalAssessment: TechnicalAssessment;
  communityHealth: CommunityHealth;
  gameData?: GameData;
  researchQuality?: ResearchQuality;
  // Additional data fields
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
  aiSummary?: string;
  sourcesUsed?: string[];
  // Chart data
  confidence?: ConfidenceData;
  totalDataPoints?: number;
}

export interface ConfidenceData {
  overall: {
    score: number;
    grade: string;
    level: string;
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
      averageAge: number;
      oldestSource: string;
    };
  };
  sourceDetails?: ConfidenceSourceDetail[];
  limitations?: string[];
  strengths?: string[];
  userGuidance?: {
    trustLevel: string;
    useCase: string;
    warnings: string[];
    additionalResearch: string[];
  };
}

export interface ConfidenceSourceDetail {
  name: string;
  displayName: string;
  found: boolean;
  quality: string;
  reliability: string;
  dataPoints: number;
  lastUpdated: string;
  confidence: number;
  icon: string;
  description: string;
}

export interface ResearchQuality {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidence: number;
  passesThreshold: boolean;
  breakdown: {
    dataCoverage: number;
    sourceReliability: number;
    recencyFactor: number;
  };
  missingCritical: string[];
  recommendations: string[];
  proceedWithAnalysis: boolean;
  reason?: string;
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

// @ts-ignore
declare module 'steam-search'; 