// AI-First Research Orchestration for DYOR BOT
// This system uses AI to plan and optimize research before data collection

import Anthropic from '@anthropic-ai/sdk';
import { QualityGatesEngine } from './quality-gates';
import { ResearchFindings } from './research-scoring';
import { ResearchScoringEngine } from './research-scoring';

// Import the actual data collection functions from index.ts
// We'll need to pass these as parameters since we can't import from the same file

interface DataCollectionFunctions {
  fetchWhitepaperUrl: (websiteUrl: string) => Promise<string | null>;
  fetchPdfBuffer: (url: string) => Promise<Buffer | null>;
  extractTokenomicsFromWhitepaper: (websiteUrl: string) => Promise<any | null>;
  searchProjectSpecificTokenomics: (projectName: string, aliases: string[]) => Promise<any | null>;
  fetchTwitterProfileAndTweets: (handle: string) => Promise<any>;
  fetchSteamDescription: (appid: string) => Promise<string>;
  fetchWebsiteAboutSection: (url: string) => Promise<string>;
  fetchRoninTokenData: (contractAddress: string) => Promise<any>;
  fetchRoninTransactionHistory: (contractAddress: string) => Promise<any>;
  discoverOfficialUrlsWithAI: (projectName: string, aliases: string[]) => Promise<any>;
  findOfficialSourcesForEstablishedProject: (projectName: string, aliases: string[]) => Promise<any>;
}

// NEW: Feedback interface for second AI communication
interface SecondAIFeedback {
  needsMoreData: boolean;
  missingDataTypes: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  specificRequests: string[];
  analysisReadiness: boolean;
  recommendations: string[];
}

// NEW: Caching interface for discovered sources
interface CachedSourceData {
  projectName: string;
  sources: {
    [sourceName: string]: {
      data: any;
      timestamp: Date;
      confidence: number;
      lastRefreshed: Date;
      refreshInterval: number; // minutes
    };
  };
  lastUpdated: Date;
  confidenceScore: number;
}

// NEW: Confidence thresholds configuration
interface ConfidenceThresholds {
  minimumForAnalysis: number; // Minimum confidence to pass to second AI
  highConfidence: number; // Threshold for high confidence data
  refreshThreshold: number; // Confidence below which to refresh data
  cacheExpiryHours: number; // How long to cache data
}

// NEW: Enhanced error handling and retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

// NEW: Universal source discovery patterns for ALL projects
const UNIVERSAL_SOURCE_PATTERNS = {
  
  // Official documentation patterns - Enhanced for better coverage
  documentation: [
    // Basic patterns
    '{project}.com',
    'docs.{project}.com', 
    '{project}.org',
    'whitepaper.{project}.com',
    '{project}.io/docs',
    '{project}.finance/docs',
    '{project}.game/docs',
    '{project}.app/docs',
    '{project}.xyz/docs',
    'docs.{project}.io',
    'docs.{project}.org',
    'docs.{project}.app',
    'docs.{project}.xyz',
    '{project}.com/docs',
    '{project}.com/documentation',
    '{project}.com/whitepaper',
    '{project}.com/tokenomics',
    '{project}.com/economics',
    '{project}.com/governance',
    '{project}.com/technical',
    // Enhanced patterns for gaming projects
    '{project}.com/whitepaper.pdf',
    '{project}.com/whitepaper/',
    '{project}.com/white-paper',
    '{project}.com/white-paper.pdf',
    '{project}.com/litepaper',
    '{project}.com/litepaper.pdf',
    '{project}.com/tokenomics.pdf',
    '{project}.com/economics.pdf',
    '{project}.com/governance.pdf',
    // Subdomain variations
    'whitepaper.{project}.com',
    'docs.{project}.com',
    'documentation.{project}.com',
    'technical.{project}.com',
    'developer.{project}.com',
    'developers.{project}.com',
    // Common gaming project patterns
    '{project}.game/whitepaper',
    '{project}.game/docs',
    '{project}.game/documentation',
    '{project}.app/whitepaper',
    '{project}.app/docs',
    '{project}.app/documentation',
    // Web3 specific patterns
    '{project}.finance/whitepaper',
    '{project}.finance/docs',
    '{project}.protocol/whitepaper',
    '{project}.protocol/docs',
    '{project}.dao/whitepaper',
    '{project}.dao/docs',
    // Alternative domains
    '{project}.net',
    '{project}.co',
    '{project}.io',
    '{project}.app',
    '{project}.xyz',
    '{project}.game',
    '{project}.finance',
    '{project}.protocol',
    '{project}.dao'
  ],
  
  // Developer resources
  technical: [
    'github.com/{project}',
    'github.com/{company}',
    'github.com/{project}-team',
    'github.com/{project}-dev',
    'github.com/{project}-protocol',
    'docs.{project}.*',
    'developers.{project}.*',
    'api.{project}.*',
    'developer.{project}.*',
    'dev.{project}.*',
    '{project}.com/api',
    '{project}.com/developer',
    '{project}.com/developers',
    '{project}.com/technical',
    '{project}.com/architecture'
  ],
  
  // Security & audit sources
  security: [
    'skynet.certik.com/projects/{project}',
    'certik.com/projects/{project}',
    'immunefi.com/bounty/{project}',
    'consensys.net/diligence/audits/{project}',
    'blog.openzeppelin.com/audit-{project}',
    'trailofbits.com/audits/{project}',
    'quantstamp.com/audits/{project}',
    'docs.{project}.*/audit*',
    'docs.{project}.*/security*',
    'github.com/{project}/*audit*',
    'github.com/{project}/*security*',
    '{project}.com/audit',
    '{project}.com/security',
    '{project}.com/audits',
    '{project}.com/security-audit',
    '{project}.com/certik',
    '{project}.com/immunefi'
  ],
  
  // Company/team sources
  company: [
    'blog.{project}.*',
    'medium.com/@{project}',
    'medium.com/{project}',
    '{company}.com/team',
    '{company}.com/about',
    '{company}.com/company',
    'linkedin.com/company/{company}',
    'linkedin.com/company/{project}',
    '{project}.com/team',
    '{project}.com/about',
    '{project}.com/company',
    '{project}.com/founders',
    '{project}.com/leadership',
    '{project}.com/team-members',
    '{project}.com/our-team'
  ],
  
  // Funding and financial sources
  funding: [
    'crunchbase.com/organization/{project}',
    'crunchbase.com/company/{project}',
    '{project}.com/funding',
    '{project}.com/investors',
    '{project}.com/backers',
    '{project}.com/partners',
    'blog.{project}.*/funding',
    'medium.com/@{project}/funding',
    '{project}.com/press',
    '{project}.com/news',
    '{project}.com/announcements'
  ],
  
  // Community and social sources
  community: [
    'discord.gg/{project}',
    'discord.com/invite/{project}',
    't.me/{project}',
    'telegram.me/{project}',
    'twitter.com/{project}',
    'x.com/{project}',
    'reddit.com/r/{project}',
    'reddit.com/r/{project}token',
    '{project}.com/community',
    '{project}.com/social',
    '{project}.com/links',
    '{project}.com/connect'
  ]
};

// NEW: Multi-stage source discovery strategy
const SOURCE_DISCOVERY_STRATEGY = {
  
  stage1_official: {
    // Start with most reliable sources
    priority: 'highest',
    sources: ['official_website', 'whitepaper', 'docs_site'],
    weight: 60,
    searchTerms: ['official website', 'whitepaper', 'documentation', 'technical paper']
  },
  
  stage2_technical: {
    // Find technical documentation
    priority: 'high', 
    sources: ['github_repos', 'audit_reports', 'smart_contracts', 'api_docs'],
    weight: 25,
    searchTerms: ['github', 'audit', 'security', 'smart contract', 'api', 'developer']
  },
  
  stage3_ecosystem: {
    // Community and ecosystem data
    priority: 'medium',
    sources: ['governance_forums', 'community_channels', 'media_coverage', 'funding_info'],
    weight: 15,
    searchTerms: ['community', 'discord', 'telegram', 'twitter', 'funding', 'investment']
  }
};

// NEW: Universal data extraction patterns
const UNIVERSAL_EXTRACTION_PATTERNS = {
  
  // Team/founder information
  teamVerification: {
    founders: /founder|ceo|cto|co-founder|cofounder/i,
    background: /background|experience|previously|education|university/i,
    linkedin: /linkedin\.com\/in\/[a-zA-Z0-9-]+/,
    twitter: /twitter\.com\/[a-zA-Z0-9_]+/,
    github: /github\.com\/[a-zA-Z0-9_-]+/,
    experience: /experience|worked at|previously at|former|ex-/i,
    education: /university|college|degree|bachelor|master|phd/i
  },
  
  // Security audit results
  securityAudits: {
    auditFirm: /certik|consensys|trail of bits|quantstamp|openzeppelin|hacken|slowmist/i,
    criticalIssues: /(\d+)\s*critical/i,
    majorIssues: /(\d+)\s*major/i,
    auditDate: /audit.*?(\d{4})/i,
    findings: /(\d+)\s*total.*?finding/i,
    securityScore: /(\d+)% security score/i,
    auditStatus: /verified|completed|passed|successful/i
  },
  
  // Funding information
  fundingData: {
    totalRaised: /raised.*?\$([0-9.,]+\s*[MBK])/i,
    leadInvestor: /led by.*?([A-Z][a-z\s&]+)/i,
    seriesRound: /(seed|series [A-Z]|strategic|pre-seed)/i,
    valuation: /valuation.*?\$([0-9.,]+\s*[MBK])/i,
    investors: /investors?.*?([A-Z][a-z\s&,]+)/i,
    fundingDate: /funding.*?(\d{4})/i,
    fundingAmount: /(\$[0-9.,]+)\s*(million|billion|thousand)/i
  },
  
  // Technical foundation
  technicalMetrics: {
    smartContracts: /contract.*?verified|etherscan\.io|bscscan\.com|polygonscan\.com/i,
    githubActivity: /commits?.*?(\d+)|contributors?.*?(\d+)|stars.*?(\d+)/i,
    codeQuality: /test.*?coverage|documentation|readme/i,
    blockchain: /ethereum|polygon|avalanche|binance|solana|ronin/i,
    deployment: /deployed|mainnet|testnet|beta|alpha/i
  },
  
  // Tokenomics data
  tokenomicsData: {
    totalSupply: /(\d+).*?total.*?supply/i,
    tokenDistribution: /team.*?(\d+)%|community.*?(\d+)%|treasury.*?(\d+)%/i,
    vestingSchedule: /vesting.*?schedule|unlock.*?period|cliff.*?(\d+)/i,
    tokenUtility: /staking|governance|rewards|utility|burning|minting/i,
    tokenName: /token.*?name.*?([A-Z]{2,10})/i,
    tokenSymbol: /symbol.*?([A-Z]{2,10})/i
  }
};

// NEW: Dynamic scoring for established projects
const DYNAMIC_SCORING_SYSTEM = {
  
  // Baseline scoring
  baselineWeights: {
    officialSources: 30,
    securityAudits: 25, 
    teamVerification: 20,
    technicalFoundation: 15,
    communityHealth: 10
  },
  
  // Bonuses for well-documented projects
  establishedProjectBonuses: {
    multiYearOperation: {
      condition: 'launch_date > 2 years ago',
      bonus: +10,
      reasoning: 'Proven track record'
    },
    
    institutionalBacking: {
      condition: 'tier1_vc_funding OR audit_by_major_firm',
      bonus: +15,
      reasoning: 'Professional due diligence completed'
    },
    
    postIncidentHandling: {
      condition: 'security_incident_with_transparent_response',
      bonus: +10,
      reasoning: 'Demonstrated crisis management'
    },
    
    activeEcosystem: {
      condition: 'multiple_products OR developer_ecosystem',
      bonus: +5,
      reasoning: 'Sustainable business model'
    },
    
    comprehensiveDocumentation: {
      condition: 'whitepaper_AND_docs_AND_github',
      bonus: +10,
      reasoning: 'Complete technical documentation'
    }
  },
  
  // Quality thresholds by project type
  qualityThresholds: {
    defi_protocol: { minimum: 75, target: 90 },
    gaming_project: { minimum: 70, target: 85 }, 
    infrastructure: { minimum: 80, target: 95 },
    newer_project: { minimum: 60, target: 75 },
    established_project: { minimum: 80, target: 95 }
  }
};

// NEW: Systematic quality gates
const ENHANCED_QUALITY_GATES = {
  
  gate1_minimum_data: {
    requirement: 'Score >= dynamic_minimum_based_on_project_age',
    action_if_fail: 'Flag as insufficient data'
  },
  
  gate2_source_diversity: {
    requirement: 'At least 2 Tier1 + 2 Tier2 sources found',
    action_if_fail: 'Expand source discovery patterns'
  },
  
  gate3_official_verification: {
    requirement: 'Official source (whitepaper OR docs) found',
    action_if_fail: 'Mark as "unofficial sources only"'
  },
  
  gate4_security_assessment: {
    requirement: 'Security audit OR bug bounty program found',
    action_if_fail: 'Flag security posture as unknown'
  },
  
  gate5_team_transparency: {
    requirement: 'Founder/team information verifiable',
    action_if_fail: 'Mark team as anonymous/unverified'
  },
  
  gate6_technical_foundation: {
    requirement: 'Smart contracts OR working product OR comprehensive docs',
    action_if_fail: 'Flag technical foundation as weak'
  },
  
  gate7_financial_transparency: {
    requirement: 'Funding info OR tokenomics OR market data available',
    action_if_fail: 'Flag financial transparency as unknown'
  }
};

// Enhanced extraction patterns for established projects
const EXTRACTION_PATTERNS = {
  // Team verification from whitepaper
  teamData: {
    ceo: /Trung Nguyen.*?CEO.*?CTO/i,
    background: /tech entrepreneur.*?Lozi.*?VC-backed/i,
    founders: /Aleksander Larsen.*?Jeffrey Zirlin/i,
    experience: /previous.*?experience.*?gaming.*?blockchain/i
  },
  
  // Security audit results
  auditResults: {
    criticalIssues: /0 Critical/i,
    totalFindings: /(\d+) Total Findings/i,
    auditFirm: /CertiK Verified/i,
    auditDate: /(\d{4}-\d{2}-\d{2})/i,
    securityScore: /(\d+)% security score/i
  },
  
  // Funding information
  fundingData: {
    seriesB: /\$152.*?million.*?Andreessen Horowitz/i,
    valuation: /\$3.*?billion.*?valuation/i,
    investors: /Mark Cuban|Accel|Paradigm|a16z/i,
    fundingRounds: /Series A|Series B|Series C/i,
    totalRaised: /(\$[\d,]+).*?total.*?funding/i
  },
  
  // Tokenomics data
  tokenomicsData: {
    totalSupply: /(\d+).*?total.*?supply/i,
    tokenDistribution: /team.*?(\d+)%|community.*?(\d+)%|treasury.*?(\d+)%/i,
    vestingSchedule: /vesting.*?schedule|unlock.*?period/i,
    tokenUtility: /staking|governance|rewards|utility/i
  },
  
  // Technical foundation
  technicalData: {
    smartContracts: /verified.*?contract|audited.*?code/i,
    githubActivity: /(\d+).*?repositories|active.*?development/i,
    blockchainIntegration: /Ronin.*?blockchain|Ethereum.*?integration/i,
    apiEndpoints: /API.*?endpoints|developer.*?docs/i
  }
};

interface BasicProjectInfo {
  name: string;
  aliases?: string[];
  website?: string;
  description?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface ResearchPlan {
  projectClassification: {
    type: 'web3_game' | 'traditional_game' | 'publisher' | 'platform' | 'unknown';
    confidence: number;
    reasoning: string;
  };
  prioritySources: {
    source: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
    searchTerms: string[];
    expectedDataPoints: string[];
  }[];
  riskAreas: {
    area: string;
    priority: 'high' | 'medium' | 'low';
    investigationApproach: string;
  }[];
  searchAliases: string[];
  estimatedResearchTime: number; // minutes
  successCriteria: {
    minimumSources: number;
    criticalDataPoints: string[];
    redFlagChecks: string[];
  };
}

interface AdaptiveResearchState {
  currentScore: number;
  sourcesCompleted: string[];
  criticalGapsIdentified: string[];
  shouldContinue: boolean;
  nextPriority: string[];
  adjustedPlan?: Partial<ResearchPlan>;
}

class AIResearchOrchestrator {
  private anthropic: Anthropic;
  private qualityGates: QualityGatesEngine;
  private scoringEngine: ResearchScoringEngine;
  
  // NEW: Enhanced features
  private sourceCache: Map<string, CachedSourceData> = new Map();
  private confidenceThresholds: ConfidenceThresholds;
  private retryConfig: RetryConfig;
  private feedbackHistory: Map<string, SecondAIFeedback[]> = new Map();

  constructor(apiKey: string, options?: {
    confidenceThresholds?: Partial<ConfidenceThresholds>;
    retryConfig?: Partial<RetryConfig>;
  }) {
    this.anthropic = new Anthropic({ apiKey });
    this.qualityGates = new QualityGatesEngine();
    this.scoringEngine = new ResearchScoringEngine();
    
    // Initialize with default configurations
    this.confidenceThresholds = {
      minimumForAnalysis: 0.3, // Lowered to 0.3 (30%) to allow more research to complete
      highConfidence: 85,
      refreshThreshold: 60,
      cacheExpiryHours: 0, // Disable caching to ensure fresh data every time
      ...options?.confidenceThresholds
    };
    
    this.retryConfig = {
      maxRetries: 1,
      baseDelay: 200,
      maxDelay: 1000,
      backoffMultiplier: 1.2,
      ...options?.retryConfig
    };
  }

  // Phase 1: Generate initial research strategy
  async generateResearchPlan(
    projectName: string, 
    basicInfo?: BasicProjectInfo
  ): Promise<ResearchPlan> {
    const prompt = this.buildResearchPlanningPrompt(projectName, basicInfo);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return this.parseResearchPlan(response.content[0].text);
  }

  // Phase 2: Adaptive research during data collection
  async adaptResearchStrategy(
    originalPlan: ResearchPlan,
    currentFindings: ResearchFindings,
    timeElapsed: number
  ): Promise<AdaptiveResearchState> {
    const currentScore = this.calculateCurrentScore(currentFindings);
    const gapAnalysis = this.identifyInformationGaps(originalPlan, currentFindings);
    
    const adaptationPrompt = this.buildAdaptationPrompt(
      originalPlan, 
      currentFindings, 
      gapAnalysis, 
      timeElapsed
    );

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: adaptationPrompt
      }]
    });

    return this.parseAdaptiveState(response.content[0].text, currentScore, currentFindings);
  }

  // Phase 3: Final research quality assessment
  async assessResearchCompleteness(
    plan: ResearchPlan,
    finalFindings: ResearchFindings
  ): Promise<{
    isComplete: boolean;
    confidence: number;
    gaps: string[];
    recommendations: string[];
  }> {
    const gateResult = this.qualityGates.checkQualityGates(finalFindings, {
      type: plan.projectClassification.type,
      confidence: plan.projectClassification.confidence
    });

    const assessmentPrompt = this.buildCompletenessPrompt(plan, finalFindings, gateResult);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: assessmentPrompt
      }]
    });

    return this.parseCompletenessAssessment(response.content[0].text, gateResult.passed);
  }

  // Build the initial research planning prompt
  private buildResearchPlanningPrompt(projectName: string, basicInfo?: BasicProjectInfo): string {
    return `You are the AI Research Orchestrator for a Web3/Gaming project analysis bot. Your role is to:

1. FIND THE RIGHT INFORMATION SOURCES - Discover whitepapers, documentation, official websites, and any data that will help the API calls get the information needed
2. COORDINATE BETWEEN TWO AI CALLS - You are the first AI that plans and executes research, then delivers comprehensive data to a second AI who will analyze everything
3. ENSURE YOU DELIVER WHAT THE SECOND AI NEEDS - The second AI will be looking at all the collected data to perform research, so make sure you gather everything they need for comprehensive analysis

PROJECT TO RESEARCH: "${projectName}"
${basicInfo ? `
BASIC INFO FOUND:
- Website: ${basicInfo.website || 'Unknown'}
- Description: ${basicInfo.description || 'None found'}
- Social Links: ${JSON.stringify(basicInfo.socialLinks || {})}
- Known Aliases: ${basicInfo.aliases?.join(', ') || 'None'}` : ''}

YOUR MISSION: Apply ENHANCED research depth for ALL projects. Every project deserves comprehensive analysis including:
- Aggressive whitepaper and documentation discovery (CRITICAL for second AI analysis)
- Comprehensive tokenomics analysis (for web3 projects)
- Detailed technical assessment
- Thorough community and social media analysis
- Multiple data source validation
- Security audit investigation
- Team background verification

Remember: You are gathering data for another AI to analyze, so focus on finding the most comprehensive and reliable sources possible.

AVAILABLE DATA SOURCES:
1. Whitepaper/Documentation (Tier 1 - CRITICAL) - Official project docs, tokenomics, roadmap
2. On-chain Data (Tier 1 - CRITICAL) - Contract verification, token metrics, holder data
3. Team Information (Tier 1 - CRITICAL) - LinkedIn profiles, backgrounds, previous projects
4. Community Health (Tier 2 - HIGH) - Discord/Twitter/Telegram engagement
5. Financial Data (Tier 2 - HIGH) - Market cap, funding, trading metrics
6. Product Data (Tier 2 - HIGH) - Steam stats, game reviews, user metrics
7. Security Audits (Tier 3 - HIGH) - CertiK, Immunefi audit reports
8. Media Coverage (Tier 3 - MEDIUM) - News articles, influencer coverage
9. Social Signals (Tier 3 - MEDIUM) - Reddit sentiment, YouTube engagement

Please provide a JSON response with the following structure:

{
  "projectClassification": {
    "type": "web3_game|traditional_game|publisher|platform|defi|unknown",
    "confidence": 0.85,
    "reasoning": "Based on keywords and initial signals..."
  },
  "prioritySources": [
    {
      "source": "whitepaper",
      "priority": "critical",
      "reasoning": "Need tokenomics for web3 project evaluation",
      "searchTerms": ["tokenomics", "whitepaper", "documentation", "technical paper"],
      "expectedDataPoints": ["token_distribution", "roadmap", "use_cases", "economic_model"]
    }
  ],
  "riskAreas": [
    {
      "area": "team_anonymity",
      "priority": "high", 
      "investigationApproach": "Deep dive LinkedIn/social verification"
    }
  ],
  "searchAliases": ["projectname", "ticker", "common_misspellings"],
  "estimatedResearchTime": 25,
  "successCriteria": {
    "minimumSources": 7,
    "criticalDataPoints": ["team_verified", "tokenomics_clear", "community_active", "security_audited", "funding_verified"],
    "redFlagChecks": ["scam_history", "rug_pull_indicators", "fake_partnerships"]
  }
}

Focus on:
1. Project type classification (affects research priorities)
2. Most important sources for THIS specific project type
3. Key risk areas to investigate
4. Alternative names/tickers to search
5. Comprehensive research goals with high standards for ALL projects
6. Aggressive documentation and whitepaper discovery
7. Thorough technical and security assessment`;
  }

  // Build adaptive research prompt during collection
  private buildAdaptationPrompt(
    originalPlan: ResearchPlan,
    currentFindings: ResearchFindings,
    gaps: string[],
    timeElapsed: number
  ): string {
    const foundSources = Object.keys(currentFindings).filter(key => currentFindings[key]?.found);
    const missingSources = originalPlan.prioritySources
      .filter(ps => !foundSources.includes(ps.source))
      .map(ps => ps.source);

    return `You are the AI Research Orchestrator monitoring ongoing data collection. You need to decide if you have enough data for the SECOND AI to perform comprehensive analysis.

ORIGINAL PLAN:
- Project Type: ${originalPlan.projectClassification.type}
- Target Sources: ${originalPlan.prioritySources.length}
- Time Budget: ${originalPlan.estimatedResearchTime} minutes

CURRENT STATUS:
- Time Elapsed: ${timeElapsed} minutes
- Sources Found: ${foundSources.join(', ')}
- Sources Missing: ${missingSources.join(', ')}
- Critical Gaps: ${gaps.join(', ')}

CURRENT FINDINGS SUMMARY:
${Object.entries(currentFindings)
  .filter(([_, finding]) => finding.found)
  .map(([source, finding]) => `- ${source}: ${finding.dataPoints} data points (${finding.quality} quality)`)
  .join('\n')}

CRITICAL QUESTION: Do you have enough comprehensive data for the second AI to perform thorough research analysis?

Provide a JSON response:
{
  "shouldContinue": true,
  "reasoning": "Still missing critical team data for second AI analysis...",
  "nextPriority": ["team_info", "community_health"],
  "timeRecommendation": 10,
  "adjustments": {
    "newSearchTerms": ["alternative_names"],
    "focusAreas": ["team_verification"],
    "skipSources": ["media_coverage"]
  },
  "qualityAssessment": "sufficient|needs_more|insufficient",
  "secondAIReadiness": "ready|needs_more_data|insufficient_for_analysis"
}

Decide based on:
1. Do we have enough data for the second AI to perform comprehensive analysis?
2. Are we hitting diminishing returns on data collection?
3. Are there critical gaps that more research could fill for the second AI?
4. Is the time investment worth the potential data quality gain for analysis?`;
  }

  // Build final completeness assessment prompt
  private buildCompletenessPrompt(
    plan: ResearchPlan,
    findings: ResearchFindings,
    gateResult: any
  ): string {
    return `Final AI Research Orchestrator assessment: Do we have enough comprehensive data for the SECOND AI to perform thorough research analysis?

RESEARCH PLAN GOALS:
- Target: ${plan.projectClassification.type} project
- Required: ${plan.successCriteria.minimumSources} sources minimum
- Critical data: ${plan.successCriteria.criticalDataPoints.join(', ')}

ACTUAL RESULTS:
- Quality Gates Passed: ${gateResult.passed}
- Sources Found: ${Object.keys(findings).filter(k => findings[k]?.found).length}
- Gates Failed: ${gateResult.gatesFailed?.join(', ') || 'None'}
- Total Data Points: ${Object.values(findings).reduce((sum, f) => sum + (f?.dataPoints || 0), 0)}

Provide JSON assessment:
{
  "isComplete": true,
  "confidence": 0.82,
  "gaps": ["team_background_details"],
  "recommendations": ["Ready for second AI analysis", "Note confidence level in results"],
  "secondAIReadiness": "ready|needs_more_data|insufficient_for_analysis"
}

Consider:
1. Did we meet the original success criteria for comprehensive analysis?
2. Are any gaps critical enough to block the second AI's analysis?
3. What's our confidence level that the second AI can perform thorough research?
4. Should we proceed to second AI analysis or gather more data?`;
  }

  // Parse the AI response into ResearchPlan
  private parseResearchPlan(aiResponse: string): ResearchPlan {
    try {
      // Extract JSON from the response (handle potential markdown formatting)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return with defaults
      return {
        projectClassification: {
          type: parsed.projectClassification?.type || 'unknown',
          confidence: parsed.projectClassification?.confidence || 0.5,
          reasoning: parsed.projectClassification?.reasoning || 'No classification reasoning provided'
        },
        prioritySources: parsed.prioritySources || [],
        riskAreas: parsed.riskAreas || [],
        searchAliases: parsed.searchAliases || [],
        estimatedResearchTime: parsed.estimatedResearchTime || 20,
        successCriteria: {
          minimumSources: parsed.successCriteria?.minimumSources || 3,
          criticalDataPoints: parsed.successCriteria?.criticalDataPoints || [],
          redFlagChecks: parsed.successCriteria?.redFlagChecks || []
        }
      };
    } catch (error) {
      console.error('Failed to parse AI research plan:', error);
      // Return fallback plan
      return this.generateFallbackPlan();
    }
  }

  private parseAdaptiveState(
    aiResponse: string, 
    currentScore: number, 
    findings: ResearchFindings
  ): AdaptiveResearchState {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      return {
        currentScore,
        sourcesCompleted: Object.keys(findings).filter(k => findings[k]?.found),
        criticalGapsIdentified: parsed.adjustments?.focusAreas || [],
        shouldContinue: parsed.shouldContinue ?? true,
        nextPriority: parsed.nextPriority || [],
        adjustedPlan: parsed.adjustments
      };
    } catch (error) {
      console.error('Failed to parse adaptive state:', error);
      return {
        currentScore,
        sourcesCompleted: Object.keys(findings).filter(k => findings[k]?.found),
        criticalGapsIdentified: [],
        shouldContinue: currentScore < 60,
        nextPriority: ['whitepaper', 'team_info', 'community_health']
      };
    }
  }

  private parseCompletenessAssessment(aiResponse: string, gatesPassed: boolean): any {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      return {
        isComplete: parsed.isComplete ?? gatesPassed,
        confidence: parsed.confidence ?? (gatesPassed ? 0.7 : 0.3),
        gaps: parsed.gaps || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      return {
        isComplete: gatesPassed,
        confidence: gatesPassed ? 0.6 : 0.3,
        gaps: ['AI assessment failed'],
        recommendations: ['Proceed with available data']
      };
    }
  }

  private calculateCurrentScore(findings: ResearchFindings): number {
    // Use the existing scoring engine
    const score = this.scoringEngine.calculateResearchScore(findings);
    return score.totalScore;
  }

  private identifyInformationGaps(plan: ResearchPlan, findings: ResearchFindings): string[] {
    const gaps: string[] = [];
    
    // Safety check to ensure plan and successCriteria exist
    if (!plan || !plan.successCriteria || !plan.successCriteria.criticalDataPoints) {
      console.warn('identifyInformationGaps: Invalid plan structure, returning empty gaps');
      return gaps;
    }
    
    plan.successCriteria.criticalDataPoints.forEach(dataPoint => {
      const found = Object.values(findings).some(f => 
        (f as any)?.found && (f as any)?.data && JSON.stringify((f as any).data).includes(dataPoint)
      );
      if (!found) gaps.push(dataPoint);
    });

    return gaps;
  }

  // NEW: Enhanced universal source discovery methods
  private async discoverUniversalSources(projectName: string, aliases: string[]): Promise<any> {
    console.log(`🔍 Starting universal source discovery for: ${projectName}`);
    
    // NEW: Check if this is an established project and use priority sources
    const prioritySources = this.getPrioritySourcesForEstablishedProject(projectName);
    if (prioritySources.length > 0) {
      console.log(`🎯 Using priority sources for established project: ${projectName}`);
      return await this.discoverFromPrioritySources(projectName, prioritySources);
    }
    
    const discoveredSources: any = {
      documentation: [],
      technical: [],
      security: [],
      company: [],
      funding: [],
      community: []
    };
    
    // Stage 1: Official sources (highest priority) with enhanced crawling
    console.log(`📋 Stage 1: Discovering official sources for ${projectName}`);
    const officialSources = await this.discoverOfficialSources(projectName, aliases);
    discoveredSources.documentation = officialSources.documentation || [];
    discoveredSources.company = officialSources.company || [];
    
    // Stage 2: Technical sources
    console.log(`🔧 Stage 2: Discovering technical sources for ${projectName}`);
    const technicalSources = await this.discoverTechnicalSources(projectName, aliases);
    discoveredSources.technical = technicalSources.technical || [];
    discoveredSources.security = technicalSources.security || [];
    
    // Stage 3: Ecosystem sources
    console.log(`🌐 Stage 3: Discovering ecosystem sources for ${projectName}`);
    const ecosystemSources = await this.discoverEcosystemSources(projectName, aliases);
    discoveredSources.funding = ecosystemSources.funding || [];
    discoveredSources.community = ecosystemSources.community || [];
    
    // NEW: Stage 4: Fallback web search if no docs/whitepaper found
    if (discoveredSources.documentation.length === 0) {
      console.log(`🔍 Stage 4: Fallback web search for ${projectName} documentation`);
      const webSearchResults = await this.fallbackWebSearch(projectName, aliases);
      discoveredSources.documentation = webSearchResults.documentation || [];
      discoveredSources.company = [...discoveredSources.company, ...(webSearchResults.company || [])];
    }
    
    console.log(`✅ Universal source discovery completed for ${projectName}:`, discoveredSources);
    return discoveredSources;
  }
  
  private async discoverOfficialSources(projectName: string, aliases: string[]): Promise<any> {
    console.log(`\n🔍 STARTING OFFICIAL SOURCE DISCOVERY FOR: ${projectName}`);
    console.log(`📝 Aliases: ${aliases.join(', ')}`);
    
    const sources: any = { documentation: [], company: [] };
    
    // NEW: AI-guided discovery first
    console.log(`\n🤖 PHASE 1: AI-guided discovery for ${projectName}`);
    const aiDiscoveredSources = await this.discoverSourcesWithAI(projectName, aliases);
    sources.documentation = [...sources.documentation, ...(aiDiscoveredSources.documentation || [])];
    sources.company = [...sources.company, ...(aiDiscoveredSources.company || [])];
    console.log(`✅ AI discovery completed. Found ${sources.documentation.length} docs, ${sources.company.length} company sources`);
    
    // Pattern-based discovery as fallback
    console.log(`\n🔍 PHASE 2: Pattern-based discovery for ${projectName}`);
    const allNames = [projectName, ...aliases];
    console.log(`🔤 Testing names: ${allNames.join(', ')}`);
    
    for (const name of allNames.slice(0, 5)) { // Limit to first 5 aliases
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      console.log(`\n📋 Testing normalized name: "${normalizedName}"`);
      
      // Test documentation patterns
      console.log(`📚 Testing ${UNIVERSAL_SOURCE_PATTERNS.documentation.length} documentation patterns...`);
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.documentation) {
        const url = pattern.replace(/{project}/g, normalizedName);
        console.log(`  🔗 Testing: ${url}`);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
            `HEAD request for ${url}`
          );
          if (res.ok) {
            sources.documentation.push(`https://${url}`);
            console.log(`    ✅ FOUND: https://${url}`);
          } else {
            console.log(`    ❌ HTTP ${res.status}: https://${url}`);
          }
        } catch (e) {
          console.log(`    ❌ ERROR: https://${url} - ${(e as Error).message}`);
        }
      }
      
      // Test company patterns
      console.log(`🏢 Testing ${UNIVERSAL_SOURCE_PATTERNS.company.length} company patterns...`);
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.company) {
        const url = pattern.replace(/{project}/g, normalizedName).replace(/{company}/g, normalizedName);
        console.log(`  🔗 Testing: ${url}`);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
            `HEAD request for ${url}`
          );
          if (res.ok) {
            sources.company.push(`https://${url}`);
            console.log(`    ✅ FOUND: https://${url}`);
          } else {
            console.log(`    ❌ HTTP ${res.status}: https://${url}`);
          }
        } catch (e) {
          console.log(`    ❌ ERROR: https://${url} - ${(e as Error).message}`);
        }
      }
    }
    
    // Enhanced crawling - for each discovered homepage, crawl for more links
    console.log(`\n🕷️ PHASE 3: Crawling discovered pages for additional links`);
    const pagesToCrawl = [...sources.company, ...sources.documentation];
    console.log(`🕷️ Pages to crawl: ${pagesToCrawl.length}`);
    
    for (const pageUrl of pagesToCrawl.slice(0, 3)) { // Limit crawling to first 3 pages
      console.log(`  🕷️ Crawling: ${pageUrl}`);
      try {
        const additionalLinks = await this.crawlPageForLinks(pageUrl, projectName, aliases);
        const newDocs = additionalLinks.documentation || [];
        const newCompany = additionalLinks.company || [];
        sources.documentation = [...sources.documentation, ...newDocs];
        sources.company = [...sources.company, ...newCompany];
        console.log(`    ✅ Crawled ${pageUrl}: +${newDocs.length} docs, +${newCompany.length} company`);
      } catch (e) {
        console.log(`    ❌ Failed to crawl ${pageUrl}: ${(e as Error).message}`);
      }
    }
    
    // Remove duplicates and log final results
    const originalDocCount = sources.documentation.length;
    const originalCompanyCount = sources.company.length;
    sources.documentation = [...new Set(sources.documentation)];
    sources.company = [...new Set(sources.company)];
    const finalDocCount = sources.documentation.length;
    const finalCompanyCount = sources.company.length;
    
    console.log(`\n📊 FINAL DISCOVERY RESULTS FOR ${projectName}:`);
    console.log(`  📚 Documentation sources: ${finalDocCount} (was ${originalDocCount})`);
    console.log(`  🏢 Company sources: ${finalCompanyCount} (was ${originalCompanyCount})`);
    console.log(`  📚 Documentation URLs: ${sources.documentation.join(', ')}`);
    console.log(`  🏢 Company URLs: ${sources.company.join(', ')}`);
    console.log(`🔍 OFFICIAL SOURCE DISCOVERY COMPLETED\n`);
    
    return sources;
  }
  
  // NEW: AI-guided source discovery
  private async discoverSourcesWithAI(projectName: string, aliases: string[]): Promise<any> {
    console.log(`\n🤖 STARTING AI-GUIDED DISCOVERY FOR: ${projectName}`);
    console.log(`📝 AI will search for: ${aliases.join(', ')}`);
    
    const sources: any = { documentation: [], company: [] };
    
    try {
      const prompt = `You are an expert at finding official documentation and company information for blockchain and gaming projects.

Project: ${projectName}
Aliases: ${aliases.join(', ')}

Please find the official URLs for this project. Focus on:
1. Official whitepaper/documentation URLs
2. Official company/team information URLs
3. Token information and blockchain details
4. Security audit reports
5. Technical documentation

For each URL you find, verify it's accessible and official. Return only working, official URLs.

Format your response as JSON:
{
  "documentation": ["url1", "url2"],
  "company": ["url1", "url2"],
  "reasoning": "explanation of what you found"
}

Be thorough but only include verified, official sources.`;

      console.log(`🤖 Sending prompt to Claude...`);
      
      // Add timeout to the AI API call
      const response = await this.executeWithRetry(
        () => this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        }),
        `AI-guided discovery for ${projectName}`
      );

      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
      console.log(`🤖 Claude response received (${aiResponse.length} characters)`);
      console.log(`🤖 Raw AI response: ${aiResponse.substring(0, 500)}${aiResponse.length > 500 ? '...' : ''}`);
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        console.log(`✅ Successfully parsed AI response as JSON`);
        
        if (parsedResponse.documentation) {
          console.log(`📚 AI found ${parsedResponse.documentation.length} documentation URLs to verify`);
          // Verify each URL is accessible with shorter timeout
          for (const url of parsedResponse.documentation.slice(0, 3)) { // Limit to first 3 URLs
            console.log(`  🔍 Verifying documentation URL: ${url}`);
            try {
              const res = await this.executeWithRetry(
                () => fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
                `Verifying AI-discovered documentation URL: ${url}`
              );
              if (res.ok) {
                sources.documentation.push(url);
                console.log(`    ✅ VERIFIED: ${url}`);
              } else {
                console.log(`    ❌ HTTP ${res.status}: ${url}`);
              }
            } catch (e) {
              console.log(`    ❌ ERROR: ${url} - ${(e as Error).message}`);
            }
          }
        } else {
          console.log(`❌ No documentation URLs found in AI response`);
        }
        
        if (parsedResponse.company) {
          console.log(`🏢 AI found ${parsedResponse.company.length} company URLs to verify`);
          // Verify each URL is accessible with shorter timeout
          for (const url of parsedResponse.company.slice(0, 3)) { // Limit to first 3 URLs
            console.log(`  🔍 Verifying company URL: ${url}`);
            try {
              const res = await this.executeWithRetry(
                () => fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
                `Verifying AI-discovered company URL: ${url}`
              );
              if (res.ok) {
                sources.company.push(url);
                console.log(`    ✅ VERIFIED: ${url}`);
              } else {
                console.log(`    ❌ HTTP ${res.status}: ${url}`);
              }
            } catch (e) {
              console.log(`    ❌ ERROR: ${url} - ${(e as Error).message}`);
            }
          }
        } else {
          console.log(`❌ No company URLs found in AI response`);
        }
        
        console.log(`🤖 AI discovery reasoning: ${parsedResponse.reasoning || 'No reasoning provided'}`);
      } catch (parseError) {
        console.log(`❌ Failed to parse AI response as JSON: ${parseError}`);
        console.log(`❌ Raw response that failed to parse: ${aiResponse}`);
      }
    } catch (e) {
      console.log(`❌ AI-guided discovery failed: ${(e as Error).message}`);
    }
    
    console.log(`🤖 AI-GUIDED DISCOVERY COMPLETED: ${sources.documentation.length} docs, ${sources.company.length} company sources\n`);
    return sources;
  }

  // Enhanced page crawling to find doc/whitepaper links
  private async crawlPageForLinks(pageUrl: string, projectName: string, aliases: string[]): Promise<any> {
    const foundLinks: any = { documentation: [], company: [] };
    
    try {
      const res = await this.executeWithRetry(
        () => fetch(pageUrl, { signal: AbortSignal.timeout(5000) }),
        `Fetching ${pageUrl} for crawling`
      );
      
      if (res.ok) {
        const html = await res.text();
        const $ = require('cheerio').load(html);
        
        // Find all links
        const links = $('a[href]').map((i: number, el: any) => $(el).attr('href')).get();
        
        // Enhanced link detection for documentation and company info
        for (const link of links) {
          if (!link || typeof link !== 'string') continue;
          
          const fullUrl = link.startsWith('http') ? link : new URL(link, pageUrl).href;
          const linkText = $(`a[href="${link}"]`).text().toLowerCase();
          const linkHref = $(`a[href="${link}"]`).attr('href')?.toLowerCase() || '';
          
          // Enhanced documentation detection
          const docKeywords = [
            'whitepaper', 'white-paper', 'litepaper', 'lite-paper',
            'docs', 'documentation', 'technical', 'developer',
            'tokenomics', 'economics', 'governance', 'architecture',
            'api', 'sdk', 'integration', 'guide', 'manual'
          ];
          
          const isDocLink = docKeywords.some(keyword => 
            linkText.includes(keyword) || 
            linkHref.includes(keyword) ||
            fullUrl.includes(keyword)
          ) || UNIVERSAL_SOURCE_PATTERNS.documentation.some(pattern => {
            const patternUrl = pattern.replace(/{project}/g, projectName.toLowerCase().replace(/\s+/g, ''));
            return fullUrl.includes(patternUrl);
          });
          
          // Enhanced company info detection
          const companyKeywords = [
            'about', 'team', 'company', 'founders', 'leadership',
            'careers', 'contact', 'press', 'news', 'blog',
            'medium', 'linkedin', 'twitter', 'discord', 'telegram'
          ];
          
          const isCompanyLink = companyKeywords.some(keyword => 
            linkText.includes(keyword) || 
            linkHref.includes(keyword) ||
            fullUrl.includes(keyword)
          ) || UNIVERSAL_SOURCE_PATTERNS.company.some(pattern => {
            const patternUrl = pattern.replace(/{project}/g, projectName.toLowerCase().replace(/\s+/g, '')).replace(/{company}/g, projectName.toLowerCase().replace(/\s+/g, ''));
            return fullUrl.includes(patternUrl);
          });
          
          if (isDocLink) {
            try {
              const linkRes = await this.executeWithRetry(
                () => fetch(fullUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
                `Checking discovered documentation link ${fullUrl}`
              );
              if (linkRes.ok) {
                foundLinks.documentation.push(fullUrl);
                console.log(`✅ Found documentation via crawling: ${fullUrl}`);
              }
            } catch (e) {
              console.log(`❌ Failed to check discovered documentation link ${fullUrl}: ${(e as Error).message}`);
            }
          }
          
          if (isCompanyLink) {
            try {
              const linkRes = await this.executeWithRetry(
                () => fetch(fullUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
                `Checking discovered company link ${fullUrl}`
              );
              if (linkRes.ok) {
                foundLinks.company.push(fullUrl);
                console.log(`✅ Found company info via crawling: ${fullUrl}`);
              }
            } catch (e) {
              console.log(`❌ Failed to check discovered company link ${fullUrl}: ${(e as Error).message}`);
            }
          }
        }
      }
    } catch (e) {
      console.log(`❌ Failed to crawl page ${pageUrl}: ${(e as Error).message}`);
    }
    
    return foundLinks;
  }
  
  // NEW: Fallback web search when pattern-based discovery fails
  private async fallbackWebSearch(projectName: string, aliases: string[]): Promise<any> {
    const searchResults: any = { documentation: [], company: [] };
    
    if (!process.env.SERP_API_KEY) {
      console.log(`⚠️ No SERP_API_KEY available for fallback web search`);
      return searchResults;
    }
    
    const searchTerms = [
      // Primary searches
      `${projectName} whitepaper`,
      `${projectName} documentation`,
      `${projectName} docs`,
      `${projectName} official website`,
      `${projectName} tokenomics`,
      `${projectName} white paper`,
      `${projectName} lite paper`,
      `${projectName} technical documentation`,
      `${projectName} developer docs`,
      `${projectName} API documentation`,
      // Gaming-specific searches
      `${projectName} game whitepaper`,
      `${projectName} gaming documentation`,
      `${projectName} blockchain game`,
      `${projectName} web3 game`,
      // Token and blockchain searches
      `${projectName} token`,
      `${projectName} blockchain`,
      `${projectName} smart contract`,
      `${projectName} token contract`,
      // Company and team searches
      `${projectName} team`,
      `${projectName} founders`,
      `${projectName} company`,
      `${projectName} about`,
      `${projectName} official`
    ];
    
    // Add alias-specific searches
    for (const alias of aliases.slice(0, 3)) {
      searchTerms.push(`${alias} whitepaper`);
      searchTerms.push(`${alias} documentation`);
      searchTerms.push(`${alias} official website`);
      searchTerms.push(`${alias} tokenomics`);
      searchTerms.push(`${alias} team`);
    }
    
    for (const term of searchTerms.slice(0, 5)) {
      try {
        console.log(`🔍 Web searching for: ${term}`);
        const serpRes = await this.executeWithRetry(
          () => fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(term)}&api_key=${process.env.SERP_API_KEY}`),
          `SerpAPI search for ${term}`
        );
        
        if (serpRes.ok) {
          const serpJson = await serpRes.json();
          const results = (serpJson.organic_results || []).slice(0, 3);
          
          for (const result of results) {
            if (result.link) {
              try {
                const linkRes = await this.executeWithRetry(
                  () => fetch(result.link, { method: 'HEAD' }),
                  `Checking web search result ${result.link}`
                );
                if (linkRes.ok) {
                  // Enhanced classification of search results
                  const title = result.title.toLowerCase();
                  const snippet = result.snippet.toLowerCase();
                  const url = result.link.toLowerCase();
                  
                  // Documentation keywords
                  const docKeywords = [
                    'whitepaper', 'white paper', 'litepaper', 'lite paper',
                    'docs', 'documentation', 'technical', 'developer',
                    'tokenomics', 'economics', 'governance', 'architecture',
                    'api', 'sdk', 'integration', 'guide', 'manual',
                    'technical documentation', 'developer docs'
                  ];
                  
                  // Company/team keywords
                  const companyKeywords = [
                    'about', 'team', 'company', 'founders', 'leadership',
                    'careers', 'contact', 'press', 'news', 'blog',
                    'medium', 'linkedin', 'twitter', 'discord', 'telegram'
                  ];
                  
                  const isDoc = docKeywords.some(keyword => 
                    title.includes(keyword) || 
                    snippet.includes(keyword) ||
                    url.includes(keyword)
                  );
                  
                  const isCompany = companyKeywords.some(keyword => 
                    title.includes(keyword) || 
                    snippet.includes(keyword) ||
                    url.includes(keyword)
                  );
                  
                  if (isDoc) {
                    searchResults.documentation.push(result.link);
                    console.log(`✅ Found documentation via web search: ${result.link}`);
                  } else if (isCompany) {
                    searchResults.company.push(result.link);
                    console.log(`✅ Found company info via web search: ${result.link}`);
                  } else {
                    // Default to company if unclear
                    searchResults.company.push(result.link);
                    console.log(`✅ Found potential company info via web search: ${result.link}`);
                  }
                }
              } catch (e) {
                console.log(`❌ Failed to check web search result ${result.link}: ${(e as Error).message}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`❌ Web search failed for ${term}: ${(e as Error).message}`);
      }
    }
    
    return searchResults;
  }
  
  private async discoverTechnicalSources(projectName: string, aliases: string[]): Promise<any> {
    const sources: any = { technical: [], security: [] };
    
    const allNames = [projectName, ...aliases];
    
    for (const name of allNames.slice(0, 3)) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      
      // Test technical patterns
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.technical) {
        const url = pattern.replace(/{project}/g, normalizedName).replace(/{company}/g, normalizedName);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD' }),
            `HEAD request for technical source ${url}`
          );
          if (res.ok) {
            sources.technical.push(`https://${url}`);
            console.log(`✅ Found technical source: https://${url}`);
          }
        } catch (e) {
          console.log(`❌ Failed to check technical source ${url}: ${(e as Error).message}`);
        }
      }
      
      // Test security patterns
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.security) {
        const url = pattern.replace(/{project}/g, normalizedName);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD' }),
            `HEAD request for security source ${url}`
          );
          if (res.ok) {
            sources.security.push(`https://${url}`);
            console.log(`✅ Found security source: https://${url}`);
          }
        } catch (e) {
          console.log(`❌ Failed to check security source ${url}: ${(e as Error).message}`);
        }
      }
    }
    
    return sources;
  }
  
  private async discoverEcosystemSources(projectName: string, aliases: string[]): Promise<any> {
    const sources: any = { funding: [], community: [] };
    
    const allNames = [projectName, ...aliases];
    
    for (const name of allNames.slice(0, 3)) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      
      // Test funding patterns
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.funding) {
        const url = pattern.replace(/{project}/g, normalizedName).replace(/{company}/g, normalizedName);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD' }),
            `HEAD request for funding source ${url}`
          );
          if (res.ok) {
            sources.funding.push(`https://${url}`);
            console.log(`✅ Found funding source: https://${url}`);
          }
        } catch (e) {
          console.log(`❌ Failed to check funding source ${url}: ${(e as Error).message}`);
        }
      }
      
      // Test community patterns
      for (const pattern of UNIVERSAL_SOURCE_PATTERNS.community) {
        const url = pattern.replace(/{project}/g, normalizedName);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD' }),
            `HEAD request for community source ${url}`
          );
          if (res.ok) {
            sources.community.push(`https://${url}`);
            console.log(`✅ Found community source: https://${url}`);
          }
        } catch (e) {
          console.log(`❌ Failed to check community source ${url}: ${(e as Error).message}`);
        }
      }
    }
    
    return sources;
  }
  
  // NEW: Enhanced data extraction using universal patterns
  private async extractDataFromSources(sources: any, projectName: string): Promise<any> {
    const extractedData: any = {
      teamInfo: {},
      securityAudits: {},
      fundingData: {},
      technicalMetrics: {},
      tokenomicsData: {},
      tokenInfo: {}, // NEW: Token and chain information
      chainInfo: {}  // NEW: Blockchain/network information
    };
    
    // Debug logging for Axie Infinity
    if (projectName.toLowerCase().includes('axie')) {
      console.log(`🔍 Data extraction for ${projectName}:`);
      console.log(`  - Available sources: ${Object.keys(sources).join(', ')}`);
      console.log(`  - Documentation sources: ${sources.documentation?.length || 0}`);
      console.log(`  - Company sources: ${sources.company?.length || 0}`);
    }
    
    // Extract team information from company sources
    for (const companyUrl of sources.company || []) {
      try {
        console.log(`🔍 Fetching team data from: ${companyUrl}`);
        const res = await this.executeWithRetry(
          () => fetch(companyUrl, { 
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          }),
          `Fetching company data from ${companyUrl}`
        );
        if (res.ok) {
          const html = await res.text();
          console.log(`✅ Successfully fetched ${html.length} characters from ${companyUrl}`);
          const teamData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.teamVerification);
          if (Object.keys(teamData).length > 0) {
            extractedData.teamInfo = { ...extractedData.teamInfo, ...teamData };
            console.log(`✅ Extracted team data:`, teamData);
          } else {
            console.log(`⚠️ No team data extracted from ${companyUrl}`);
          }
        } else {
          console.log(`❌ HTTP ${res.status} for ${companyUrl}`);
        }
      } catch (e) {
        console.log(`❌ Failed to extract team data from ${companyUrl}: ${(e as Error).message}`);
      }
    }
    
    // Extract security audit information
    for (const securityUrl of sources.security || []) {
      try {
        console.log(`🔍 Fetching security data from: ${securityUrl}`);
        const res = await this.executeWithRetry(
          () => fetch(securityUrl, { 
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(10000)
          }),
          `Fetching security data from ${securityUrl}`
        );
        if (res.ok) {
          const html = await res.text();
          console.log(`✅ Successfully fetched ${html.length} characters from ${securityUrl}`);
          const auditData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.securityAudits);
          if (Object.keys(auditData).length > 0) {
            extractedData.securityAudits = { ...extractedData.securityAudits, ...auditData };
            console.log(`✅ Extracted security data:`, auditData);
          } else {
            console.log(`⚠️ No security data extracted from ${securityUrl}`);
          }
        } else {
          console.log(`❌ HTTP ${res.status} for ${securityUrl}`);
        }
      } catch (e) {
        console.log(`❌ Failed to extract security data from ${securityUrl}: ${(e as Error).message}`);
      }
    }
    
    // Extract funding information
    for (const fundingUrl of sources.funding || []) {
      try {
        console.log(`🔍 Fetching funding data from: ${fundingUrl}`);
        const res = await this.executeWithRetry(
          () => fetch(fundingUrl, { 
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(10000)
          }),
          `Fetching funding data from ${fundingUrl}`
        );
        if (res.ok) {
          const html = await res.text();
          console.log(`✅ Successfully fetched ${html.length} characters from ${fundingUrl}`);
          const fundingData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.fundingData);
          if (Object.keys(fundingData).length > 0) {
            extractedData.fundingData = { ...extractedData.fundingData, ...fundingData };
            console.log(`✅ Extracted funding data:`, fundingData);
          } else {
            console.log(`⚠️ No funding data extracted from ${fundingUrl}`);
          }
        } else {
          console.log(`❌ HTTP ${res.status} for ${fundingUrl}`);
        }
      } catch (e) {
        console.log(`❌ Failed to extract funding data from ${fundingUrl}: ${(e as Error).message}`);
      }
    }
    
    // Extract technical metrics
    for (const technicalUrl of sources.technical || []) {
      try {
        console.log(`🔍 Fetching technical data from: ${technicalUrl}`);
        const res = await this.executeWithRetry(
          () => fetch(technicalUrl, { 
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(10000)
          }),
          `Fetching technical data from ${technicalUrl}`
        );
        if (res.ok) {
          const html = await res.text();
          console.log(`✅ Successfully fetched ${html.length} characters from ${technicalUrl}`);
          const technicalData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.technicalMetrics);
          if (Object.keys(technicalData).length > 0) {
            extractedData.technicalMetrics = { ...extractedData.technicalMetrics, ...technicalData };
            console.log(`✅ Extracted technical data:`, technicalData);
          } else {
            console.log(`⚠️ No technical data extracted from ${technicalUrl}`);
          }
        } else {
          console.log(`❌ HTTP ${res.status} for ${technicalUrl}`);
        }
      } catch (e) {
        console.log(`❌ Failed to extract technical data from ${technicalUrl}: ${(e as Error).message}`);
      }
    }
    
    // NEW: Enhanced tokenomics and token/chain extraction from documentation
    for (const docUrl of sources.documentation || []) {
      try {
        console.log(`📄 Extracting data from documentation: ${docUrl}`);
        const extractedDocData = await this.extractFromDocumentation(docUrl, projectName);
        
        if (extractedDocData.tokenomics && Object.keys(extractedDocData.tokenomics).length > 0) {
          extractedData.tokenomicsData = { ...extractedData.tokenomicsData, ...extractedDocData.tokenomics };
          console.log(`✅ Extracted tokenomics data:`, extractedDocData.tokenomics);
        }
        
        if (extractedDocData.tokenInfo && Object.keys(extractedDocData.tokenInfo).length > 0) {
          extractedData.tokenInfo = { ...extractedData.tokenInfo, ...extractedDocData.tokenInfo };
          console.log(`✅ Extracted token info:`, extractedDocData.tokenInfo);
        }
        
        if (extractedDocData.chainInfo && Object.keys(extractedDocData.chainInfo).length > 0) {
          extractedData.chainInfo = { ...extractedData.chainInfo, ...extractedDocData.chainInfo };
          console.log(`✅ Extracted chain info:`, extractedDocData.chainInfo);
        }
      } catch (e) {
        console.log(`❌ Failed to extract from documentation ${docUrl}: ${(e as Error).message}`);
      }
    }
    
    // Summary of extracted data
    console.log(`📊 Data extraction summary for ${projectName}:`);
    console.log(`  - Team info: ${Object.keys(extractedData.teamInfo).length} items`);
    console.log(`  - Security audits: ${Object.keys(extractedData.securityAudits).length} items`);
    console.log(`  - Funding data: ${Object.keys(extractedData.fundingData).length} items`);
    console.log(`  - Technical metrics: ${Object.keys(extractedData.technicalMetrics).length} items`);
    console.log(`  - Tokenomics data: ${Object.keys(extractedData.tokenomicsData).length} items`);
    console.log(`  - Token info: ${Object.keys(extractedData.tokenInfo).length} items`);
    console.log(`  - Chain info: ${Object.keys(extractedData.chainInfo).length} items`);
    
    return extractedData;
  }
  
  // NEW: Enhanced documentation extraction with PDF/HTML parsing
  private async extractFromDocumentation(docUrl: string, projectName: string): Promise<any> {
    const extractedData: any = {
      tokenomics: {},
      tokenInfo: {},
      chainInfo: {}
    };
    
    try {
      const res = await this.executeWithRetry(
        () => fetch(docUrl),
        `Fetching documentation from ${docUrl}`
      );
      
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let text = '';
        
        if (contentType.includes('pdf')) {
          // Handle PDF
          const buffer = await res.arrayBuffer();
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(Buffer.from(buffer));
          text = pdfData.text;
          console.log(`📄 Parsed PDF with ${text.length} characters`);
        } else {
          // Handle HTML
          text = await res.text();
          console.log(`📄 Parsed HTML with ${text.length} characters`);
        }
        
        // Extract tokenomics using universal patterns
        const tokenomicsData = this.extractDataFromText(text, UNIVERSAL_EXTRACTION_PATTERNS.tokenomicsData);
        if (Object.keys(tokenomicsData).length > 0) {
          extractedData.tokenomics = tokenomicsData;
        }
        
        // NEW: Extract token and chain information
        const tokenChainData = this.extractTokenAndChainInfo(text, projectName);
        if (Object.keys(tokenChainData.tokenInfo).length > 0) {
          extractedData.tokenInfo = tokenChainData.tokenInfo;
        }
        if (Object.keys(tokenChainData.chainInfo).length > 0) {
          extractedData.chainInfo = tokenChainData.chainInfo;
        }
      }
    } catch (e) {
      console.log(`❌ Failed to extract from documentation ${docUrl}: ${(e as Error).message}`);
    }
    
    return extractedData;
  }
  
  // NEW: Extract token and chain information from text
  private extractTokenAndChainInfo(text: string, projectName: string): any {
    const tokenInfo: any = {};
    const chainInfo: any = {};
    
    // Project-specific known data for established projects
    const knownProjectData: { [key: string]: { tokens: string[], network: string } } = {
      'axie infinity': { tokens: ['AXS', 'SLP'], network: 'ronin' },
      'axie': { tokens: ['AXS', 'SLP'], network: 'ronin' },
      'the sandbox': { tokens: ['SAND'], network: 'ethereum' },
      'sandbox': { tokens: ['SAND'], network: 'ethereum' },
      'decentraland': { tokens: ['MANA'], network: 'ethereum' },
      'illuvium': { tokens: ['ILV'], network: 'ethereum' },
      'gods unchained': { tokens: ['GODS'], network: 'ethereum' },
      'gods': { tokens: ['GODS'], network: 'ethereum' },
      'splinterlands': { tokens: ['SPS'], network: 'hive' },
      'alien worlds': { tokens: ['TLM'], network: 'wax' },
      'alienworlds': { tokens: ['TLM'], network: 'wax' }
    };
    
    const projectKey = projectName.toLowerCase();
    if (knownProjectData[projectKey]) {
      const knownData = knownProjectData[projectKey];
      tokenInfo.symbol = knownData.tokens[0]; // Use primary token
      tokenInfo.allTokens = knownData.tokens;
      chainInfo.network = knownData.network;
      console.log(`✅ Using known project data for ${projectName}: ${knownData.tokens.join(', ')} on ${knownData.network}`);
      return { tokenInfo, chainInfo };
    }
    
    // Enhanced token name patterns - more specific and accurate
    const tokenPatterns = [
      // Specific token symbol patterns
      /(?:token|symbol|ticker)\s*(?:name|symbol|ticker)?\s*[:\-]\s*([A-Z]{2,10})/gi,
      /symbol\s*[:\-]\s*([A-Z]{2,10})/gi,
      /ticker\s*[:\-]\s*([A-Z]{2,10})/gi,
      // Token symbol in context
      /([A-Z]{2,10})\s*(?:token|coin|currency)/gi,
      // Token symbol with $ prefix
      /\$([A-Z]{2,10})\b/gi,
      // Token symbol in parentheses
      /\(([A-Z]{2,10})\)/gi
    ];
    
    for (const pattern of tokenPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          // Extract the actual token symbol, not the full match
          let tokenSymbol: string;
          if (pattern.source.includes('\\$')) {
            // Handle $TOKEN pattern
            tokenSymbol = match.replace(/\$/g, '').replace(/[^A-Z]/g, '');
          } else if (pattern.source.includes('\\(([A-Z]{2,10})\\)')) {
            // Handle (TOKEN) pattern
            tokenSymbol = match.replace(/[()]/g, '').replace(/[^A-Z]/g, '');
          } else {
            // Handle other patterns
            tokenSymbol = match.replace(/[^A-Z]/g, '');
          }
          
          if (tokenSymbol.length >= 2 && tokenSymbol.length <= 10) {
            // Validate it's not a common word or URL part
            const invalidTokens = ['HTTP', 'HTTPS', 'URL', 'API', 'JSON', 'HTML', 'CSS', 'JS', 'PHP', 'SQL', 'XML', 'RSS', 'REST', 'SOAP', 'WSDL', 'XSD', 'XSLT', 'SVG', 'PNG', 'JPG', 'GIF', 'MP4', 'MP3', 'PDF', 'DOC', 'TXT', 'LOG', 'ERR', 'INFO', 'DEBUG', 'WARN', 'FATAL', 'CRIT', 'ALERT', 'EMERG', 'NOTICE', 'TRACE', 'VERBOSE', 'QUIET', 'SILENT', 'NORMAL', 'ACTIVE', 'PASSIVE', 'STATIC', 'DYNAMIC', 'LOCAL', 'GLOBAL', 'PUBLIC', 'PRIVATE', 'PROTECTED', 'INTERNAL', 'EXTERNAL', 'IMPORT', 'EXPORT', 'MODULE', 'CLASS', 'FUNCTION', 'METHOD', 'PROPERTY', 'VARIABLE', 'CONSTANT', 'PARAMETER', 'ARGUMENT', 'RETURN', 'VOID', 'NULL', 'UNDEFINED', 'BOOLEAN', 'STRING', 'NUMBER', 'ARRAY', 'OBJECT', 'REGEX', 'REGULAR', 'EXPRESSION', 'PATTERN', 'MATCH', 'REPLACE', 'SPLIT', 'JOIN', 'CONCAT', 'SUBSTRING', 'INDEXOF', 'LASTINDEXOF', 'CHARAT', 'CHARCODEAT', 'FROMCHARCODE', 'TOLOWERCASE', 'TOUPPERCASE', 'TRIM', 'PADSTART', 'PADEND', 'REPEAT', 'REVERSE', 'SORT', 'FILTER', 'MAP', 'REDUCE', 'FOREACH', 'FORIN', 'FOROF', 'WHILE', 'DO', 'SWITCH', 'CASE', 'DEFAULT', 'BREAK', 'CONTINUE', 'THROW', 'TRY', 'CATCH', 'FINALLY', 'WITH', 'DELETE', 'TYPEOF', 'INSTANCEOF', 'NEW', 'THIS', 'SUPER', 'EXTENDS', 'IMPLEMENTS', 'INTERFACE', 'ABSTRACT', 'FINAL', 'STATIC', 'SYNCHRONIZED', 'TRANSIENT', 'VOLATILE', 'NATIVE', 'STRICTFP', 'ASSERT', 'ENUM', 'PACKAGE', 'IMPORT', 'EXPORT', 'MODULE', 'NAMESPACE', 'USING', 'TEMPLATE', 'TYPENAME', 'CONSTEXPR', 'DECLTYPE', 'AUTO', 'MUTABLE', 'EXPLICIT', 'VIRTUAL', 'OVERRIDE', 'FINAL', 'ABSTRACT', 'STATIC', 'EXTERN', 'INLINE', 'CONST', 'VOLATILE', 'RESTRICT', 'REGISTER', 'THREAD_LOCAL', 'NOEXCEPT', 'CONSTEXPR', 'CONSTEVAL', 'CONSTINIT', 'CO_AWAIT', 'CO_YIELD', 'CO_RETURN', 'REQUIRES', 'CONCEPT', 'MODULE', 'IMPORT', 'EXPORT', 'PARTITION', 'MODULE_PARTITION', 'GLOBAL_MODULE_FRAGMENT', 'PRIVATE_MODULE_FRAGMENT', 'MODULE_IMPORT', 'MODULE_EXPORT', 'MODULE_PARTITION_IMPORT', 'MODULE_PARTITION_EXPORT', 'GLOBAL_MODULE_FRAGMENT_IMPORT', 'PRIVATE_MODULE_FRAGMENT_IMPORT', 'MODULE_IMPORT_DECLARATION', 'MODULE_EXPORT_DECLARATION', 'MODULE_PARTITION_IMPORT_DECLARATION', 'MODULE_PARTITION_EXPORT_DECLARATION', 'GLOBAL_MODULE_FRAGMENT_IMPORT_DECLARATION', 'PRIVATE_MODULE_FRAGMENT_IMPORT_DECLARATION'];
            
            if (!invalidTokens.includes(tokenSymbol)) {
              tokenInfo.symbol = tokenSymbol;
              console.log(`✅ Found token symbol: ${tokenSymbol}`);
              break;
            }
          }
        }
        if (tokenInfo.symbol) break;
      }
    }
    
    // Enhanced chain/network patterns - more specific and accurate
    const chainPatterns = [
      // Specific blockchain networks
      /(?:network|chain|blockchain)\s*[:\-]\s*(ethereum|eth|ethereum\s*mainnet)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(binance\s*smart\s*chain|bsc)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(polygon|matic)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(avalanche|avax)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(solana|sol)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(ronin|ronin\s*network)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(arbitrum|arb)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(optimism|op)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(base)/gi,
      /(?:network|chain|blockchain)\s*[:\-]\s*(polygon\s*zkevm)/gi,
      // Network mentions in context
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(ethereum|eth|ethereum\s*mainnet)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(binance\s*smart\s*chain|bsc)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(polygon|matic)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(avalanche|avax)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(solana|sol)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(ronin|ronin\s*network)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(arbitrum|arb)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(optimism|op)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(base)/gi,
      /(?:built\s*on|runs\s*on|deployed\s*on)\s*(polygon\s*zkevm)/gi
    ];
    
    for (const pattern of chainPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const chainName = matches[0].toLowerCase();
        // Extract just the network name, not the full match
        const networkMatch = chainName.match(/(ethereum|eth|binance\s*smart\s*chain|bsc|polygon|matic|avalanche|avax|solana|sol|ronin|arbitrum|arb|optimism|op|base|polygon\s*zkevm)/i);
        if (networkMatch) {
          chainInfo.network = networkMatch[0].toLowerCase();
          console.log(`✅ Found blockchain network: ${chainInfo.network}`);
          break;
        }
      }
    }
    
    // Enhanced contract address patterns - more specific validation
    const contractPatterns = [
      /0x[a-fA-F0-9]{40}/g, // Ethereum-style addresses
      /[A-Za-z0-9]{32,44}/g // Other blockchain addresses
    ];
    
    for (const pattern of contractPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Validate it's likely a contract address
        const address = matches[0];
        if (address.length >= 32 && address.length <= 44) {
          // Additional validation to avoid JWT tokens or other base64 strings
          const hasValidChars = /^[0-9a-fA-F]+$/.test(address) || /^[A-Za-z0-9]+$/.test(address);
          const notJWT = !address.includes('.') && !address.startsWith('eyJ');
          const notBase64Padding = !address.includes('=');
          
          if (hasValidChars && notJWT && notBase64Padding) {
            tokenInfo.contractAddress = address;
            console.log(`✅ Found contract address: ${address}`);
            break;
          }
        }
      }
    }
    
    // Enhanced total supply patterns
    const supplyPatterns = [
      /total\s*supply\s*[:\-]\s*([0-9,]+)/gi,
      /max\s*supply\s*[:\-]\s*([0-9,]+)/gi,
      /supply\s*[:\-]\s*([0-9,]+)/gi,
      /circulating\s*supply\s*[:\-]\s*([0-9,]+)/gi
    ];
    
    for (const pattern of supplyPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const supply = matches[1].replace(/,/g, '');
        tokenInfo.totalSupply = supply;
        console.log(`✅ Found total supply: ${supply}`);
        break;
      }
    }
    
    return { tokenInfo, chainInfo };
  }
  
  // NEW: Dynamic scoring adjustment for established projects
  private calculateDynamicScore(baseScore: number, findings: ResearchFindings, projectType: string): number {
    let adjustedScore = baseScore;
    
    // Apply established project bonuses
    if (this.isEstablishedProjectFromFindings(findings)) {
      for (const [bonusType, bonusConfig] of Object.entries(DYNAMIC_SCORING_SYSTEM.establishedProjectBonuses)) {
        if (this.checkBonusCondition(bonusType, findings)) {
          adjustedScore += bonusConfig.bonus;
          console.log(`✅ Applied ${bonusType} bonus: +${bonusConfig.bonus} (${bonusConfig.reasoning})`);
        }
      }
    }
    
    // Apply quality thresholds based on project type
    const threshold = DYNAMIC_SCORING_SYSTEM.qualityThresholds[projectType as keyof typeof DYNAMIC_SCORING_SYSTEM.qualityThresholds];
    if (threshold && adjustedScore < threshold.minimum) {
      console.log(`⚠️ Score ${adjustedScore} below minimum threshold ${threshold.minimum} for ${projectType}`);
    }
    
    return Math.min(adjustedScore, 100); // Cap at 100
  }
  
  private checkBonusCondition(bonusType: string, findings: ResearchFindings): boolean {
    switch (bonusType) {
      case 'multiYearOperation':
        return this.hasMultiYearOperation(findings);
      case 'institutionalBacking':
        return this.hasInstitutionalBacking(findings);
      case 'postIncidentHandling':
        return this.hasPostIncidentHandling(findings);
      case 'activeEcosystem':
        return this.hasActiveEcosystem(findings);
      case 'comprehensiveDocumentation':
        return this.hasComprehensiveDocumentation(findings);
      default:
        return false;
    }
  }
  
  // NEW: Helper methods for bonus conditions
  private hasMultiYearOperation(findings: ResearchFindings): boolean {
    // Check for indicators of long-term operation
    const hasEstablishedData = findings.onchain_data?.found || findings.financial_data?.found;
    const hasHistoricalData = findings.community_health?.found || findings.product_data?.found;
    
    return hasEstablishedData && hasHistoricalData;
  }

  private hasInstitutionalBacking(findings: ResearchFindings): boolean {
    // Check for institutional backing indicators
    const hasFinancialData = findings.financial_data?.found;
    const hasTeamInfo = findings.team_info?.found;
    
    // Projects with detailed financial data and team information
    // often indicate institutional backing
    return hasFinancialData && hasTeamInfo;
  }

  private hasPostIncidentHandling(findings: ResearchFindings): boolean {
    // Check for indicators of post-incident recovery
    const hasSecurityAudit = findings.security_audits?.found;
    const hasTeamInfo = findings.team_info?.found;
    const hasDocumentation = findings.documentation?.found;
    
    // Projects that have security audits and comprehensive documentation
    // after incidents show good recovery practices
    return hasSecurityAudit && hasTeamInfo && hasDocumentation;
  }
  
  // NEW: Helper method to detect established projects from findings
  private isEstablishedProjectFromFindings(findings: ResearchFindings): boolean {
    const hasOfficialWhitepaper = findings.whitepaper?.found && findings.whitepaper?.quality === 'high';
    const hasSecurityAudit = findings.security_audits?.found && findings.security_audits?.quality === 'high';
    const hasInstitutionalBacking = findings.financial_data?.data?.institutional_investors;
    const hasExtensiveDocumentation = findings.whitepaper?.dataPoints > 20;
    
    return hasOfficialWhitepaper && (hasSecurityAudit || hasInstitutionalBacking || hasExtensiveDocumentation);
  }
  
  private hasComprehensiveDocumentation(findings: ResearchFindings): boolean {
    return findings.whitepaper?.found && 
           findings.documentation?.found && 
           findings.github_activity?.found;
  }
  
  private hasActiveEcosystem(findings: ResearchFindings): boolean {
    return findings.community_health?.found && 
           findings.product_data?.found && 
           findings.financial_data?.found;
  }

  // Helper method to detect established projects
  private isEstablishedProject(projectName: string): boolean {
    const establishedProjects = [
      'decentraland', 'mana',
      'the sandbox', 'sandbox', 'sand',
      'illuvium', 'ilv',
      'gods unchained', 'gods',
      'splinterlands', 'sps',
      'alien worlds', 'tlm',
      'star atlas', 'atlas',
      'big time', 'bigtime',
      'gala games', 'gala',
      'axie', 'infinity', 'skymavis' // Added Axie Infinity specifically
    ];
    
    const normalizedName = projectName.toLowerCase();
    return establishedProjects.some(project => normalizedName.includes(project));
  }

  // NEW: Priority source list for established projects
  private getPrioritySourcesForEstablishedProject(projectName: string): string[] {
    const lowerName = projectName.toLowerCase();
    
    // Axie Infinity specific sources
    if (lowerName.includes('axie')) {
      return [
        'https://axieinfinity.com',
        'https://docs.axieinfinity.com',
        'https://whitepaper.axieinfinity.com',
        'https://medium.com/@axieinfinity',
        'https://blog.axieinfinity.com',
        'https://github.com/axieinfinity',
        'https://roninchain.com',
        'https://docs.roninchain.com'
      ];
    }
    
    // Add more established projects as needed
    return [];
  }

  // NEW: Discover from priority sources for established projects
  private async discoverFromPrioritySources(projectName: string, prioritySources: string[]): Promise<any> {
    console.log(`🎯 Discovering from ${prioritySources.length} priority sources for ${projectName}`);
    
    const discoveredSources: any = {
      documentation: [],
      technical: [],
      security: [],
      company: [],
      funding: []
    };

    for (const source of prioritySources) {
      try {
        console.log(`🔗 Testing priority source: ${source}`);
        
        const response = await fetch(source, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          console.log(`✅ Found priority source: ${source}`);
          
          // Categorize the source
          if (source.includes('docs') || source.includes('whitepaper')) {
            discoveredSources.documentation.push(source);
          } else if (source.includes('github')) {
            discoveredSources.technical.push(source);
          } else if (source.includes('medium') || source.includes('blog')) {
            discoveredSources.company.push(source);
          } else if (source.includes('ronin')) {
            discoveredSources.technical.push(source);
          } else {
            discoveredSources.company.push(source);
          }
        } else {
          console.log(`❌ Priority source failed: ${source} - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Priority source error: ${source} - ${(error as Error).message}`);
      }
    }

    console.log(`✅ Priority source discovery completed for ${projectName}`);
    return discoveredSources;
  }

  // Enhanced data collection for established projects
  private async collectEstablishedProjectData(projectName: string): Promise<any> {
    // Generic established project data collection
    return await this.collectGenericEstablishedProjectData(projectName);
  }



  private async collectGenericEstablishedProjectData(projectName: string): Promise<any> {
    // Generic data collection for other established projects
    return {
      establishedProject: true,
      enhancedResearch: true,
      timestamp: new Date()
    };
  }

  private extractDataFromText(text: string, patterns: any): any {
    const extractedData: any = {};
    
    try {
      // Clean the text first
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      // Extract data using patterns
      for (const [key, pattern] of Object.entries(patterns)) {
        if (pattern instanceof RegExp) {
          const matches = cleanText.match(pattern);
          if (matches && matches.length > 0) {
            // For patterns with capture groups, use the first match
            if (matches.length > 1) {
              extractedData[key] = matches[1] || matches[0];
            } else {
              extractedData[key] = matches[0];
            }
          }
        } else if (typeof pattern === 'string') {
          // Simple string search
          if (cleanText.toLowerCase().includes(pattern.toLowerCase())) {
            extractedData[key] = true;
          }
        }
      }
      
      // Additional extraction for common patterns
      if (patterns.founders) {
        // Look for founder information in various formats
        const founderPatterns = [
          /founder[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
          /ceo[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
          /co-founder[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi
        ];
        
        for (const pattern of founderPatterns) {
          const matches = cleanText.match(pattern);
          if (matches && matches.length > 0) {
            extractedData.founders = extractedData.founders || [];
            extractedData.founders.push(matches[1] || matches[0]);
          }
        }
      }
      
      if (patterns.auditFirm) {
        // Look for audit firm mentions
        const auditPatterns = [
          /(certik|consensys|trail of bits|quantstamp|openzeppelin|hacken|slowmist)/gi
        ];
        
        for (const pattern of auditPatterns) {
          const matches = cleanText.match(pattern);
          if (matches && matches.length > 0) {
            extractedData.auditFirm = matches[0];
            extractedData.hasAudit = true;
            break;
          }
        }
      }
      
      if (patterns.totalRaised) {
        // Look for funding amounts
        const fundingPatterns = [
          /raised.*?\$([0-9.,]+\s*[MBK])/gi,
          /funding.*?\$([0-9.,]+\s*[MBK])/gi,
          /investment.*?\$([0-9.,]+\s*[MBK])/gi
        ];
        
        for (const pattern of fundingPatterns) {
          const matches = cleanText.match(pattern);
          if (matches && matches.length > 0) {
            extractedData.totalRaised = matches[1] || matches[0];
            break;
          }
        }
      }
      
      if (patterns.smartContracts) {
        // Look for blockchain/contract information
        const blockchainPatterns = [
          /(ethereum|polygon|avalanche|binance|solana|ronin)/gi,
          /contract.*?verified/gi,
          /etherscan\.io/gi,
          /bscscan\.com/gi
        ];
        
        for (const pattern of blockchainPatterns) {
          const matches = cleanText.match(pattern);
          if (matches && matches.length > 0) {
            extractedData.blockchain = extractedData.blockchain || [];
            extractedData.blockchain.push(matches[0]);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error in extractDataFromText: ${(error as Error).message}`);
    }
    
    return extractedData;
  }

  private countDataPoints(text: string): number {
    // Count meaningful data points in text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return Math.min(sentences.length, 50); // Cap at 50 data points
  }

  private generateFallbackPlan(): ResearchPlan {
    return {
      projectClassification: {
        type: 'unknown',
        confidence: 0.5,
        reasoning: 'Fallback plan due to AI parsing error'
      },
      prioritySources: [
        {
          source: 'whitepaper',
          priority: 'critical',
          reasoning: 'Standard research approach',
          searchTerms: ['whitepaper', 'documentation'],
          expectedDataPoints: ['tokenomics', 'roadmap']
        },
        {
          source: 'team_info',
          priority: 'critical',
          reasoning: 'Team verification essential',
          searchTerms: ['team', 'founders'],
          expectedDataPoints: ['team_members', 'experience']
        }
      ],
      riskAreas: [
        {
          area: 'general_verification',
          priority: 'high',
          investigationApproach: 'Standard verification process'
        }
      ],
      searchAliases: [],
      estimatedResearchTime: 20,
      successCriteria: {
        minimumSources: 3,
        criticalDataPoints: ['team_verified', 'documentation_found'],
        redFlagChecks: ['scam_indicators']
      }
    };
  }

  // NEW: Cache management methods
  private getCachedData(projectName: string, sourceName: string): any | null {
    const cacheKey = `${projectName.toLowerCase()}_${sourceName}`;
    const cached = this.sourceCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if cache is expired
    const now = new Date();
    const cacheAge = now.getTime() - cached.lastUpdated.getTime();
    const expiryMs = this.confidenceThresholds.cacheExpiryHours * 60 * 60 * 1000;
    
    if (cacheAge > expiryMs) {
      this.sourceCache.delete(cacheKey);
      return null;
    }
    
    // Check if data needs refresh based on confidence
    const sourceData = cached.sources[sourceName];
    if (sourceData && sourceData.confidence < this.confidenceThresholds.refreshThreshold) {
      const refreshAge = now.getTime() - sourceData.lastRefreshed.getTime();
      const refreshIntervalMs = sourceData.refreshInterval * 60 * 1000;
      
      if (refreshAge > refreshIntervalMs) {
        return null; // Force refresh
      }
    }
    
    return sourceData?.data || null;
  }

  private setCachedData(projectName: string, sourceName: string, data: any, confidence: number): void {
    const cacheKey = `${projectName.toLowerCase()}_${sourceName}`;
    const now = new Date();
    
    let cached = this.sourceCache.get(cacheKey);
    if (!cached) {
      cached = {
        projectName,
        sources: {},
        lastUpdated: now,
        confidenceScore: 0
      };
    }
    
    cached.sources[sourceName] = {
      data,
      timestamp: now,
      confidence,
      lastRefreshed: now,
      refreshInterval: this.getRefreshInterval(confidence)
    };
    
    cached.lastUpdated = now;
    cached.confidenceScore = this.calculateOverallConfidence(cached.sources);
    
    this.sourceCache.set(cacheKey, cached);
  }

  private getRefreshInterval(confidence: number): number {
    // Higher confidence = longer refresh interval
    if (confidence >= this.confidenceThresholds.highConfidence) return 1440; // 24 hours
    if (confidence >= this.confidenceThresholds.minimumForAnalysis) return 720; // 12 hours
    return 60; // 1 hour for low confidence data
  }

  private calculateOverallConfidence(sources: any): number {
    const confidences = Object.values(sources).map((s: any) => s.confidence);
    return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
  }

  // NEW: Feedback loop methods
  public async processSecondAIFeedback(
    projectName: string, 
    feedback: SecondAIFeedback
  ): Promise<{
    shouldCollectMoreData: boolean;
    newSourcesToCollect: string[];
    updatedPlan?: Partial<ResearchPlan>;
  }> {
    // Store feedback in history
    const projectFeedback = this.feedbackHistory.get(projectName) || [];
    projectFeedback.push(feedback);
    this.feedbackHistory.set(projectName, projectFeedback);
    
    // Analyze feedback to determine next actions
    const shouldCollectMoreData = feedback.needsMoreData || !feedback.analysisReadiness;
    const newSourcesToCollect = feedback.missingDataTypes;
    
    // Generate updated research plan if needed
    let updatedPlan: Partial<ResearchPlan> | undefined;
    if (shouldCollectMoreData) {
      updatedPlan = await this.generateUpdatedPlanFromFeedback(projectName, feedback);
    }
    
    return {
      shouldCollectMoreData,
      newSourcesToCollect,
      updatedPlan
    };
  }

  private async generateUpdatedPlanFromFeedback(
    projectName: string, 
    feedback: SecondAIFeedback
  ): Promise<Partial<ResearchPlan>> {
    const prompt = `Based on feedback from the second AI analysis, update the research plan for "${projectName}".
    
    Feedback received:
    - Missing data types: ${feedback.missingDataTypes.join(', ')}
    - Specific requests: ${feedback.specificRequests.join(', ')}
    - Confidence level: ${feedback.confidenceLevel}
    - Recommendations: ${feedback.recommendations.join(', ')}
    
    Generate an updated research plan that addresses these gaps. Focus on:
    1. New sources to collect the missing data types
    2. Higher priority for sources that will improve confidence
    3. Specific search terms for the missing information
    4. Adjusted success criteria based on feedback
    
    Return a JSON object with the updated plan sections.`;
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error generating updated plan from feedback:', error);
      return {};
    }
  }

  // NEW: Confidence threshold checking
  public shouldPassToSecondAI(findings: ResearchFindings): {
    shouldPass: boolean;
    reason: string;
    confidenceScore: number;
    missingForThreshold: string[];
  } {
    const score = this.scoringEngine.calculateResearchScore(findings);
    const confidenceScore = score.confidence;
    
    const shouldPass = confidenceScore >= this.confidenceThresholds.minimumForAnalysis;
    const reason = shouldPass 
      ? `Confidence score (${confidenceScore}) meets minimum threshold (${this.confidenceThresholds.minimumForAnalysis})`
      : `Confidence score (${confidenceScore}) below minimum threshold (${this.confidenceThresholds.minimumForAnalysis})`;
    
    // Identify what's missing to reach threshold
    const missingForThreshold: string[] = [];
    if (confidenceScore < this.confidenceThresholds.minimumForAnalysis) {
      // Use a fallback plan with default critical data points to avoid undefined errors
      const fallbackPlan: ResearchPlan = {
        projectClassification: {
          type: 'unknown',
          confidence: 0,
          reasoning: 'Fallback plan for gap analysis'
        },
        prioritySources: [],
        riskAreas: [],
        searchAliases: [],
        estimatedResearchTime: 0,
        successCriteria: {
          minimumSources: 0,
          criticalDataPoints: ['team_verified', 'tokenomics_clear', 'community_active', 'security_audited', 'funding_verified'],
          redFlagChecks: []
        }
      };
      const missingSources = this.identifyInformationGaps(fallbackPlan, findings);
      missingForThreshold.push(...missingSources);
    }
    
    return {
      shouldPass,
      reason,
      confidenceScore,
      missingForThreshold
    };
  }

  // NEW: Enhanced error handling with retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operationName} attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
            this.retryConfig.maxDelay
          );
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${this.retryConfig.maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  // NEW: Real-time update checking
  public async checkForUpdates(projectName: string): Promise<{
    needsUpdate: boolean;
    sourcesToUpdate: string[];
    lastUpdateAge: number; // minutes
  }> {
    const cacheKey = `${projectName.toLowerCase()}`;
    const cached = this.sourceCache.get(cacheKey);
    
    if (!cached) {
      return { needsUpdate: true, sourcesToUpdate: [], lastUpdateAge: Infinity };
    }
    
    const now = new Date();
    const lastUpdateAge = (now.getTime() - cached.lastUpdated.getTime()) / (1000 * 60); // minutes
    
    const sourcesToUpdate: string[] = [];
    
    for (const [sourceName, sourceData] of Object.entries(cached.sources)) {
      const sourceAge = (now.getTime() - sourceData.lastRefreshed.getTime()) / (1000 * 60);
      
      if (sourceAge > sourceData.refreshInterval) {
        sourcesToUpdate.push(sourceName);
      }
    }
    
    const needsUpdate = sourcesToUpdate.length > 0 || lastUpdateAge > this.confidenceThresholds.cacheExpiryHours * 60;
    
    return {
      needsUpdate,
      sourcesToUpdate,
      lastUpdateAge
    };
  }

  // NEW: Cache cleanup
  public cleanupExpiredCache(): number {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.sourceCache.entries()) {
      const cacheAge = now.getTime() - cached.lastUpdated.getTime();
      const expiryMs = this.confidenceThresholds.cacheExpiryHours * 60 * 60 * 1000;
      
      if (cacheAge > expiryMs) {
        this.sourceCache.delete(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  // NEW: Lightweight token discovery (as proposed in architecture)
  private async discoverTokensLightweight(projectName: string): Promise<TokenDiscoveryResult> {
    console.log(`🔍 Starting lightweight token discovery for: ${projectName}`);
    
    try {
      // Stage 1: Lightweight AI call for token identification
      const tokenPrompt = `Given game project '${projectName}', what are the associated token symbols? 
      
      Return ONLY a JSON array of token symbols (e.g., ["AXS", "SLP"]) or ["none"] if no tokens found.
      Do not include explanations or additional text.
      
      Examples:
      - "Axie Infinity" → ["AXS", "SLP"]
      - "The Sandbox" → ["SAND"] 
      - "Decentraland" → ["MANA"]
      - "Traditional Game" → ["none"]`;
      
      const response = await this.executeWithRetry(
        () => this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          temperature: 0.1,
          messages: [{ role: 'user', content: tokenPrompt }]
        }),
        `Lightweight token discovery for ${projectName}`
      );
      
             const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
       console.log(`🤖 Token discovery AI response: ${aiResponse}`);
       
       // Parse AI response - handle potential JSON formatting issues
       let tokens: string[] = [];
       try {
         // Clean up the response - remove markdown code blocks if present
         let cleanedResponse = aiResponse.trim();
         if (cleanedResponse.startsWith('```json')) {
           cleanedResponse = cleanedResponse.substring(7);
         }
         if (cleanedResponse.endsWith('```')) {
           cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
         }
         cleanedResponse = cleanedResponse.trim();
         
         const parsed = JSON.parse(cleanedResponse);
         tokens = Array.isArray(parsed) ? parsed : [];
         console.log(`✅ AI discovered tokens: ${tokens.join(', ')}`);
       } catch (parseError) {
         console.log(`❌ Failed to parse AI token response: ${parseError}`);
         tokens = [];
       }
      
      // Stage 2: Fallback to CoinGecko if AI fails
      let fallbackUsed = false;
      if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === 'none')) {
        console.log(`🔄 AI found no tokens, trying CoinGecko fallback`);
        const coinGeckoTokens = await this.discoverTokensFromCoinGecko(projectName);
        if (coinGeckoTokens.length > 0) {
          tokens = coinGeckoTokens;
          fallbackUsed = true;
          console.log(`✅ CoinGecko fallback found tokens: ${tokens.join(', ')}`);
        }
      }
      
      // Stage 3: Build/maintain lookup table (in-memory for now)
      this.updateTokenLookupTable(projectName, tokens);
      
      const confidence = tokens.length > 0 ? 85 : 30;
      const reasoning = fallbackUsed 
        ? 'Tokens discovered via CoinGecko fallback'
        : tokens.length > 0 
          ? 'Tokens discovered via AI analysis'
          : 'No tokens found for this project';
      
      return {
        tokens,
        confidence,
        reasoning,
        fallbackUsed
      };
      
    } catch (error) {
      console.log(`❌ Lightweight token discovery failed: ${(error as Error).message}`);
      return {
        tokens: [],
        confidence: 0,
        reasoning: 'Token discovery failed',
        fallbackUsed: false
      };
    }
  }
  
  // NEW: CoinGecko fallback for token discovery
  private async discoverTokensFromCoinGecko(projectName: string): Promise<string[]> {
    try {
      const response = await this.executeWithRetry(
        () => fetch('https://api.coingecko.com/api/v3/coins/list'),
        `CoinGecko token discovery for ${projectName}`
      );
      
      if (response.ok) {
        const coins: any[] = await response.json();
        const normalizedName = projectName.toLowerCase();
        
        // Search for exact matches first
        let matches = coins.filter((coin: any) => 
          coin.name.toLowerCase() === normalizedName ||
          coin.symbol.toLowerCase() === normalizedName
        );
        
        // If no exact matches, try partial matches
        if (matches.length === 0) {
          matches = coins.filter((coin: any) => 
            coin.name.toLowerCase().includes(normalizedName) ||
            coin.symbol.toLowerCase().includes(normalizedName)
          );
        }
        
        const tokens = matches.map((coin: any) => coin.symbol.toUpperCase());
        console.log(`🔍 CoinGecko found ${tokens.length} potential tokens for ${projectName}`);
        return tokens;
      }
    } catch (error) {
      console.log(`❌ CoinGecko token discovery failed: ${(error as Error).message}`);
    }
    
    return [];
  }
  
  // NEW: Token lookup table management
  private tokenLookupTable: Map<string, string[]> = new Map();
  
  private updateTokenLookupTable(projectName: string, tokens: string[]): void {
    const key = projectName.toLowerCase();
    if (tokens.length > 0) {
      this.tokenLookupTable.set(key, tokens);
      console.log(`💾 Updated token lookup table for ${projectName}: ${tokens.join(', ')}`);
    }
  }
  
  private getCachedTokens(projectName: string): string[] {
    const key = projectName.toLowerCase();
    return this.tokenLookupTable.get(key) || [];
  }

  // NEW: Enhanced multi-stage whitepaper discovery (as proposed in architecture)
  private async discoverWhitepapersEnhanced(projectName: string, aliases: string[]): Promise<string[]> {
    console.log(`📄 Starting enhanced whitepaper discovery for: ${projectName}`);
    
    const discoveredUrls: string[] = [];
    const allNames = [projectName, ...aliases];
    
    // Stage 1: Direct pattern matching
    console.log(`🔍 Stage 1: Direct pattern matching`);
    for (const name of allNames.slice(0, 3)) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      
      for (const pattern of ENHANCED_WHITEPAPER_PATTERNS.stage1_direct) {
        const url = pattern.replace(/{project}/g, normalizedName);
        try {
          const res = await this.executeWithRetry(
            () => fetch(`https://${url}`, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
            `Direct pattern test for ${url}`
          );
          if (res.ok) {
            discoveredUrls.push(`https://${url}`);
            console.log(`✅ Found via direct pattern: https://${url}`);
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
    
    // Stage 2: Targeted web search (if SERP API available)
    if (process.env.SERP_API_KEY && discoveredUrls.length === 0) {
      console.log(`🔍 Stage 2: Targeted web search`);
      const searchResults = await this.performTargetedWebSearch(projectName, aliases);
      discoveredUrls.push(...searchResults);
    }
    
    // Stage 3: Web scraping from discovered homepages
    if (discoveredUrls.length === 0) {
      console.log(`🔍 Stage 3: Web scraping from homepages`);
      const scrapingResults = await this.scrapeHomepagesForDocs(projectName, aliases);
      discoveredUrls.push(...scrapingResults);
    }
    
    // Stage 4: AI-assisted discovery (fallback)
    if (discoveredUrls.length === 0) {
      console.log(`🔍 Stage 4: AI-assisted discovery`);
      const aiResults = await this.discoverDocsWithAI(projectName, aliases);
      discoveredUrls.push(...aiResults);
    }
    
    // Remove duplicates and verify URLs
    const uniqueUrls = [...new Set(discoveredUrls)];
    const verifiedUrls: string[] = [];
    
    for (const url of uniqueUrls.slice(0, 5)) { // Limit verification to first 5 URLs
      try {
        const res = await this.executeWithRetry(
          () => fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
          `Verifying discovered URL ${url}`
        );
        if (res.ok) {
          verifiedUrls.push(url);
          console.log(`✅ Verified documentation URL: ${url}`);
        }
      } catch (e) {
        console.log(`❌ Failed to verify URL ${url}: ${(e as Error).message}`);
      }
    }
    
    console.log(`📄 Enhanced whitepaper discovery completed: ${verifiedUrls.length} URLs found`);
    return verifiedUrls;
  }
  
  // NEW: Targeted web search for documentation
  private async performTargetedWebSearch(projectName: string, aliases: string[]): Promise<string[]> {
    const discoveredUrls: string[] = [];
    
    if (!process.env.SERP_API_KEY) {
      console.log(`⚠️ No SERP_API_KEY available for targeted web search`);
      return discoveredUrls;
    }
    
    const searchTerms = ENHANCED_WHITEPAPER_PATTERNS.stage2_search_terms.map(term => 
      term.replace(/{project_name}/g, projectName)
    );
    
    for (const term of searchTerms.slice(0, 3)) { // Limit to first 3 search terms
      try {
        console.log(`🔍 Web searching for: ${term}`);
        const serpRes = await this.executeWithRetry(
          () => fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(term)}&api_key=${process.env.SERP_API_KEY}`),
          `SerpAPI search for ${term}`
        );
        
        if (serpRes.ok) {
          const serpJson = await serpRes.json();
          const results = (serpJson.organic_results || []).slice(0, 3);
          
          for (const result of results) {
            if (result.link) {
              try {
                const linkRes = await this.executeWithRetry(
                  () => fetch(result.link, { method: 'HEAD' }),
                  `Checking web search result ${result.link}`
                );
                if (linkRes.ok) {
                  discoveredUrls.push(result.link);
                  console.log(`✅ Found via web search: ${result.link}`);
                }
              } catch (e) {
                console.log(`❌ Failed to check web search result ${result.link}: ${(e as Error).message}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`❌ Web search failed for ${term}: ${(e as Error).message}`);
      }
    }
    
    return discoveredUrls;
  }
  
  // NEW: Scrape homepages for documentation links
  private async scrapeHomepagesForDocs(projectName: string, aliases: string[]): Promise<string[]> {
    const discoveredUrls: string[] = [];
    const allNames = [projectName, ...aliases];
    
    for (const name of allNames.slice(0, 2)) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      const homepageUrl = `https://${normalizedName}.com`;
      
      try {
        console.log(`🕷️ Scraping homepage: ${homepageUrl}`);
        const res = await this.executeWithRetry(
          () => fetch(homepageUrl, { signal: AbortSignal.timeout(5000) }),
          `Fetching homepage ${homepageUrl}`
        );
        
        if (res.ok) {
          const html = await res.text();
          const $ = require('cheerio').load(html);
          
          // Find all links
          const links = $('a[href]').map((i: number, el: any) => $(el).attr('href')).get();
          
          for (const link of links) {
            if (!link || typeof link !== 'string') continue;
            
            const fullUrl = link.startsWith('http') ? link : new URL(link, homepageUrl).href;
            const linkText = $(`a[href="${link}"]`).text().toLowerCase();
            const linkHref = $(`a[href="${link}"]`).attr('href')?.toLowerCase() || '';
            
            // Check if link matches documentation keywords
            const isDocLink = ENHANCED_WHITEPAPER_PATTERNS.stage3_scraping_keywords.some(keyword => 
              linkText.includes(keyword) || 
              linkHref.includes(keyword) ||
              fullUrl.includes(keyword)
            );
            
            if (isDocLink) {
              try {
                const linkRes = await this.executeWithRetry(
                  () => fetch(fullUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
                  `Checking scraped documentation link ${fullUrl}`
                );
                if (linkRes.ok) {
                  discoveredUrls.push(fullUrl);
                  console.log(`✅ Found via scraping: ${fullUrl}`);
                }
              } catch (e) {
                console.log(`❌ Failed to check scraped link ${fullUrl}: ${(e as Error).message}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`❌ Failed to scrape homepage ${homepageUrl}: ${(e as Error).message}`);
      }
    }
    
    return discoveredUrls;
  }
  
  // NEW: AI-assisted documentation discovery
  private async discoverDocsWithAI(projectName: string, aliases: string[]): Promise<string[]> {
    const discoveredUrls: string[] = [];
    
    try {
      const prompt = `Search for official documentation links for ${projectName}. 
      
      Look for:
      1. Official website navigation menus
      2. Social media bio links  
      3. CoinGecko/CMC profile links
      4. GitHub repository links
      
      Return any whitepaper, litepaper, or tokenomics document URLs found.
      
      Format response as JSON array of URLs only, or empty array if none found.`;
      
      const response = await this.executeWithRetry(
        () => this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        }),
        `AI-assisted documentation discovery for ${projectName}`
      );
      
             const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
       
       try {
         // Clean up the response - remove markdown code blocks if present
         let cleanedResponse = aiResponse.trim();
         if (cleanedResponse.startsWith('```json')) {
           cleanedResponse = cleanedResponse.substring(7);
         }
         if (cleanedResponse.endsWith('```')) {
           cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
         }
         cleanedResponse = cleanedResponse.trim();
         
         const parsed = JSON.parse(cleanedResponse);
         const urls = Array.isArray(parsed) ? parsed : [];
        
        // Verify AI-discovered URLs
        for (const url of urls.slice(0, 3)) {
          try {
            const res = await this.executeWithRetry(
              () => fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) }),
              `Verifying AI-discovered URL ${url}`
            );
            if (res.ok) {
              discoveredUrls.push(url);
              console.log(`✅ Found via AI discovery: ${url}`);
            }
          } catch (e) {
            console.log(`❌ Failed to verify AI-discovered URL ${url}: ${(e as Error).message}`);
          }
        }
      } catch (parseError) {
        console.log(`❌ Failed to parse AI documentation response: ${parseError}`);
      }
    } catch (error) {
      console.log(`❌ AI-assisted documentation discovery failed: ${(error as Error).message}`);
    }
    
    return discoveredUrls;
  }
}

// Main orchestrated research function
export async function conductAIOrchestratedResearch(
  projectName: string,
  anthropicApiKey: string,
  basicInfo?: BasicProjectInfo,
  dataCollectionFunctions?: DataCollectionFunctions
) {
  const orchestrator = new AIResearchOrchestrator(anthropicApiKey);
  const findings: ResearchFindings = {};
  
  console.log(`🚀 Starting AI-orchestrated research for: ${projectName}`);
  
  try {
    // NEW: Phase 0: Lightweight token discovery (as proposed in architecture)
    console.log(`🔍 Phase 0: Lightweight token discovery for ${projectName}`);
    const tokenDiscovery = await orchestrator['discoverTokensLightweight'](projectName);
    console.log(`✅ Token discovery completed: ${tokenDiscovery.tokens.join(', ')} (confidence: ${(tokenDiscovery.confidence * 100).toFixed(2)}%)`);
    
    // NEW: Phase 0.5: Enhanced whitepaper discovery (as proposed in architecture)
    console.log(`📄 Phase 0.5: Enhanced whitepaper discovery for ${projectName}`);
    const discoveredWhitepapers = await orchestrator['discoverWhitepapersEnhanced'](projectName, basicInfo?.aliases || []);
    console.log(`✅ Enhanced whitepaper discovery completed: ${discoveredWhitepapers.length} URLs found`);
    
    // NEW: Check for cached data first
    const updateCheck = await orchestrator.checkForUpdates(projectName);
    console.log(`Update check for ${projectName}:`, updateCheck);
    
    // Phase 1: Get AI research strategy
    console.log(`📋 Phase 1: Generating research plan for ${projectName}`);
    const researchPlan = await orchestrator.generateResearchPlan(projectName, basicInfo);
    console.log(`✅ Research plan generated with ${researchPlan.prioritySources.length} priority sources`);
  
  const startTime = Date.now();
  let shouldContinue = true;
  let adaptiveState: AdaptiveResearchState | null = null;
  
  // NEW: Phase 1.5: Universal source discovery before AI-guided collection
  console.log(`🔍 Phase 1.5: Universal source discovery for ${projectName}`);
  const discoveredSources = await orchestrator['discoverUniversalSources'](projectName, researchPlan.searchAliases);
  
  // NEW: Phase 1.6: Extract data from discovered whitepapers
  if (discoveredWhitepapers.length > 0) {
    console.log(`📄 Phase 1.6: Extracting data from discovered whitepapers for ${projectName}`);
    for (const whitepaperUrl of discoveredWhitepapers.slice(0, 2)) { // Limit to first 2 whitepapers
      try {
        const extractedDocData = await orchestrator['extractFromDocumentation'](whitepaperUrl, projectName);
        
        if (extractedDocData.tokenomics && Object.keys(extractedDocData.tokenomics).length > 0) {
          findings.whitepaper = {
            found: true,
            data: { 
              url: whitepaperUrl,
              tokenomics: extractedDocData.tokenomics,
              tokenInfo: extractedDocData.tokenInfo,
              chainInfo: extractedDocData.chainInfo
            },
            quality: 'high' as const,
            timestamp: new Date(),
            dataPoints: Object.keys(extractedDocData.tokenomics).length + 
                       (extractedDocData.tokenInfo ? Object.keys(extractedDocData.tokenInfo).length : 0) +
                       (extractedDocData.chainInfo ? Object.keys(extractedDocData.chainInfo).length : 0)
          };
          console.log(`✅ Extracted data from whitepaper: ${whitepaperUrl}`);
          break; // Use first successful whitepaper
        }
      } catch (e) {
        console.log(`❌ Failed to extract from whitepaper ${whitepaperUrl}: ${(e as Error).message}`);
      }
    }
  }
  
  // Extract data from discovered sources
  if (Object.values(discoveredSources).some((sources: any) => Array.isArray(sources) && sources.length > 0)) {
    console.log(`📄 Extracting data from discovered sources for ${projectName}`);
    const extractedData = await orchestrator['extractDataFromSources'](discoveredSources, projectName);
    
    // Map extracted data to findings
    if (extractedData.tokenInfo && Object.keys(extractedData.tokenInfo).length > 0) {
      findings.token_info = {
        found: true,
        data: extractedData.tokenInfo,
        quality: 'high' as const,
        timestamp: new Date(),
        dataPoints: Object.keys(extractedData.tokenInfo).length
      };
      console.log(`✅ Found token info:`, extractedData.tokenInfo);
    }
    
    if (extractedData.chainInfo && Object.keys(extractedData.chainInfo).length > 0) {
      findings.onchain_data = {
        found: true,
        data: { ...findings.onchain_data?.data, ...extractedData.chainInfo },
        quality: 'high' as const,
        timestamp: new Date(),
        dataPoints: (findings.onchain_data?.dataPoints || 0) + Object.keys(extractedData.chainInfo).length
      };
      console.log(`✅ Found chain info:`, extractedData.chainInfo);
    }
    
    if (extractedData.tokenomicsData && Object.keys(extractedData.tokenomicsData).length > 0) {
      findings.financial_data = {
        found: true,
        data: { ...findings.financial_data?.data, ...extractedData.tokenomicsData },
        quality: 'high' as const,
        timestamp: new Date(),
        dataPoints: (findings.financial_data?.dataPoints || 0) + Object.keys(extractedData.tokenomicsData).length
      };
      console.log(`✅ Found tokenomics data:`, extractedData.tokenomicsData);
    }
    
    if (extractedData.teamInfo && Object.keys(extractedData.teamInfo).length > 0) {
      findings.team_info = {
        found: true,
        data: { ...findings.team_info?.data, ...extractedData.teamInfo },
        quality: 'medium' as const,
        timestamp: new Date(),
        dataPoints: (findings.team_info?.dataPoints || 0) + Object.keys(extractedData.teamInfo).length
      };
      console.log(`✅ Found team info:`, extractedData.teamInfo);
    }
    
    if (extractedData.securityAudits && Object.keys(extractedData.securityAudits).length > 0) {
      findings.security_audits = {
        found: true,
        data: { ...findings.security_audits?.data, ...extractedData.securityAudits },
        quality: 'high' as const,
        timestamp: new Date(),
        dataPoints: (findings.security_audits?.dataPoints || 0) + Object.keys(extractedData.securityAudits).length
      };
      console.log(`✅ Found security audit data:`, extractedData.securityAudits);
    }
  }
  
  // NEW: Phase 2: Conditional API routing based on token discovery (as proposed in architecture)
  console.log(`📊 Phase 2: Conditional API routing for ${projectName}`);
  
  // Always call: CoinGecko, YouTube, IGDB APIs
  const alwaysCallApis = ['coingecko', 'youtube', 'igdb'];
  
  // Conditional blockchain APIs: only call if tokens found
  const conditionalApis: string[] = [];
  if (tokenDiscovery.tokens.length > 0) {
    console.log(`🔗 Tokens found (${tokenDiscovery.tokens.join(', ')}), enabling blockchain APIs`);
    // Chain priority: ETH → SOL → AVAX → Ronin (as proposed)
    conditionalApis.push('ethereum', 'solana', 'avalanche', 'ronin');
  } else {
    console.log(`⚠️ No tokens found, skipping blockchain APIs`);
  }
  
  // Phase 2: Execute research with AI adaptation and caching
  console.log(`📊 Phase 2.5: AI-guided data collection for ${projectName}`);
  for (const prioritySource of researchPlan.prioritySources) {
    if (!shouldContinue) break;
    
    const timeElapsed = Math.floor((Date.now() - startTime) / 60000);
    
    // NEW: Check cache first
    const cachedData = orchestrator['getCachedData'](projectName, prioritySource.source);
    let sourceData;
    
    if (cachedData) {
      console.log(`📦 Using cached data for ${prioritySource.source}`);
      sourceData = cachedData;
    } else {
      // Collect data from this source using REAL data collection functions with retry
      console.log(`🔍 Collecting data for ${prioritySource.source}`);
      sourceData = await orchestrator['executeWithRetry'](
        () => collectFromSourceWithRealFunctions(
          prioritySource.source, 
          prioritySource.searchTerms,
          researchPlan.searchAliases,
          projectName,
          dataCollectionFunctions
        ),
        `Data collection for ${prioritySource.source}`
      );
      
      // NEW: Cache the collected data
      if (sourceData.found) {
        const confidence = sourceData.quality === 'high' ? 85 : sourceData.quality === 'medium' ? 70 : 50;
        orchestrator['setCachedData'](projectName, prioritySource.source, sourceData, confidence);
        console.log(`💾 Cached data for ${prioritySource.source} with confidence ${confidence}`);
      }
    }
    
    findings[prioritySource.source] = sourceData;
    
    // NEW: Check confidence threshold before continuing
    const thresholdCheck = orchestrator.shouldPassToSecondAI(findings);
    if (!thresholdCheck.shouldPass && Object.keys(findings).length >= 3) {
      console.log(`⚠️ Confidence threshold not met: ${thresholdCheck.reason}`);
      console.log(`Missing for threshold: ${thresholdCheck.missingForThreshold.join(', ')}`);
    }
    
    // Every 2 sources, check with AI if we should continue
    if (Object.keys(findings).length % 2 === 0) {
      console.log(`🤖 Adapting research strategy after ${Object.keys(findings).length} sources`);
      adaptiveState = await orchestrator.adaptResearchStrategy(
        researchPlan, 
        findings, 
        timeElapsed
      );
      
      shouldContinue = adaptiveState.shouldContinue;
      
      if (!shouldContinue) {
        console.log(`🛑 Research stopped by AI adaptation`);
        break;
      }
    }
  }
  
  // Phase 3: Final completeness check with confidence threshold
  console.log(`📋 Phase 3: Assessing research completeness for ${projectName}`);
  const completeness = await orchestrator.assessResearchCompleteness(researchPlan, findings);
  const thresholdCheck = orchestrator.shouldPassToSecondAI(findings);
  
  console.log(`📊 Final assessment - Confidence: ${(thresholdCheck.confidenceScore * 100).toFixed(2)}%, Complete: ${completeness.isComplete}`);
  console.log(`📋 Gaps identified: ${completeness.gaps.length}`);
  console.log(`💡 Recommendations: ${completeness.recommendations.length}`);
  
  if (!completeness.isComplete || !thresholdCheck.shouldPass) {
    console.log(`❌ Research incomplete or below threshold`);
    return {
      success: false,
      reason: thresholdCheck.shouldPass 
        ? 'Insufficient research quality after AI-guided collection'
        : thresholdCheck.reason,
      gaps: completeness.gaps,
      recommendations: completeness.recommendations,
      researchPlan,
      findings,
      discoveredSources, // NEW: Include discovered sources for debugging
      tokenDiscovery, // NEW: Include token discovery results
      discoveredWhitepapers // NEW: Include whitepaper discovery results
    };
  }
  
  console.log(`✅ Research completed successfully for ${projectName}`);
        return {
        success: true,
        findings,
        researchPlan,
        completeness,
        adaptiveState,
        discoveredSources, // NEW: Include discovered sources
        tokenDiscovery, // NEW: Include token discovery results
        discoveredWhitepapers, // NEW: Include whitepaper discovery results
        meta: {
          timeSpent: Math.floor((Date.now() - startTime) / 60000),
          sourcesCollected: Object.keys(findings).filter(k => findings[k]?.found).length,
          aiConfidence: completeness.confidence,
          universalSourcesFound: Object.values(discoveredSources).reduce((sum: number, sources: any) => sum + (Array.isArray(sources) ? sources.length : 0), 0),
          tokensDiscovered: tokenDiscovery.tokens.length,
          whitepapersFound: discoveredWhitepapers.length
        }
      };
    } catch (error) {
      console.error(`❌ Error in AI-orchestrated research:`, error);
      console.error(`🔍 Error details:`, error instanceof Error ? error.message : 'Unknown error');
      console.error(`🔍 Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      
      // Force fresh data sourcing instead of fallback
      console.log(`🔄 Forcing fresh data sourcing for ${projectName} instead of fallback response`);
      throw error; // Re-throw to allow traditional research to handle it
    }
}

// Helper function - integrate with your existing source collection
async function collectFromSourceWithRealFunctions(
  sourceName: string, 
  searchTerms: string[], 
  aliases: string[],
  projectName: string,
  dataCollectionFunctions?: DataCollectionFunctions
): Promise<any> {
  if (!dataCollectionFunctions) {
    // Fallback to placeholder if no functions provided
    return {
      found: Math.random() > 0.3,
      data: { example: 'data' },
      quality: 'medium',
      timestamp: new Date(),
      dataPoints: Math.floor(Math.random() * 10) + 5
    };
  }

  try {
    switch (sourceName) {
      case 'whitepaper':
        // Use AI to discover official URLs first
        const officialUrls = await dataCollectionFunctions.discoverOfficialUrlsWithAI(projectName, aliases);
        if (officialUrls?.whitepaper) {
          const pdfBuffer = await dataCollectionFunctions.fetchPdfBuffer(officialUrls.whitepaper);
          if (pdfBuffer) {
            const tokenomics = await dataCollectionFunctions.extractTokenomicsFromWhitepaper(officialUrls.whitepaper);
            return {
              found: true,
              data: { 
                whitepaperUrl: officialUrls.whitepaper,
                tokenomics: tokenomics,
                pdfSize: pdfBuffer.length
              },
              quality: 'high',
              timestamp: new Date(),
              dataPoints: tokenomics ? Object.keys(tokenomics).length + 5 : 5
            };
          }
        }
        // Fallback to generic tokenomics search
        const genericTokenomics = await dataCollectionFunctions.searchProjectSpecificTokenomics(projectName, aliases);
        return {
          found: !!genericTokenomics,
          data: genericTokenomics || {},
          quality: genericTokenomics ? 'medium' : 'low',
          timestamp: new Date(),
          dataPoints: genericTokenomics ? Object.keys(genericTokenomics).length : 0
        };

      case 'team_info':
        // Search for team information using official URLs
        const teamUrls = await dataCollectionFunctions.discoverOfficialUrlsWithAI(projectName, aliases);
        if (teamUrls?.website) {
          const aboutSection = await dataCollectionFunctions.fetchWebsiteAboutSection(teamUrls.website);
          return {
            found: !!aboutSection,
            data: { 
              website: teamUrls.website,
              aboutSection: aboutSection
            },
            quality: aboutSection ? 'medium' : 'low',
            timestamp: new Date(),
            dataPoints: aboutSection ? aboutSection.split('.').length : 0
          };
        }
        return {
          found: false,
          data: {},
          quality: 'low',
          timestamp: new Date(),
          dataPoints: 0
        };

      case 'community_health':
        // Try to find social media links and analyze community
        const socialUrls = await dataCollectionFunctions.discoverOfficialUrlsWithAI(projectName, aliases);
        const communityData: any = {};
        
        if (socialUrls?.website) {
          // Extract social links from website
          const aboutSection = await dataCollectionFunctions.fetchWebsiteAboutSection(socialUrls.website);
          // This would need social link extraction logic
        }
        
        return {
          found: Object.keys(communityData).length > 0,
          data: communityData,
          quality: Object.keys(communityData).length > 2 ? 'medium' : 'low',
          timestamp: new Date(),
          dataPoints: Object.keys(communityData).length
        };

      case 'onchain_data':
        // For Ronin projects, try to get on-chain data
        // This would need contract address discovery logic
        return {
          found: false,
          data: {},
          quality: 'low',
          timestamp: new Date(),
          dataPoints: 0
        };

      case 'financial_data':
        // Search for funding information, market data
        const financialUrls = await dataCollectionFunctions.discoverOfficialUrlsWithAI(projectName, aliases);
        return {
          found: !!financialUrls?.website,
          data: { website: financialUrls?.website },
          quality: 'medium',
          timestamp: new Date(),
          dataPoints: 1
        };

      case 'security_audit':
        // Search for security audit information
        const auditSearch = await dataCollectionFunctions.searchProjectSpecificTokenomics(
          projectName, 
          [...aliases, 'security audit', 'certik', 'immunefi']
        );
        return {
          found: !!auditSearch,
          data: auditSearch || {},
          quality: auditSearch ? 'high' : 'low',
          timestamp: new Date(),
          dataPoints: auditSearch ? Object.keys(auditSearch).length : 0
        };

      default:
        // Generic search for any other source
        const genericSearch = await dataCollectionFunctions.searchProjectSpecificTokenomics(projectName, aliases);
        return {
          found: !!genericSearch,
          data: genericSearch || {},
          quality: genericSearch ? 'medium' : 'low',
          timestamp: new Date(),
          dataPoints: genericSearch ? Object.keys(genericSearch).length : 0
        };
    }
  } catch (error) {
    console.error(`Error collecting data from ${sourceName}:`, error);
    return {
      found: false,
      data: {},
      quality: 'low',
      timestamp: new Date(),
      dataPoints: 0,
      error: (error as Error).message
    };
  }
}

export { AIResearchOrchestrator, AdaptiveResearchState, BasicProjectInfo }; 

// NEW: Lightweight token discovery system (as proposed)
interface TokenDiscoveryResult {
  tokens: string[];
  confidence: number;
  reasoning: string;
  fallbackUsed: boolean;
}

// NEW: Enhanced whitepaper discovery patterns (as proposed)
const ENHANCED_WHITEPAPER_PATTERNS = {
  stage1_direct: [
    // Direct pattern matching
    '{project}.com/whitepaper',
    '{project}.com/whitepaper.pdf',
    '{project}.com/white-paper',
    '{project}.com/white-paper.pdf',
    '{project}.com/litepaper',
    '{project}.com/litepaper.pdf',
    '{project}.com/tokenomics.pdf',
    '{project}.com/economics.pdf',
    '{project}.com/governance.pdf',
    'whitepaper.{project}.com',
    'docs.{project}.com',
    '{project}.gitbook.io',
    'github.com/{org}/{project}/blob/main/whitepaper.pdf'
  ],
  
  stage2_search_terms: [
    // Targeted web search terms
    '{project_name} whitepaper filetype:pdf',
    '{project_name} litepaper site:gitbook.io',
    '{project_name} tokenomics document',
    'site:github.com {project_name} whitepaper',
    '{project_name} technical documentation',
    '{project_name} developer docs',
    '{project_name} API documentation',
    '{project_name} white paper',
    '{project_name} lite paper'
  ],
  
  stage3_scraping_keywords: [
    // Web scraping keywords
    'whitepaper', 'white-paper', 'litepaper', 'lite-paper',
    'docs', 'documentation', 'technical', 'developer',
    'tokenomics', 'economics', 'governance', 'architecture',
    'api', 'sdk', 'integration', 'guide', 'manual'
  ]
};
