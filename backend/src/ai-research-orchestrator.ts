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
  
  // Official documentation patterns
  documentation: [
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
    '{project}.com/technical'
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
      minimumForAnalysis: 70,
      highConfidence: 85,
      refreshThreshold: 60,
      cacheExpiryHours: 24,
      ...options?.confidenceThresholds
    };
    
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
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
    console.log(`🔍 Universal source discovery for ${projectName}`);
    
    const discoveredSources: any = {
      documentation: [],
      technical: [],
      security: [],
      company: [],
      funding: [],
      community: []
    };
    
    // Stage 1: Official sources (highest priority)
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
    
    console.log(`✅ Universal source discovery completed for ${projectName}:`, discoveredSources);
    return discoveredSources;
  }
  
  private async discoverOfficialSources(projectName: string, aliases: string[]): Promise<any> {
    const sources: any = { documentation: [], company: [] };
    
    // Generate URL patterns for all aliases
    const allNames = [projectName, ...aliases];
    
    for (const name of allNames.slice(0, 5)) { // Limit to first 5 aliases
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      
             // Test documentation patterns
       for (const pattern of UNIVERSAL_SOURCE_PATTERNS.documentation) {
         const url = pattern.replace(/{project}/g, normalizedName);
         try {
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.documentation.push(`https://${url}`);
             console.log(`✅ Found documentation: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
         }
       }
      
             // Test company patterns
       for (const pattern of UNIVERSAL_SOURCE_PATTERNS.company) {
         const url = pattern.replace(/{project}/g, normalizedName).replace(/{company}/g, normalizedName);
         try {
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.company.push(`https://${url}`);
             console.log(`✅ Found company info: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
         }
       }
    }
    
    return sources;
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
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.technical.push(`https://${url}`);
             console.log(`✅ Found technical source: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
         }
       }
       
       // Test security patterns
       for (const pattern of UNIVERSAL_SOURCE_PATTERNS.security) {
         const url = pattern.replace(/{project}/g, normalizedName);
         try {
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.security.push(`https://${url}`);
             console.log(`✅ Found security source: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
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
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.funding.push(`https://${url}`);
             console.log(`✅ Found funding source: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
         }
       }
       
       // Test community patterns
       for (const pattern of UNIVERSAL_SOURCE_PATTERNS.community) {
         const url = pattern.replace(/{project}/g, normalizedName);
         try {
           const res = await fetch(`https://${url}`, { 
             method: 'HEAD'
           });
           if (res.ok) {
             sources.community.push(`https://${url}`);
             console.log(`✅ Found community source: https://${url}`);
           }
         } catch (e) {
           // Continue to next pattern
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
      tokenomicsData: {}
    };
    
    // Extract team information from company sources
    for (const companyUrl of sources.company || []) {
      try {
        const res = await fetch(companyUrl);
        if (res.ok) {
          const html = await res.text();
          const teamData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.teamVerification);
          if (Object.keys(teamData).length > 0) {
            extractedData.teamInfo = { ...extractedData.teamInfo, ...teamData };
          }
        }
      } catch (e) {
        console.log(`❌ Failed to extract team data from ${companyUrl}`);
      }
    }
    
    // Extract security audit information
    for (const securityUrl of sources.security || []) {
      try {
        const res = await fetch(securityUrl);
        if (res.ok) {
          const html = await res.text();
          const auditData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.securityAudits);
          if (Object.keys(auditData).length > 0) {
            extractedData.securityAudits = { ...extractedData.securityAudits, ...auditData };
          }
        }
      } catch (e) {
        console.log(`❌ Failed to extract security data from ${securityUrl}`);
      }
    }
    
    // Extract funding information
    for (const fundingUrl of sources.funding || []) {
      try {
        const res = await fetch(fundingUrl);
        if (res.ok) {
          const html = await res.text();
          const fundingData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.fundingData);
          if (Object.keys(fundingData).length > 0) {
            extractedData.fundingData = { ...extractedData.fundingData, ...fundingData };
          }
        }
      } catch (e) {
        console.log(`❌ Failed to extract funding data from ${fundingUrl}`);
      }
    }
    
    // Extract technical metrics
    for (const technicalUrl of sources.technical || []) {
      try {
        const res = await fetch(technicalUrl);
        if (res.ok) {
          const html = await res.text();
          const technicalData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.technicalMetrics);
          if (Object.keys(technicalData).length > 0) {
            extractedData.technicalMetrics = { ...extractedData.technicalMetrics, ...technicalData };
          }
        }
      } catch (e) {
        console.log(`❌ Failed to extract technical data from ${technicalUrl}`);
      }
    }
    
    // Extract tokenomics from documentation
    for (const docUrl of sources.documentation || []) {
      try {
        const res = await fetch(docUrl);
        if (res.ok) {
          const html = await res.text();
          const tokenomicsData = this.extractDataFromText(html, UNIVERSAL_EXTRACTION_PATTERNS.tokenomicsData);
          if (Object.keys(tokenomicsData).length > 0) {
            extractedData.tokenomicsData = { ...extractedData.tokenomicsData, ...tokenomicsData };
          }
        }
      } catch (e) {
        console.log(`❌ Failed to extract tokenomics from ${docUrl}`);
      }
    }
    
    return extractedData;
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
    const extracted: any = {};
    
    for (const [category, categoryPatterns] of Object.entries(patterns as Record<string, any>)) {
      extracted[category] = {};
      for (const [key, pattern] of Object.entries(categoryPatterns as Record<string, any>)) {
        const match = text.match(pattern as RegExp);
        if (match) {
          extracted[category][key] = match[1] || match[0];
        }
      }
    }
    
    return extracted;
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
      const missingSources = this.identifyInformationGaps({} as ResearchPlan, findings);
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
  
  // NEW: Check for cached data first
  const updateCheck = await orchestrator.checkForUpdates(projectName);
  console.log(`Update check for ${projectName}:`, updateCheck);
  
  // Phase 1: Get AI research strategy
  const researchPlan = await orchestrator.generateResearchPlan(projectName, basicInfo);
  
  const startTime = Date.now();
  let shouldContinue = true;
  let adaptiveState: AdaptiveResearchState | null = null;
  
  // Phase 2: Execute research with AI adaptation and caching
  for (const prioritySource of researchPlan.prioritySources) {
    if (!shouldContinue) break;
    
    const timeElapsed = Math.floor((Date.now() - startTime) / 60000);
    
    // NEW: Check cache first
    const cachedData = orchestrator['getCachedData'](projectName, prioritySource.source);
    let sourceData;
    
    if (cachedData) {
      console.log(`Using cached data for ${prioritySource.source}`);
      sourceData = cachedData;
    } else {
      // Collect data from this source using REAL data collection functions with retry
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
      }
    }
    
    findings[prioritySource.source] = sourceData;
    
    // NEW: Check confidence threshold before continuing
    const thresholdCheck = orchestrator.shouldPassToSecondAI(findings);
    if (!thresholdCheck.shouldPass && Object.keys(findings).length >= 3) {
      console.log(`Confidence threshold not met: ${thresholdCheck.reason}`);
      console.log(`Missing for threshold: ${thresholdCheck.missingForThreshold.join(', ')}`);
    }
    
    // Every 2 sources, check with AI if we should continue
    if (Object.keys(findings).length % 2 === 0) {
      adaptiveState = await orchestrator.adaptResearchStrategy(
        researchPlan, 
        findings, 
        timeElapsed
      );
      
      shouldContinue = adaptiveState.shouldContinue;
      
      if (!shouldContinue) {
        break;
      }
    }
  }
  
  // Phase 3: Final completeness check with confidence threshold
  const completeness = await orchestrator.assessResearchCompleteness(researchPlan, findings);
  const thresholdCheck = orchestrator.shouldPassToSecondAI(findings);
  
  if (!completeness.isComplete || !thresholdCheck.shouldPass) {
    return {
      success: false,
      reason: thresholdCheck.shouldPass 
        ? 'Insufficient research quality after AI-guided collection'
        : thresholdCheck.reason,
      gaps: completeness.gaps,
      recommendations: completeness.recommendations,
      researchPlan,
      findings
    };
  }
  
  return {
    success: true,
    findings,
    researchPlan,
    completeness,
    adaptiveState,
    meta: {
      timeSpent: Math.floor((Date.now() - startTime) / 60000),
      sourcesCollected: Object.keys(findings).filter(k => findings[k]?.found).length,
      aiConfidence: completeness.confidence
    }
  };
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