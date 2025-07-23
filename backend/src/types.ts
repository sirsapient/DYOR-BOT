// Core interfaces for DYOR BOT

export interface ProjectResearch {
  projectName: string;
  projectType: 'Web3Game' | 'TraditionalGame' | 'Publisher' | 'Platform';
  riskScore: number;
  investmentGrade: 'A' | 'B' | 'C' | 'D' | 'F';
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
  recommendation: InvestmentRecommendation;
}

// Placeholder types for referenced interfaces
export interface TokenDistribution {
  [key: string]: any;
}
export interface FundingInfo {
  [key: string]: any;
}
export interface TeamAnalysis {
  [key: string]: any;
}
export interface TechnicalAssessment {
  [key: string]: any;
}
export interface CommunityHealth {
  [key: string]: any;
}
export interface InvestmentRecommendation {
  [key: string]: any;
}

declare module 'steam-search'; 