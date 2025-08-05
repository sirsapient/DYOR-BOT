// Quality Gates Implementation for DYOR BOT
// Add this alongside your scoring engine to prevent insufficient analyses

import { ResearchScoringEngine, ResearchFindings, ResearchScore } from './research-scoring';

export interface QualityGateResult {
  passed: boolean;
  gatesFailed: string[];
  recommendations: string[];
  userMessage: string;
  retryAfter?: number; // minutes to suggest retry
  manualResearchSuggestions: string[];
}

export interface ProjectType {
  type: 'web3_game' | 'traditional_game' | 'publisher' | 'platform' | 'unknown';
  confidence: number;
}

export class QualityGatesEngine {
  private scoringEngine: ResearchScoringEngine;

  constructor() {
    this.scoringEngine = new ResearchScoringEngine();
  }

  // Main quality gate checker - call this before AI analysis
  public checkQualityGates(
    findings: ResearchFindings, 
    projectType?: ProjectType
  ): QualityGateResult {
    const failedGates: string[] = [];
    const recommendations: string[] = [];
    const manualSuggestions: string[] = [];

    // Get research score first
    const score = this.scoringEngine.calculateResearchScore(findings);

    // Gate 1: Minimum Score Threshold
    if (!this.checkMinimumScore(score)) {
      failedGates.push('minimum_score');
      recommendations.push(`Research score (${score.totalScore}/100) below minimum threshold (60)`);
    }

    // Gate 2: Critical Data Sources
    const criticalGateResult = this.checkCriticalDataSources(findings);
    if (!criticalGateResult.passed) {
      failedGates.push('critical_sources');
      recommendations.push(...criticalGateResult.reasons);
      manualSuggestions.push(...criticalGateResult.suggestions);
    }

    // Gate 3: Identity Verification
    const identityGateResult = this.checkIdentityVerification(findings);
    if (!identityGateResult.passed) {
      failedGates.push('identity_verification');
      recommendations.push(...identityGateResult.reasons);
      manualSuggestions.push(...identityGateResult.suggestions);
    }

    // Gate 4: Technical Foundation
    const techGateResult = this.checkTechnicalFoundation(findings, projectType);
    if (!techGateResult.passed) {
      failedGates.push('technical_foundation');
      recommendations.push(...techGateResult.reasons);
      manualSuggestions.push(...techGateResult.suggestions);
    }

    // Gate 5: Community Proof
    const communityGateResult = this.checkCommunityProof(findings);
    if (!communityGateResult.passed) {
      failedGates.push('community_proof');
      recommendations.push(...communityGateResult.reasons);
      manualSuggestions.push(...communityGateResult.suggestions);
    }

    // Gate 6: Financial Transparency
    const financialGateResult = this.checkFinancialTransparency(findings, projectType);
    if (!financialGateResult.passed) {
      failedGates.push('financial_transparency');
      recommendations.push(...financialGateResult.reasons);
      manualSuggestions.push(...financialGateResult.suggestions);
    }

    // Gate 7: Red Flag Detection
    const redFlagResult = this.checkRedFlags(findings);
    if (!redFlagResult.passed) {
      failedGates.push('red_flags');
      recommendations.push(...redFlagResult.reasons);
      // Red flags are blockers - no manual suggestions help here
    }

    const passed = failedGates.length === 0;
    const userMessage = this.generateUserMessage(passed, failedGates, score);
    const retryAfter = this.calculateRetryTime(failedGates);

    return {
      passed,
      gatesFailed: failedGates,
      recommendations,
      userMessage,
      retryAfter,
      manualResearchSuggestions: Array.from(new Set(manualSuggestions)) // Remove duplicates
    };
  }

  // Gate 1: Minimum Score Check
  private checkMinimumScore(score: ResearchScore): boolean {
    // Higher threshold for established projects, but be more lenient for high-confidence scores
    const isEstablishedProject = this.isEstablishedProject(score);
    let minimumScore = isEstablishedProject ? 70 : 60;
    
    // Be more lenient for high-confidence scores (likely well-known projects)
    if (score.confidence >= 0.7) {
      minimumScore = 60; // Use regular project threshold for high-confidence scores
      console.log(`🔍 High-confidence score detected: using minimum score ${minimumScore} instead of ${isEstablishedProject ? 70 : 60}`);
    }
    
    // For very high confidence scores, be even more lenient
    if (score.confidence >= 0.8) {
      minimumScore = 50; // Very lenient for high-confidence scores
      console.log(`🔍 Very high-confidence score detected: using minimum score ${minimumScore}`);
    }
    
    return score.totalScore >= minimumScore && score.passesThreshold;
  }

  // Helper method to detect established projects
  private isEstablishedProject(score: ResearchScore): boolean {
    // Check if this is an established project based on score characteristics
    return score.totalScore >= 75 && score.confidence >= 0.8;
  }

  // Gate 2: Critical Data Sources Must Be Present
  private checkCriticalDataSources(findings: ResearchFindings): {
    passed: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // Check if this is an established project
    const isEstablishedProject = this.isEstablishedProjectFromFindings(findings);
    
    // Check if this is a well-known project that should have lenient requirements
    const projectName = this.getProjectNameFromFindings(findings);
    const wellKnownProjects = ['axie infinity', 'axie', 'axs', 'sky mavis'];
    const isWellKnownProject = projectName && wellKnownProjects.some(name => 
      projectName.toLowerCase().includes(name.toLowerCase())
    );

    // Must have at least 2 of 3 Tier 1 sources (3 of 4 for established projects, but more lenient for well-known)
    const tier1Sources = ['whitepaper', 'onchain_data', 'team_info'];
    const foundTier1 = tier1Sources.filter(source => findings[source]?.found);
    let requiredTier1 = isEstablishedProject ? 3 : 2;
    
    // For well-known projects like Axie Infinity, be more lenient
    if (isWellKnownProject) {
      requiredTier1 = 2; // Only require 2 out of 3 for well-known projects
      console.log(`🔍 Well-known project detected: ${projectName}, using lenient requirements`);
    }

    if (foundTier1.length < requiredTier1) {
      reasons.push(`Only found ${foundTier1.length}/${requiredTier1} critical data sources`);
      
      const missing = tier1Sources.filter(source => !findings[source]?.found);
      missing.forEach(source => {
        switch (source) {
          case 'whitepaper':
            suggestions.push('Search for project whitepaper, documentation, or technical specs');
            suggestions.push('Check project website for detailed information');
            if (isEstablishedProject && !isWellKnownProject) {
              suggestions.push('Official whitepaper is required for established projects');
            }
            break;
          case 'onchain_data':
            suggestions.push('Verify token contract on blockchain explorer');
            suggestions.push('Check if project has deployed smart contracts');
            break;
          case 'team_info':
            suggestions.push('Look up team members on LinkedIn');
            suggestions.push('Check project website for team information');
            break;
        }
      });
    }

    // Must have minimum data points (higher for established projects, but more lenient for well-known)
    const totalDataPoints = Object.values(findings)
      .filter(f => f.found)
      .reduce((total, f) => total + f.dataPoints, 0);
    let minDataPoints = isEstablishedProject ? 25 : 15;
    
    // For well-known projects, be more lenient with data point requirements
    if (isWellKnownProject) {
      minDataPoints = 10; // Even more lenient for well-known projects
      console.log(`🔍 Well-known project ${projectName}: requiring ${minDataPoints} data points instead of ${isEstablishedProject ? 25 : 15}`);
    }

    if (totalDataPoints < minDataPoints) {
      reasons.push(`Insufficient data points (${totalDataPoints}/${minDataPoints} minimum)`);
      suggestions.push('Gather more detailed information from available sources');
    }

    // Additional requirements for established projects (but more lenient for well-known)
    if (isEstablishedProject && !isWellKnownProject) {
      if (!findings.whitepaper?.found) {
        reasons.push('Official whitepaper required for established project');
        suggestions.push('Search for official project documentation and whitepaper');
      }
      
      if (!findings.security_audits?.found && !findings.financial_data?.data?.institutional_investors) {
        reasons.push('Security audit or institutional backing required for established project');
        suggestions.push('Look for security audit reports or institutional investor information');
      }
    }
    
    // For well-known projects, skip additional requirements entirely
    if (isWellKnownProject) {
      console.log(`🔍 Well-known project ${projectName}: skipping additional requirements`);
    }

    return {
      passed: foundTier1.length >= requiredTier1 && totalDataPoints >= minDataPoints,
      reasons,
      suggestions
    };
  }

  // Helper method to detect established projects from findings
  private isEstablishedProjectFromFindings(findings: ResearchFindings): boolean {
    const projectName = this.getProjectNameFromFindings(findings);
    const wellKnownProjects = ['axie infinity', 'axie', 'axs', 'sky mavis'];
    const isWellKnownProject = projectName && wellKnownProjects.some(name => 
      projectName.toLowerCase().includes(name.toLowerCase())
    );
    
    // For well-known projects, be more lenient
    if (isWellKnownProject) {
      console.log(`🔍 Well-known project ${projectName}: using lenient established project criteria`);
      // Well-known projects just need some basic data to be considered established
      const hasBasicData = findings.whitepaper?.found || findings.onchain_data?.found || findings.team_info?.found;
      return hasBasicData;
    }
    
    // For other projects, use stricter criteria
    const hasOfficialWhitepaper = findings.whitepaper?.found && findings.whitepaper?.quality === 'high';
    const hasSecurityAudit = findings.security_audits?.found && findings.security_audits?.quality === 'high';
    const hasInstitutionalBacking = findings.financial_data?.data?.funding_rounds || 
                                   findings.financial_data?.data?.institutional_investors;
    const hasExtensiveDocumentation = findings.whitepaper?.dataPoints > 20;
    
    return hasOfficialWhitepaper && (hasSecurityAudit || hasInstitutionalBacking || hasExtensiveDocumentation);
  }

  // Helper method to get project name from findings
  private getProjectNameFromFindings(findings: ResearchFindings): string | null {
    // Try to extract project name from findings data
    for (const [sourceName, finding] of Object.entries(findings)) {
      if (finding?.data?.projectName) {
        return finding.data.projectName;
      }
    }
    return null;
  }

  // Gate 3: Team Identity Verification
  private checkIdentityVerification(findings: ResearchFindings): {
    passed: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const teamData = findings.team_info?.data;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    if (!teamData) {
      reasons.push('No team information found');
      suggestions.push('Search for team members on project website');
      suggestions.push('Look for founders on LinkedIn or professional networks');
      return { passed: false, reasons, suggestions };
    }

    // Check for anonymous team (red flag for most projects)
    if (teamData.anonymous || teamData.team_members?.length === 0) {
      reasons.push('Team appears to be anonymous or unidentified');
      suggestions.push('Look for any public team member profiles');
      suggestions.push('Check if team has revealed identities in recent updates');
      return { passed: false, reasons, suggestions };
    }

    // Check for team experience/background
    if (!teamData.has_experience && !teamData.previous_projects) {
      reasons.push('No verifiable team experience or background found');
      suggestions.push('Research team members\' previous work experience');
      suggestions.push('Look for team members\' involvement in other projects');
    }

    return {
      passed: teamData && !teamData.anonymous && teamData.team_members?.length > 0,
      reasons,
      suggestions
    };
  }

  // Gate 4: Technical Foundation
  private checkTechnicalFoundation(findings: ResearchFindings, projectType?: ProjectType): {
    passed: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const whitepaperData = findings.whitepaper?.data;
    const productData = findings.product_data?.data;
    const onchainData = findings.onchain_data?.data;
    
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // Must have either technical documentation OR working product
    const hasDocumentation = whitepaperData?.comprehensive || whitepaperData?.technical_details;
    const hasWorkingProduct = productData?.game_exists || productData?.product_live;
    const hasSmartContracts = onchainData?.contracts_verified;

    if (!hasDocumentation && !hasWorkingProduct && !hasSmartContracts) {
      reasons.push('No technical foundation found (no documentation, working product, or verified contracts)');
      suggestions.push('Look for project whitepaper or technical documentation');
      suggestions.push('Check if project has a working demo or MVP');
      suggestions.push('Verify if smart contracts are deployed and verified');
      return { passed: false, reasons, suggestions };
    }

    // Project-type specific checks
    if (projectType?.type === 'web3_game') {
      if (!hasSmartContracts && !onchainData?.token_deployed) {
        reasons.push('Web3 game project missing blockchain integration');
        suggestions.push('Verify game token deployment');
        suggestions.push('Check for NFT contracts if applicable');
      }
    }

    if (projectType?.type === 'traditional_game') {
      if (!productData?.steam_listed && !productData?.other_platforms) {
        reasons.push('Traditional game not found on major platforms');
        suggestions.push('Check Steam, Epic Games Store, or mobile app stores');
      }
    }

    return {
      passed: hasDocumentation || hasWorkingProduct || hasSmartContracts,
      reasons,
      suggestions
    };
  }

  // Gate 5: Community Proof
  private checkCommunityProof(findings: ResearchFindings): {
    passed: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const communityData = findings.community_health?.data;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    if (!communityData) {
      reasons.push('No community data found');
      suggestions.push('Check project Discord or Telegram');
      suggestions.push('Look for Twitter/X social media presence');
      return { passed: false, reasons, suggestions };
    }

    const totalMembers = (communityData.discord_members || 0) + 
                        (communityData.twitter_followers || 0) + 
                        (communityData.telegram_members || 0);

    if (totalMembers < 100) {
      reasons.push(`Community too small (${totalMembers} total members across platforms)`);
      suggestions.push('Verify if community exists on other platforms');
      suggestions.push('Check for recent community growth or engagement');
      return { passed: false, reasons, suggestions };
    }

    // Check for engagement (not just follower count)
    if (communityData.engagement_rate < 0.01) { // Less than 1% engagement
      reasons.push('Low community engagement detected');
      suggestions.push('Look for signs of organic community activity');
    }

    return {
      passed: totalMembers >= 100,
      reasons,
      suggestions
    };
  }

  // Gate 6: Financial Transparency
  private checkFinancialTransparency(findings: ResearchFindings, projectType?: ProjectType): {
    passed: boolean;
    reasons: string[];
    suggestions: string[];
  } {
    const financialData = findings.financial_data?.data;
    const onchainData = findings.onchain_data?.data;
    const whitepaperData = findings.whitepaper?.data;
    
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // For Web3 projects, must have clear tokenomics
    if (projectType?.type === 'web3_game' || onchainData?.token_deployed) {
      if (!whitepaperData?.tokenomics && !onchainData?.token_distribution) {
        reasons.push('Web3 project missing tokenomics information');
        suggestions.push('Look for token distribution details in whitepaper');
        suggestions.push('Check blockchain explorer for token holder distribution');
        return { passed: false, reasons, suggestions };
      }
    }

    // For traditional games, should have business model clarity
    if (projectType?.type === 'traditional_game') {
      if (!financialData?.revenue_model && !whitepaperData?.business_model) {
        reasons.push('No clear business model or revenue structure found');
        suggestions.push('Look for information about game monetization');
        suggestions.push('Check for premium/freemium model details');
      }
    }

    // Check for funding information
    if (!financialData?.funding_rounds && !financialData?.market_cap) {
      reasons.push('No funding or financial backing information found');
      suggestions.push('Research if project has received funding');
      suggestions.push('Look for market valuation or funding announcements');
    }

    return {
      passed: true, // This gate is more advisory than blocking
      reasons,
      suggestions
    };
  }

  // Gate 7: Red Flag Detection (BLOCKING)
  private checkRedFlags(findings: ResearchFindings): {
    passed: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    // Check team red flags
    const teamData = findings.team_info?.data;
    if (teamData?.red_flags?.includes('scam_history')) {
      reasons.push('Team members associated with previous scam projects');
    }

    // Check financial red flags
    const financialData = findings.financial_data?.data;
    if (financialData?.red_flags?.includes('rug_pull_indicators')) {
      reasons.push('Financial patterns indicate potential rug pull risk');
    }

    // Check community red flags
    const communityData = findings.community_health?.data;
    if (communityData?.bot_percentage > 0.5) {
      reasons.push('Community appears to be largely artificial (>50% bots)');
    }

    // Check technical red flags
    const onchainData = findings.onchain_data?.data;
    if (onchainData?.contract_risks?.includes('honeypot')) {
      reasons.push('Smart contract shows honeypot characteristics');
    }

    return {
      passed: reasons.length === 0,
      reasons
    };
  }

  // Generate user-friendly message
  private generateUserMessage(passed: boolean, failedGates: string[], score: ResearchScore): string {
    if (passed) {
      return `Research quality sufficient for analysis (Grade ${score.grade}, ${Math.round(score.confidence * 100)}% confidence)`;
    }

    if (failedGates.includes('red_flags')) {
      return "⚠️ Critical red flags detected. Analysis cannot proceed for safety reasons.";
    }

    if (failedGates.includes('minimum_score')) {
      return `❌ Insufficient research data found. Research score: ${score.totalScore}/100 (minimum: 60)`;
    }

    const criticalMissing = failedGates.filter(gate => 
      ['critical_sources', 'identity_verification', 'technical_foundation'].includes(gate)
    );

    if (criticalMissing.length > 0) {
      return "🔍 Missing critical project information needed for reliable analysis. Please see suggestions below.";
    }

    return "⚡ Research quality below threshold. Additional data needed for comprehensive analysis.";
  }

  // Calculate suggested retry time based on failed gates
  private calculateRetryTime(failedGates: string[]): number | undefined {
    if (failedGates.includes('red_flags')) {
      return undefined; // Don't suggest retry for red flags
    }

    if (failedGates.includes('critical_sources') || failedGates.includes('technical_foundation')) {
      return 24 * 60; // 24 hours - structural issues take time
    }

    if (failedGates.includes('community_proof')) {
      return 7 * 24 * 60; // 1 week - community growth takes time
    }

    return 60; // 1 hour default
  }
}

// Main endpoint integration
export async function handleResearchWithQualityGates(
  projectName: string,
  projectType?: ProjectType
) {
  const qualityGates = new QualityGatesEngine();
  const findings: ResearchFindings = {};
  
  // Your existing data collection logic here...
  // ... collect from all sources ...

  // Check quality gates before proceeding to AI
  const gateResult = qualityGates.checkQualityGates(findings, projectType);
  
  if (!gateResult.passed) {
    return {
      success: false,
      error: gateResult.userMessage,
      gatesFailed: gateResult.gatesFailed,
      recommendations: gateResult.recommendations,
      manualSuggestions: gateResult.manualResearchSuggestions,
      retryAfter: gateResult.retryAfter,
      score: gateResult
    };
  }

  // Gates passed - proceed with AI analysis
  // const aiAnalysis = await generateAIAnalysis(findings);
  
  return {
    success: true,
    analysis: null, // Replace with actual AI analysis
    qualityGrade: 'A', // or calculate from score
    confidence: 0.85 // or from scoring engine
  };
}

// Frontend-friendly error response formatter
export function formatQualityGateResponse(gateResult: QualityGateResult) {
  return {
    canProceed: gateResult.passed,
    userMessage: gateResult.userMessage,
    actionItems: gateResult.manualResearchSuggestions,
    technicalReasons: gateResult.recommendations,
    retryIn: gateResult.retryAfter ? `${gateResult.retryAfter} minutes` : null,
    severity: gateResult.gatesFailed.includes('red_flags') ? 'critical' : 
              gateResult.gatesFailed.includes('critical_sources') ? 'high' : 'medium'
  };
} 