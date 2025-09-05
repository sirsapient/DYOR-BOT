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
    roninTokenInfo?: RoninTokenInfo;
    avalancheTokenInfo?: AvalancheTokenInfo;
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
  sourcesUsed?: string[];
  aiSummary?: string | {
    projectName?: string;
    projectType?: string;
    keyFindings?: {
      positives: string[];
      negatives: string[];
      redFlags: string[];
    };
    financialData?: any;
    teamAnalysis?: any;
    technicalAssessment?: any;
    communityHealth?: any;
    sourcesUsed?: string[];
    aiSummary?: string; // The actual text content
    whitepaper?: any;
    discoveredUrls?: any;
    collectedData?: any;
    totalDataPoints?: number;
    gameData?: any;
    confidence?: any;
    qualityGates?: any;
  };
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
  // AI specific data
  aiData?: AIData;
  // Infrastructure specific data
  infrastructureData?: InfrastructureData;
  // DAO specific data
  daoData?: DAOData;
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
  volume24h?: number;
  volumeTotal?: number;
  owners?: number;
  listed?: number;
  lifetimeValue?: NFTLifetimeValue;
}

export interface NFTLifetimeValue {
  totalVolume: number;
  totalSales: number;
  averagePrice: number;
  highestSale: number;
  lowestSale: number;
  priceHistory: NFTPricePoint[];
  volumeHistory: NFTVolumePoint[];
}

export interface NFTPricePoint {
  date: string;
  price: number;
  currency: string;
}

export interface NFTVolumePoint {
  date: string;
  volume: number;
  sales: number;
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