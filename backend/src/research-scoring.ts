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
    { name: 'onchain_data', tier: 1, weight: 15, reliability: 'verified', isRequired: true },
    { name: 'ronin_data', tier: 1, weight: 15, reliability: 'verified', isRequired: false },
    { name: 'team_info', tier: 1, weight: 15, reliability: 'verified', isRequired: true },
    
    // Tier 2: Market Intelligence (Important)
    { name: 'community_health', tier: 2, weight: 15, reliability: 'verified' },
    { name: 'financial_data', tier: 2, weight: 10, reliability: 'verified' },
    { name: 'product_data', tier: 2, weight: 10, reliability: 'verified' },
    { name: 'game_specific', tier: 2, weight: 10, reliability: 'verified' },
    
    // Tier 3: Supporting Evidence (Nice-to-Have)
    { name: 'security_audits', tier: 3, weight: 3, reliability: 'official' },
    { name: 'media_coverage', tier: 3, weight: 1, reliability: 'scraped' },
    { name: 'social_signals', tier: 3, weight: 1, reliability: 'scraped' }
  ];

  private readonly MINIMUM_THRESHOLD = 60;
  private readonly MINIMUM_DATA_POINTS = 15;
  
  public calculateResearchScore(findings: ResearchFindings): ResearchScore {
    const breakdown = {
      dataCoverage: this.calculateDataCoverage(findings),
      sourceReliability: this.calculateSourceReliability(findings),
      recencyFactor: this.calculateRecencyFactor(findings)
    };

    const totalScore = breakdown.dataCoverage + breakdown.sourceReliability + breakdown.recencyFactor;
    const grade = this.assignGrade(totalScore);
    const confidence = this.calculateConfidence(findings, totalScore);
    const passesThreshold = this.checkThreshold(findings, totalScore);
    const missingCritical = this.identifyMissingCritical(findings);
    const recommendations = this.generateRecommendations(findings, totalScore);

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

  private calculateDataCoverage(findings: ResearchFindings): number {
    let coverageScore = 0;
    let maxPossibleScore = 0;

    for (const source of this.DATA_SOURCES) {
      maxPossibleScore += source.weight;
      
      const finding = findings[source.name];
      if (finding?.found) {
        let qualityMultiplier = 1.0;
        
        switch (finding.quality) {
          case 'high': qualityMultiplier = 1.0; break;
          case 'medium': qualityMultiplier = 0.7; break;
          case 'low': qualityMultiplier = 0.4; break;
        }

        // Bonus for having many data points
        const dataPointBonus = Math.min(finding.dataPoints / 10, 1.2);
        
        coverageScore += source.weight * qualityMultiplier * dataPointBonus;
      }
    }

    // Normalize to 40 points max (40% of total score)
    return Math.min((coverageScore / maxPossibleScore) * 40, 40);
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

  private calculateConfidence(findings: ResearchFindings, score: number): number {
    const tier1Coverage = this.getTierCoverage(findings, 1);
    const totalDataPoints = this.getTotalDataPoints(findings);
    
    let confidenceScore = score / 100; // Base confidence from score
    
    // Boost confidence for good Tier 1 coverage
    if (tier1Coverage >= 0.8) confidenceScore += 0.1;
    
    // Boost confidence for many data points
    if (totalDataPoints >= this.MINIMUM_DATA_POINTS) confidenceScore += 0.1;
    
    // Reduce confidence for missing critical sources
    const missingCritical = this.identifyMissingCritical(findings);
    confidenceScore -= missingCritical.length * 0.15;
    
    return Math.max(0, Math.min(1, confidenceScore));
  }

  private checkThreshold(findings: ResearchFindings, score: number): boolean {
    // Must pass score threshold
    if (score < this.MINIMUM_THRESHOLD) return false;
    
    // Must have minimum data points
    if (this.getTotalDataPoints(findings) < this.MINIMUM_DATA_POINTS) return false;
    
    // Must have at least 2 of 3 Tier 1 sources
    const tier1Sources = this.DATA_SOURCES.filter(s => s.tier === 1);
    const tier1Found = tier1Sources.filter(s => findings[s.name]?.found).length;
    if (tier1Found < 2) return false;
    
    return true;
  }

  private identifyMissingCritical(findings: ResearchFindings): string[] {
    const missing: string[] = [];
    
    for (const source of this.DATA_SOURCES) {
      if (source.isRequired && !findings[source.name]?.found) {
        missing.push(source.name);
      }
    }
    
    return missing;
  }

  private generateRecommendations(findings: ResearchFindings, score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < this.MINIMUM_THRESHOLD) {
      recommendations.push("Insufficient data for reliable analysis");
    }
    
    const missingCritical = this.identifyMissingCritical(findings);
    if (missingCritical.length > 0) {
      recommendations.push(`Missing critical data: ${missingCritical.join(', ')}`);
    }
    
    const tier1Coverage = this.getTierCoverage(findings, 1);
    if (tier1Coverage < 0.6) {
      recommendations.push("Need more foundational project information");
    }
    
    const totalDataPoints = this.getTotalDataPoints(findings);
    if (totalDataPoints < this.MINIMUM_DATA_POINTS) {
      recommendations.push("Need more detailed data points for thorough analysis");
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

  // Helper method to check if research should proceed to AI analysis
  public shouldProceedWithAnalysis(findings: ResearchFindings): {
    proceed: boolean;
    reason?: string;
    score: ResearchScore;
  } {
    const score = this.calculateResearchScore(findings);
    
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
  
  // Map Ronin Network data
  if (data.roninTokenInfo && !data.roninTokenInfo.error) {
    findings.ronin_data = {
      found: true,
      data: data.roninTokenInfo,
      quality: 'high',
      timestamp: new Date(),
      dataPoints: countDataPoints(data.roninTokenInfo)
    };
    
    // If Axie Infinity specific data is available, map it as game-specific data
    if (data.roninTokenInfo.axieSpecificData) {
      findings.game_specific = {
        found: true,
        data: data.roninTokenInfo.axieSpecificData,
        quality: 'high',
        timestamp: new Date(),
        dataPoints: countDataPoints(data.roninTokenInfo.axieSpecificData)
      };
    }
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