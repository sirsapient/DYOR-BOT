// Core interfaces for DYOR BOT

export interface ProjectResearch {
  projectName: string;
  projectType: 'Web3Game' | 'TraditionalGame' | 'Publisher' | 'Platform' | 'DeFi' | 'AI' | 'NFT' | 'MemeCoin' | 'Infrastructure' | 'DAO' | 'Unknown';
  keyFindings: {
    positives: string[];
    negatives: string[];
    redFlags: string[];
  };
  financialData: {
    marketCap?: number;
    tokenDistribution?: TokenDistribution;
    fundingInfo?: FundingInfo;
    // DeFi specific data
    defiData?: DeFiData;
    // NFT specific data
    nftData?: NFTData;
    // MemeCoin specific data
    memeCoinData?: MemeCoinData;
  };
  teamAnalysis: TeamAnalysis;
  technicalAssessment: TechnicalAssessment;
  communityHealth: CommunityHealth;
  gameData?: GameData;
  // AI specific data
  aiData?: AIData;
  // Infrastructure specific data
  infrastructureData?: InfrastructureData;
  // DAO specific data
  daoData?: DAOData;
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

// NEW: DeFi specific data interface
export interface DeFiData {
  tvl?: number; // Total Value Locked
  apy?: number; // Annual Percentage Yield
  apr?: number; // Annual Percentage Rate
  liquidityPools?: LiquidityPool[];
  yieldFarming?: YieldFarmingOpportunity[];
  impermanentLossRisk?: string;
  governanceToken?: {
    name: string;
    symbol: string;
    distribution: TokenDistribution;
  };
  smartContractAudits?: AuditInfo[];
  risks?: {
    impermanentLoss: string;
    smartContractRisk: string;
    liquidityRisk: string;
    regulatoryRisk: string;
  };
}

export interface LiquidityPool {
  name: string;
  tokens: string[];
  tvl: number;
  apy: number;
  volume24h: number;
  fees: number;
}

export interface YieldFarmingOpportunity {
  name: string;
  apy: number;
  requirements: string[];
  risks: string[];
  rewards: string[];
}

export interface AuditInfo {
  auditor: string;
  date: string;
  score: string;
  findings: string[];
  status: 'passed' | 'failed' | 'pending';
}

// NEW: NFT specific data interface
export interface NFTData {
  floorPrice?: number;
  totalSupply?: number;
  holders?: number;
  volume24h?: number;
  volume7d?: number;
  rarityDistribution?: RarityInfo;
  royaltyStructure?: {
    percentage: number;
    recipient: string;
  };
  marketplaceIntegration?: string[];
  communityUtility?: string[];
  ipOwnership?: string;
  secondaryMarketVolume?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  traits?: NFTTrait[];
}

export interface RarityInfo {
  totalTraits: number;
  rarityLevels: {
    common: number;
    uncommon: number;
    rare: number;
    legendary: number;
  };
  mostRareTraits: string[];
}

export interface NFTTrait {
  name: string;
  value: string;
  rarity: string;
  percentage: number;
}

// NEW: MemeCoin specific data interface
export interface MemeCoinData {
  communitySentiment?: {
    score: number;
    sources: string[];
    trending: boolean;
  };
  viralPotential?: {
    score: number;
    factors: string[];
    momentum: string;
  };
  celebrityEndorsements?: CelebrityEndorsement[];
  tokenomics?: {
    totalSupply: number;
    circulatingSupply: number;
    burnMechanism: string;
    burnPercentage: number;
    taxStructure: {
      buyTax: number;
      sellTax: number;
    };
  };
  liquidityLocks?: LiquidityLock[];
  developerWalletAnalysis?: {
    walletCount: number;
    totalPercentage: number;
    lockStatus: string;
  };
  socialMediaMomentum?: {
    twitter: SocialMetrics;
    telegram: SocialMetrics;
    reddit: SocialMetrics;
    tiktok: SocialMetrics;
  };
}

export interface CelebrityEndorsement {
  name: string;
  platform: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  verified: boolean;
}

export interface LiquidityLock {
  amount: number;
  lockDuration: string;
  unlockDate: string;
  platform: string;
  verified: boolean;
}

export interface SocialMetrics {
  followers: number;
  engagement: number;
  growthRate: number;
  trending: boolean;
}

// NEW: AI specific data interface
export interface AIData {
  modelPerformance?: {
    accuracy: number;
    benchmarks: BenchmarkResult[];
    useCase: string;
  };
  trainingData?: {
    sources: string[];
    size: string;
    quality: string;
    biasAssessment: string;
  };
  apiPricing?: {
    model: string;
    costPerToken: number;
    costPerRequest: number;
    freeTier: string;
  };
  computeRequirements?: {
    gpuRequirements: string;
    memoryNeeded: string;
    cloudCosts: number;
  };
  teamMLExpertise?: {
    researchers: number;
    engineers: number;
    publications: number;
    experience: string;
  };
  competitiveLandscape?: {
    competitors: string[];
    differentiation: string;
    marketPosition: string;
  };
  ethicalConsiderations?: {
    biasMitigation: string;
    privacyProtection: string;
    transparency: string;
    responsibleAI: string;
  };
}

export interface BenchmarkResult {
  benchmark: string;
  score: number;
  rank: number;
  dataset: string;
}

// NEW: Infrastructure specific data interface
export interface InfrastructureData {
  networkMetrics?: {
    tps: number; // Transactions per second
    blockTime: number;
    activeNodes: number;
    decentralizationScore: number;
  };
  securityFeatures?: {
    consensus: string;
    finality: string;
    attackVectors: string[];
    securityAudits: AuditInfo[];
  };
  scalability?: {
    currentCapacity: number;
    maxCapacity: number;
    scalingSolutions: string[];
    bottlenecks: string[];
  };
  interoperability?: {
    supportedChains: string[];
    bridges: BridgeInfo[];
    crossChainFees: number;
  };
  developerExperience?: {
    documentation: string;
    sdkAvailability: string[];
    communitySupport: string;
    learningCurve: string;
  };
}

export interface BridgeInfo {
  name: string;
  supportedChains: string[];
  tvl: number;
  security: string;
  fees: number;
}

// NEW: DAO specific data interface
export interface DAOData {
  governance?: {
    tokenSymbol: string;
    totalSupply: number;
    circulatingSupply: number;
    votingPower: string;
    quorum: number;
  };
  proposals?: {
    total: number;
    active: number;
    passed: number;
    failed: number;
    participationRate: number;
  };
  treasury?: {
    totalValue: number;
    assets: TreasuryAsset[];
    allocation: string;
  };
  community?: {
    members: number;
    activeVoters: number;
    participationRate: number;
    governanceParticipation: number;
  };
  votingMechanism?: {
    type: string;
    duration: number;
    threshold: number;
    delegation: boolean;
  };
  recentProposals?: Proposal[];
}

export interface TreasuryAsset {
  name: string;
  amount: number;
  value: number;
  percentage: number;
}

export interface Proposal {
  id: string;
  title: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  votesFor: number;
  votesAgainst: number;
  participation: number;
  endDate: string;
}

// @ts-ignore
declare module 'steam-search'; 