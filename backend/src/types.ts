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