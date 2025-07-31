// AI-First Research Orchestration for DYOR BOT
// This system uses AI to plan and optimize research before data collection

import Anthropic from '@anthropic-ai/sdk';
import { QualityGatesEngine } from './quality-gates';
import { ResearchFindings } from './research-scoring';
import { ResearchScoringEngine } from './research-scoring';



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

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.qualityGates = new QualityGatesEngine();
    this.scoringEngine = new ResearchScoringEngine();
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
    // Check if this is an established project
    const isEstablishedProject = this.isEstablishedProject(projectName);
    
    return `You are a research strategist for a Web3/Gaming project analysis bot. Your job is to create an optimal research plan.

PROJECT TO RESEARCH: "${projectName}"
${basicInfo ? `
BASIC INFO FOUND:
- Website: ${basicInfo.website || 'Unknown'}
- Description: ${basicInfo.description || 'None found'}
- Social Links: ${JSON.stringify(basicInfo.socialLinks || {})}
- Known Aliases: ${basicInfo.aliases?.join(', ') || 'None'}` : ''}

${isEstablishedProject ? `
ESTABLISHED PROJECT DETECTED: This appears to be an established project with extensive documentation available.
ENHANCED RESEARCH APPROACH: Focus on official sources, comprehensive documentation, and institutional backing.
SPECIAL CONSIDERATIONS:
- Higher confidence thresholds apply
- Official documentation should be prioritized
- Security audits and team verification are critical
- Post-incident handling (if applicable) should be evaluated positively` : ''}

AVAILABLE DATA SOURCES:
1. Whitepaper/Documentation (Tier 1) - Official project docs, tokenomics, roadmap
2. On-chain Data (Tier 1) - Contract verification, token metrics, holder data
3. Team Information (Tier 1) - LinkedIn profiles, backgrounds, previous projects
4. Community Health (Tier 2) - Discord/Twitter/Telegram engagement
5. Financial Data (Tier 2) - Market cap, funding, trading metrics
6. Product Data (Tier 2) - Steam stats, game reviews, user metrics
7. Security Audits (Tier 3) - CertiK, Immunefi audit reports
8. Media Coverage (Tier 3) - News articles, influencer coverage
9. Social Signals (Tier 3) - Reddit sentiment, YouTube engagement

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
      "searchTerms": ["tokenomics", "whitepaper", "documentation"],
      "expectedDataPoints": ["token_distribution", "roadmap", "use_cases"]
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
  "estimatedResearchTime": ${isEstablishedProject ? '25' : '15'},
  "successCriteria": {
    "minimumSources": ${isEstablishedProject ? '6' : '5'},
    "criticalDataPoints": ["team_verified", "tokenomics_clear", "community_active"${isEstablishedProject ? ', "security_audited", "funding_verified"' : ''}],
    "redFlagChecks": ["scam_history", "rug_pull_indicators", "fake_partnerships"]
  }
}

Focus on:
1. Project type classification (affects research priorities)
2. Most important sources for THIS specific project type
3. Key risk areas to investigate
4. Alternative names/tickers to search
5. Realistic research goals given available sources
${isEstablishedProject ? `
6. For established projects: Prioritize official documentation and institutional backing
7. Evaluate post-incident handling positively if project has recovered from setbacks` : ''}`;
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

    return `You are monitoring an ongoing research process. Based on what we've found so far, should we continue collecting data or is it sufficient?

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

Provide a JSON response:
{
  "shouldContinue": true,
  "reasoning": "Still missing critical team data...",
  "nextPriority": ["team_info", "community_health"],
  "timeRecommendation": 10,
  "adjustments": {
    "newSearchTerms": ["alternative_names"],
    "focusAreas": ["team_verification"],
    "skipSources": ["media_coverage"]
  },
  "qualityAssessment": "sufficient|needs_more|insufficient"
}

Decide based on:
1. Do we have enough for minimum viable analysis?
2. Are we hitting diminishing returns?
3. Are there critical gaps that more research could fill?
4. Is the time investment worth the potential data quality gain?`;
  }

  // Build final completeness assessment prompt
  private buildCompletenessPrompt(
    plan: ResearchPlan,
    findings: ResearchFindings,
    gateResult: any
  ): string {
    return `Final research completeness assessment needed.

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
  "recommendations": ["Proceed with analysis", "Note confidence level in results"]
}

Consider:
1. Did we meet the original success criteria?
2. Are any gaps critical enough to block analysis?
3. What's our confidence level in the final dataset?
4. Should we recommend proceeding or gathering more data?`;
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
      'gala games', 'gala'
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
}

// Main orchestrated research function
export async function conductAIOrchestratedResearch(
  projectName: string,
  anthropicApiKey: string,
  basicInfo?: BasicProjectInfo
) {
  const orchestrator = new AIResearchOrchestrator(anthropicApiKey);
  const findings: ResearchFindings = {};
  
  
  
  // Phase 1: Get AI research strategy
  const researchPlan = await orchestrator.generateResearchPlan(projectName, basicInfo);
  
  const startTime = Date.now();
  let shouldContinue = true;
  let adaptiveState: AdaptiveResearchState | null = null;
  
  // Phase 2: Execute research with AI adaptation
  for (const prioritySource of researchPlan.prioritySources) {
    if (!shouldContinue) break;
    
    const timeElapsed = Math.floor((Date.now() - startTime) / 60000);
    
    // Collect data from this source (your existing collection logic)
    const sourceData = await collectFromSource(
      prioritySource.source, 
      prioritySource.searchTerms,
      researchPlan.searchAliases
    );
    
    findings[prioritySource.source] = sourceData;
    
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
  
  // Phase 3: Final completeness check
  const completeness = await orchestrator.assessResearchCompleteness(researchPlan, findings);
  
  if (!completeness.isComplete) {
    return {
      success: false,
      reason: 'Insufficient research quality after AI-guided collection',
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
async function collectFromSource(
  sourceName: string, 
  searchTerms: string[], 
  aliases: string[]
): Promise<any> {
  // This would integrate with your existing data collection functions
  // Return in the ResearchFindings format
  
  // Placeholder - replace with your actual collection logic
  return {
    found: Math.random() > 0.3, // Simulate success rate
    data: { example: 'data' },
    quality: 'medium',
    timestamp: new Date(),
    dataPoints: Math.floor(Math.random() * 10) + 5
  };
}

export { AIResearchOrchestrator, AdaptiveResearchState, BasicProjectInfo }; 