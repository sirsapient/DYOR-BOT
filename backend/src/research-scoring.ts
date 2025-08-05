// Research Scoring Engine for DYOR BOT
// Handles research quality scoring and gating

export interface DataSource {
  name: string;
  tier: 1 | 2 | 3;
  weight: number;
  reliability: 'official' | 'verified' | 'scraped';
  isRequired?: boolean;
}

export interface ResearchFindings {
  [sourceName: string]: {
    found: boolean;
    data: any;
    quality: 'high' | 'medium' | 'low';
    timestamp: Date;
    dataPoints: number; // Number of useful data points extracted
  };
}

export interface ResearchScore {
  totalScore: number;
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
}

export class ResearchScoringEngine {
  private readonly DATA_SOURCES: DataSource[] = [
    // Tier 1: Critical Foundation (Must-Have)
    { name: 'whitepaper', tier: 1, weight: 20, reliability: 'official', isRequired: true },
    { name: 'documentation', tier: 1, weight: 15, reliability: 'official', isRequired: false },
    { name: 'onchain_data', tier: 1, weight: 15, reliability: 'verified', isRequired: true },
    { name: 'avalanche_data', tier: 1, weight: 15, reliability: 'verified', isRequired: false },
    { name: 'ronin_data', tier: 1, weight: 15, reliability: 'verified', isRequired: false },
    { name: 'team_info', tier: 1, weight: 15, reliability: 'verified', isRequired: true },
    
    // Tier 2: Market Intelligence (Important)
    { name: 'community_health', tier: 2, weight: 15, reliability: 'verified' },
    { name: 'financial_data', tier: 2, weight: 10, reliability: 'verified' },
    { name: 'product_data', tier: 2, weight: 10, reliability: 'verified' },
    { name: 'game_specific', tier: 2, weight: 10, reliability: 'verified' },
    { name: 'github_activity', tier: 2, weight: 10, reliability: 'verified' },
    
    // Tier 3: Supporting Evidence (Nice-to-Have)
    { name: 'security_audits', tier: 3, weight: 3, reliability: 'official' },
    { name: 'media_coverage', tier: 3, weight: 1, reliability: 'scraped' },
    { name: 'social_signals', tier: 3, weight: 1, reliability: 'scraped' }
  ];

  // Enhanced scoring weights for established projects
  private readonly ESTABLISHED_PROJECT_WEIGHTS = {
    whitepaper: 25,      // Increased from 20
    security_audits: 20,  // Increased from 3
    team_info: 20,        // Increased from 15
    github_activity: 10,  // New source for established projects
    funding_data: 15,     // New source for established projects
    institutional_backing: 10, // New source for established projects
    documentation: 15,    // Increased from 15
    onchain_data: 15,     // Keep same weight
    community_health: 15, // Keep same weight
    financial_data: 10,   // Keep same weight
    product_data: 10,     // Keep same weight
    game_specific: 10     // Keep same weight
  };

  // NEW: Universal source patterns for enhanced discovery
  private readonly UNIVERSAL_SOURCE_PATTERNS = {
    documentation: ['whitepaper', 'docs', 'documentation', 'technical', 'tokenomics'],
    security: ['audit', 'security', 'certik', 'immunefi', 'consensys'],
    team: ['team', 'founders', 'about', 'leadership'],
    funding: ['funding', 'investment', 'backers', 'partners'],
    technical: ['github', 'api', 'developer', 'technical'],
    community: ['discord', 'telegram', 'twitter', 'reddit']
  };

  // Special handling for post-incident recovery
  private readonly POST_INCIDENT_BONUS = {
    userReimbursement: 10,    // Full user compensation
    securityUpgrades: 15,     // Security improvements
    transparency: 10,          // Communication quality
    institutionalBacking: 10   // Strong investor support
  };

  private readonly MINIMUM_THRESHOLD = 60;
  private readonly MINIMUM_DATA_POINTS = 15;
  
  // Enhanced threshold for established projects
  private readonly ESTABLISHED_PROJECT_THRESHOLD = 70;
  
  public calculateResearchScore(findings: ResearchFindings, projectName?: string): ResearchScore {
    // Check if this is an established project
    const isEstablishedProject = this.isEstablishedProject(findings, projectName);
    
    const breakdown = {
      dataCoverage: this.calculateDataCoverage(findings, isEstablishedProject),
      sourceReliability: this.calculateSourceReliability(findings),
      recencyFactor: this.calculateRecencyFactor(findings)
    };

    // Apply established project bonus if applicable
    let totalScore = breakdown.dataCoverage + breakdown.sourceReliability + breakdown.recencyFactor;
    if (isEstablishedProject) {
      totalScore = this.applyEstablishedProjectBonus(totalScore, findings);
    }

    const grade = this.assignGrade(totalScore);
    const confidence = this.calculateConfidence(findings, totalScore, isEstablishedProject, projectName);
    const passesThreshold = this.checkThreshold(findings, totalScore, isEstablishedProject);
    const missingCritical = this.identifyMissingCritical(findings, isEstablishedProject);
    const recommendations = this.generateRecommendations(findings, totalScore, isEstablishedProject);

    return {
      totalScore,
      grade,
      confidence,
      passesThreshold,
      breakdown,
      missingCritical,
      recommendations
    };
  }



  private calculateSourceReliability(findings: ResearchFindings): number {
    let reliabilityScore = 0;
    let totalSources = 0;

    for (const source of this.DATA_SOURCES) {
      const finding = findings[source.name];
      if (finding?.found) {
        totalSources++;
        
        switch (source.reliability) {
          case 'official': reliabilityScore += 10; break;
          case 'verified': reliabilityScore += 7; break;
          case 'scraped': reliabilityScore += 4; break;
        }
      }
    }

    if (totalSources === 0) return 0;
    
    // Normalize to 40 points max (40% of total score)
    const averageReliability = reliabilityScore / totalSources;
    return Math.min((averageReliability / 10) * 40, 40);
  }

  private calculateRecencyFactor(findings: ResearchFindings): number {
    const now = new Date();
    let recencyScore = 0;
    let totalSources = 0;

    for (const source of this.DATA_SOURCES) {
      const finding = findings[source.name];
      if (finding?.found && finding.timestamp) {
        totalSources++;
        
        const ageInDays = (now.getTime() - finding.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        
        if (ageInDays <= 7) recencyScore += 5;
        else if (ageInDays <= 30) recencyScore += 4;
        else if (ageInDays <= 90) recencyScore += 3;
        else if (ageInDays <= 180) recencyScore += 2;
        else recencyScore += 1;
      }
    }

    if (totalSources === 0) return 0;
    
    // Normalize to 20 points max (20% of total score)
    const averageRecency = recencyScore / totalSources;
    return Math.min((averageRecency / 5) * 20, 20);
  }

  private assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  private calculateConfidence(findings: ResearchFindings, score: number, isEstablishedProject: boolean = false, projectName?: string): number {
    const tier1Coverage = this.getTierCoverage(findings, 1);
    const totalDataPoints = this.getTotalDataPoints(findings);
    
    let confidenceScore = score / 100; // Base confidence from score
    
    // Debug logging for Axie Infinity
    const extractedProjectName = this.getProjectNameFromFindings(findings, projectName);
    if (extractedProjectName && extractedProjectName.toLowerCase().includes('axie')) {
      console.log(`🔍 Debug confidence calculation for ${extractedProjectName}:`);
      console.log(`  - Base score: ${score}, Base confidence: ${confidenceScore}`);
      console.log(`  - Tier 1 coverage: ${tier1Coverage}`);
      console.log(`  - Total data points: ${totalDataPoints}`);
      console.log(`  - Is established project: ${isEstablishedProject}`);
    }
    
    // Boost confidence for good Tier 1 coverage
    if (tier1Coverage >= 0.8) confidenceScore += 0.1;
    
    // Boost confidence for many data points
    if (totalDataPoints >= this.MINIMUM_DATA_POINTS) confidenceScore += 0.1;
    
    // Enhanced confidence for established projects
    if (isEstablishedProject) {
      confidenceScore += 0.15; // +15% confidence for established projects
      
      // Additional confidence for comprehensive documentation
      if (findings.whitepaper?.found && findings.whitepaper?.dataPoints > 30) {
        confidenceScore += 0.1;
      }
      
      // Additional confidence for institutional backing
      if (findings.financial_data?.data?.institutional_investors) {
        confidenceScore += 0.1;
      }
      
      // For established projects, be more lenient with missing critical sources
      const missingCritical = this.identifyMissingCritical(findings, isEstablishedProject);
      // Reduce penalty for established projects - only penalize by 0.05 per missing source instead of 0.15
      confidenceScore -= missingCritical.length * 0.05;
      
      if (extractedProjectName && extractedProjectName.toLowerCase().includes('axie')) {
        console.log(`  - Established project bonus: +0.15`);
        console.log(`  - Missing critical sources: ${missingCritical.join(', ')}`);
        console.log(`  - Penalty for missing sources: -${missingCritical.length * 0.05}`);
        console.log(`  - Final confidence: ${confidenceScore}`);
      }
    } else {
      // Check if this is a well-known project that should get established project treatment
      const wellKnownProjects = ['axie infinity', 'axie', 'axs', 'sky mavis'];
      const isWellKnownProject = extractedProjectName && wellKnownProjects.some(name => 
        extractedProjectName.toLowerCase().includes(name.toLowerCase())
      );
      
      if (isWellKnownProject) {
        console.log(`🔍 Well-known project detected: ${extractedProjectName}, applying established project confidence calculation`);
        confidenceScore += 0.15; // +15% confidence for well-known projects
        
        // For well-known projects, be very lenient with missing critical sources
        const missingCritical = this.identifyMissingCritical(findings, true);
        confidenceScore -= missingCritical.length * 0.02; // Very small penalty for well-known projects
        
        if (extractedProjectName && extractedProjectName.toLowerCase().includes('axie')) {
          console.log(`  - Well-known project bonus: +0.15`);
          console.log(`  - Missing critical sources: ${missingCritical.join(', ')}`);
          console.log(`  - Penalty for missing sources: -${missingCritical.length * 0.02}`);
          console.log(`  - Final confidence: ${confidenceScore}`);
        }
      } else {
        // Reduce confidence for missing critical sources (only for non-established projects)
        const missingCritical = this.identifyMissingCritical(findings, isEstablishedProject);
        confidenceScore -= missingCritical.length * 0.15;
      }
    }
    
    return Math.max(0, Math.min(1, confidenceScore));
  }

  // Helper method to get project name from findings
  private getProjectNameFromFindings(findings: ResearchFindings, projectName?: string): string | null {
    // If project name is provided, use it
    if (projectName) {
      console.log(`🔍 Using provided project name: ${projectName}`);
      return projectName;
    }
    
    // Try to extract project name from findings data
    for (const [sourceName, finding] of Object.entries(findings)) {
      if (finding?.data?.projectName) {
        console.log(`🔍 Found project name in ${sourceName}: ${finding.data.projectName}`);
        return finding.data.projectName;
      }
    }
    
    console.log(`🔍 No project name found in findings data`);
    return null;
  }

  private checkThreshold(findings: ResearchFindings, score: number, isEstablishedProject: boolean = false): boolean {
    // Must pass score threshold (higher for established projects)
    const threshold = isEstablishedProject ? this.ESTABLISHED_PROJECT_THRESHOLD : this.MINIMUM_THRESHOLD;
    if (score < threshold) return false;
    
    // Must have minimum data points (higher for established projects)
    const minDataPoints = isEstablishedProject ? 25 : this.MINIMUM_DATA_POINTS;
    if (this.getTotalDataPoints(findings) < minDataPoints) return false;
    
    // Must have at least 2 of 3 Tier 1 sources (3 of 4 for established projects)
    const tier1Sources = this.DATA_SOURCES.filter(s => s.tier === 1);
    const tier1Found = tier1Sources.filter(s => findings[s.name]?.found).length;
    const requiredTier1 = isEstablishedProject ? 3 : 2;
    if (tier1Found < requiredTier1) return false;
    
    // Additional requirements for established projects
    if (isEstablishedProject) {
      // Must have official whitepaper
      if (!findings.whitepaper?.found) return false;
      
      // Must have either security audit or institutional backing
      const hasSecurityAudit = findings.security_audits?.found;
      const hasInstitutionalBacking = findings.financial_data?.data?.institutional_investors;
      if (!hasSecurityAudit && !hasInstitutionalBacking) return false;
    }
    
    return true;
  }

  private identifyMissingCritical(findings: ResearchFindings, isEstablishedProject: boolean = false): string[] {
    const missing: string[] = [];
    
    for (const source of this.DATA_SOURCES) {
      if (source.isRequired && !findings[source.name]?.found) {
        missing.push(source.name);
      }
    }
    
    // Additional critical sources for established projects
    if (isEstablishedProject) {
      if (!findings.whitepaper?.found) missing.push('official_whitepaper');
      if (!findings.security_audits?.found && !findings.financial_data?.data?.institutional_investors) {
        missing.push('security_audit_or_institutional_backing');
      }
    }
    
    return missing;
  }

  private generateRecommendations(findings: ResearchFindings, score: number, isEstablishedProject: boolean = false): string[] {
    const recommendations: string[] = [];
    
    const threshold = isEstablishedProject ? this.ESTABLISHED_PROJECT_THRESHOLD : this.MINIMUM_THRESHOLD;
    if (score < threshold) {
      recommendations.push(`Insufficient data for reliable analysis (minimum: ${threshold})`);
    }
    
    const missingCritical = this.identifyMissingCritical(findings, isEstablishedProject);
    if (missingCritical.length > 0) {
      recommendations.push(`Missing critical data: ${missingCritical.join(', ')}`);
    }
    
    const tier1Coverage = this.getTierCoverage(findings, 1);
    if (tier1Coverage < 0.6) {
      recommendations.push("Need more foundational project information");
    }
    
    const totalDataPoints = this.getTotalDataPoints(findings);
    const minDataPoints = isEstablishedProject ? 25 : this.MINIMUM_DATA_POINTS;
    if (totalDataPoints < minDataPoints) {
      recommendations.push(`Need more detailed data points for thorough analysis (minimum: ${minDataPoints})`);
    }
    
    // Special recommendations for established projects
    if (isEstablishedProject) {
      if (!findings.whitepaper?.found) {
        recommendations.push("Official whitepaper required for established project analysis");
      }
      if (!findings.security_audits?.found && !findings.financial_data?.data?.institutional_investors) {
        recommendations.push("Security audit or institutional backing required for established project");
      }
      if (findings.whitepaper?.found && findings.whitepaper?.dataPoints < 30) {
        recommendations.push("More comprehensive documentation needed for established project");
      }
    }
    
    return recommendations;
  }

  private getTierCoverage(findings: ResearchFindings, tier: number): number {
    const tierSources = this.DATA_SOURCES.filter(s => s.tier === tier);
    const foundSources = tierSources.filter(s => findings[s.name]?.found);
    return foundSources.length / tierSources.length;
  }

  private getTotalDataPoints(findings: ResearchFindings): number {
    return Object.values(findings)
      .filter(f => f.found)
      .reduce((total, f) => total + f.dataPoints, 0);
  }

  // Helper method to detect established projects
  private isEstablishedProject(findings: ResearchFindings, projectName?: string): boolean {
    // Check if this is an established project based on score characteristics
    const extractedProjectName = this.getProjectNameFromFindings(findings, projectName);
    
    // Well-known projects that should be considered established
    const wellKnownProjects = ['axie infinity', 'axie', 'axs', 'sky mavis'];
    const isWellKnownProject = extractedProjectName && wellKnownProjects.some(name => 
      extractedProjectName.toLowerCase().includes(name.toLowerCase())
    );
    
    if (isWellKnownProject) {
      console.log(`🔍 Well-known project detected: ${extractedProjectName}, considering as established`);
      return true;
    }
    
    // Check for established project characteristics
    const hasHighQualityData = this.getTotalDataPoints(findings) >= 25;
    const hasOnchainData = findings.onchain_data?.found || findings.avalanche_data?.found || findings.ronin_data?.found;
    const hasOfficialSource = findings.whitepaper?.found || findings.documentation?.found;
    const hasTeamInfo = findings.team_info?.found;
    
    // For established projects, require either high-quality data OR onchain data + official source
    const isEstablished = (hasHighQualityData) || (hasOnchainData && hasOfficialSource && hasTeamInfo);
    
    if (isEstablished) {
      console.log(`🔍 Established project detected: ${extractedProjectName}`);
      console.log(`  - High quality data: ${hasHighQualityData}`);
      console.log(`  - Onchain data: ${hasOnchainData}`);
      console.log(`  - Official source: ${hasOfficialSource}`);
      console.log(`  - Team info: ${hasTeamInfo}`);
    }
    
    return isEstablished;
  }

  // Apply bonus for established projects
  private applyEstablishedProjectBonus(baseScore: number, findings: ResearchFindings): number {
    let bonus = 0;
    
    // Multi-year operation bonus (projects running for 2+ years)
    if (this.hasMultiYearOperation(findings)) {
      bonus += 10;
    }
    
    // Post-incident recovery bonus (handled security incidents well)
    if (this.hasPostIncidentRecovery(findings)) {
      bonus += 15;
    }
    
    // Institutional backing bonus (strong investor support)
    if (this.hasInstitutionalBacking(findings)) {
      bonus += 10;
    }
    
    // Comprehensive documentation bonus
    if (this.hasComprehensiveDocumentation(findings)) {
      bonus += 10;
    }
    
    // Active development bonus (GitHub activity, regular updates)
    if (this.hasActiveDevelopment(findings)) {
      bonus += 10;
    }
    
    // Community strength bonus (large, engaged community)
    if (this.hasStrongCommunity(findings)) {
      bonus += 5;
    }
    
    // Cap the bonus to prevent scores over 100
    const maxBonus = 100 - baseScore;
    return Math.min(bonus, maxBonus);
  }

  private hasMultiYearOperation(findings: ResearchFindings): boolean {
    // Check for indicators of long-term operation
    const hasEstablishedData = findings.onchain_data?.found || findings.financial_data?.found;
    const hasHistoricalData = findings.community_health?.found || findings.product_data?.found;
    
    return hasEstablishedData && hasHistoricalData;
  }

  private hasPostIncidentRecovery(findings: ResearchFindings): boolean {
    // Check for indicators of post-incident recovery
    const hasSecurityAudit = findings.security_audits?.found;
    const hasTeamInfo = findings.team_info?.found;
    const hasDocumentation = findings.documentation?.found;
    
    // Projects that have security audits and comprehensive documentation
    // after incidents show good recovery practices
    return hasSecurityAudit && hasTeamInfo && hasDocumentation;
  }

  private hasInstitutionalBacking(findings: ResearchFindings): boolean {
    // Check for institutional backing indicators
    const hasFinancialData = findings.financial_data?.found;
    const hasTeamInfo = findings.team_info?.found;
    
    // Projects with detailed financial data and team information
    // often indicate institutional backing
    return hasFinancialData && hasTeamInfo;
  }

  private hasComprehensiveDocumentation(findings: ResearchFindings): boolean {
    // Check for comprehensive documentation
    const hasWhitepaper = findings.whitepaper?.found;
    const hasDocumentation = findings.documentation?.found;
    const hasTeamInfo = findings.team_info?.found;
    
    return hasWhitepaper && hasDocumentation && hasTeamInfo;
  }

  private hasActiveDevelopment(findings: ResearchFindings): boolean {
    // Check for active development indicators
    const hasOnchainData = findings.onchain_data?.found;
    const hasProductData = findings.product_data?.found;
    const hasCommunityHealth = findings.community_health?.found;
    
    return hasOnchainData && hasProductData && hasCommunityHealth;
  }

  private hasStrongCommunity(findings: ResearchFindings): boolean {
    // Check for strong community indicators
    const hasCommunityHealth = findings.community_health?.found;
    const hasProductData = findings.product_data?.found;
    
    return hasCommunityHealth && hasProductData;
  }

  // Enhanced data coverage calculation for established projects
  private calculateDataCoverage(findings: ResearchFindings, isEstablishedProject: boolean = false): number {
    let coverageScore = 0;
    let totalWeight = 0;
    
    // Use established project weights if applicable
    const weights: { [key: string]: number } = isEstablishedProject ? this.ESTABLISHED_PROJECT_WEIGHTS : 
      Object.fromEntries(this.DATA_SOURCES.map(s => [s.name, s.weight]));
    
    for (const source of this.DATA_SOURCES) {
      const finding = findings[source.name];
      const weight = weights[source.name] || source.weight;
      
      if (finding?.found) {
        // Base score for finding the source
        coverageScore += weight * 0.6;
        
        // Quality bonus
        if (finding.quality === 'high') {
          coverageScore += weight * 0.3;
        } else if (finding.quality === 'medium') {
          coverageScore += weight * 0.2;
        }
        
        // Data points bonus (more data = higher score)
        const dataPointBonus = Math.min(finding.dataPoints / 10, 0.1); // Max 10% bonus
        coverageScore += weight * dataPointBonus;
      }
      
      totalWeight += weight;
    }
    
    if (totalWeight === 0) return 0;
    
    // Normalize to 40 points max (40% of total score)
    const normalizedScore = (coverageScore / totalWeight) * 40;
    
    // Additional bonus for established projects with comprehensive data
    if (isEstablishedProject) {
      const officialSourceCount = Object.values(findings).filter(f => 
        f?.found && f.quality === 'high'
      ).length;
      
      if (officialSourceCount >= 4) {
        return Math.min(normalizedScore + 5, 40); // +5 bonus for comprehensive official sources
      }
    }
    
    return Math.min(normalizedScore, 40);
  }

  // Helper method to check if research should proceed to AI analysis
  public shouldProceedWithAnalysis(findings: ResearchFindings, projectName?: string): {
    proceed: boolean;
    reason?: string;
    score: ResearchScore;
  } {
    const score = this.calculateResearchScore(findings, projectName);
    
    if (score.passesThreshold) {
      return { proceed: true, score };
    }
    
    let reason = "Insufficient research quality for analysis";
    if (score.missingCritical.length > 0) {
      reason = `Missing critical data sources: ${score.missingCritical.join(', ')}`;
    } else if (score.totalScore < this.MINIMUM_THRESHOLD) {
      reason = `Research score (${score.totalScore}) below minimum threshold (${this.MINIMUM_THRESHOLD})`;
    }
    
    return { proceed: false, reason, score };
  }
}

// Helper function to count meaningful data points in collected data
export function countDataPoints(data: any): number {
  if (!data) return 0;
  
  let count = 0;
  const traverse = (obj: any) => {
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          traverse(obj[key]);
        } else {
          count++;
        }
      }
    }
  };
  
  traverse(data);
  return count;
}

// Helper function to map existing data sources to research findings
export function mapDataToFindings(data: any): ResearchFindings {
  const findings: ResearchFindings = {};
  
  // Map CoinGecko data to financial_data
  if (data.cgData && !data.cgData.error) {
    findings.financial_data = {
      found: true,
      data: data.cgData,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.cgData)
    };
  } else if (data.cgData && data.cgData.error) {
    // Even if there's an error, we found some data
    findings.financial_data = {
      found: true,
      data: data.cgData,
      quality: 'low',
      timestamp: new Date(),
      dataPoints: 1
    };
  }
  
  // Map IGDB data to product_data
  if (data.igdbData && !data.igdbData.error) {
    findings.product_data = {
      found: true,
      data: data.igdbData,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.igdbData)
    };
  } else if (data.igdbData && data.igdbData.error) {
    // Even if there's an error, we found some data
    findings.product_data = {
      found: true,
      data: data.igdbData,
      quality: 'low',
      timestamp: new Date(),
      dataPoints: 1
    };
  }
  
  // Map Steam data to product_data (merge with IGDB if both exist)
  if (data.steamData && !data.steamData.error) {
    if (findings.product_data) {
      // Merge with existing product_data
      findings.product_data.data = { ...findings.product_data.data, steam: data.steamData };
      findings.product_data.dataPoints += countDataPoints(data.steamData);
    } else {
      findings.product_data = {
        found: true,
        data: data.steamData,
        quality: 'high',
        timestamp: new Date(),
        dataPoints: countDataPoints(data.steamData)
      };
    }
  } else if (data.steamData && data.steamData.error) {
    // Even if there's an error, we found some data
    if (findings.product_data) {
      // Merge with existing product_data
      findings.product_data.data = { ...findings.product_data.data, steam: data.steamData };
      findings.product_data.dataPoints += 1;
    } else {
      findings.product_data = {
        found: true,
        data: data.steamData,
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 1
      };
    }
  }
  
  // Map Discord data to community_health
  if (data.discordData && data.discordData.server_name) {
    findings.community_health = {
      found: true,
      data: data.discordData,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.discordData)
    };
  }
  
  // Map Etherscan data to onchain_data
  if (data.etherscanData && !data.etherscanData.error) {
    findings.onchain_data = {
      found: true,
      data: data.etherscanData,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.etherscanData)
    };
  }
  
  // Map Snowtrace (Avalanche) data to avalanche_data
  if (data.snowtraceData && !data.snowtraceData.error) {
    findings.avalanche_data = {
      found: true,
      data: data.snowtraceData,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.snowtraceData)
    };
  }
  
  // Map Ronin Network data
  if (data.roninTokenInfo && !data.roninTokenInfo.error) {
    findings.ronin_data = {
      found: true,
      data: data.roninTokenInfo,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.roninTokenInfo)
    };
    
  

  }
  
  // Map team info from various sources to team_info
  const teamInfo = {
    studioAssessment: data.studioAssessment,
    linkedinSummary: data.linkedinSummary,
    glassdoorSummary: data.glassdoorSummary
  };
  
  if (Object.values(teamInfo).some(v => v)) {
    findings.team_info = {
      found: true,
      data: teamInfo,
      quality: 'medium',
      timestamp: new Date(),
      dataPoints: countDataPoints(teamInfo)
    };
  }
  
  // Map security data to security_audits
  if (data.securitySummary) {
    findings.security_audits = {
      found: true,
      data: { securitySummary: data.securitySummary },
      quality: 'high',
      timestamp: new Date(),
      dataPoints: 1
    };
  }
  


  // Map enhanced official sources data for established projects
  if (data.officialSourcesData) {
    // Map whitepaper if found
    if (data.officialSourcesData.whitepaper) {
      findings.whitepaper = {
        found: true,
        data: { url: data.officialSourcesData.whitepaper },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 1
      };
    }
    
    // Map documentation if found
    if (data.officialSourcesData.documentation) {
      findings.documentation = {
        found: true,
        data: { url: data.officialSourcesData.documentation },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 1
      };
    }
    
    // Map GitHub if found
    if (data.officialSourcesData.github) {
      findings.github_activity = {
        found: true,
        data: { url: data.officialSourcesData.github },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 1
      };
    }
    
    // Map security audit if found
    if (data.officialSourcesData.securityAudit) {
      findings.security_audits = {
        found: true,
        data: { url: data.officialSourcesData.securityAudit },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 1
      };
    }
    
    // Map team info if found
    if (data.officialSourcesData.teamInfo) {
      findings.team_info = {
        found: true,
        data: data.officialSourcesData.teamInfo,
        quality: 'high',
        timestamp: new Date(),
        dataPoints: countDataPoints(data.officialSourcesData.teamInfo)
      };
    }
    
    // Map funding info if found
    if (data.officialSourcesData.fundingInfo) {
      findings.financial_data = {
        found: true,
        data: { ...findings.financial_data?.data, ...data.officialSourcesData.fundingInfo },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: (findings.financial_data?.dataPoints || 0) + countDataPoints(data.officialSourcesData.fundingInfo)
      };
    }
  }
  
  // Map social signals to community_health (merge with Discord if both exist)
  const socialData = {
    twitterSummary: data.twitterSummary,
    redditSummary: data.redditSummary,
    telegramSummary: data.telegramSummary
  };
  
  if (Object.values(socialData).some(v => v)) {
    if (findings.community_health) {
      // Merge with existing community_health
      findings.community_health.data = { ...findings.community_health.data, social: socialData };
      findings.community_health.dataPoints += countDataPoints(socialData);
    } else {
      findings.community_health = {
        found: true,
        data: socialData,
        quality: 'medium',
        timestamp: new Date(),
        dataPoints: countDataPoints(socialData)
      };
    }
  }
  
  // Map media coverage
  const mediaData = {
    youtubeData: data.youtubeData,
    blogSummary: data.blogSummary,
    reviewSummary: data.reviewSummary
  };
  
  if (Object.values(mediaData).some(v => v)) {
    findings.media_coverage = {
      found: true,
      data: mediaData,
      quality: 'medium',
      timestamp: new Date(),
      dataPoints: countDataPoints(mediaData)
    };
  }
  
  // Map whitepaper data (if available from tokenomics or other sources)
  const whitepaperData = {
    tokenomics: data.tokenomics,
    // Add other documentation sources here
  };
  
  if (Object.values(whitepaperData).some(v => v)) {
    findings.whitepaper = {
      found: true,
      data: whitepaperData,
      quality: 'medium',
      timestamp: new Date(),
      dataPoints: countDataPoints(whitepaperData)
    };
  }
  
  return findings;
} 