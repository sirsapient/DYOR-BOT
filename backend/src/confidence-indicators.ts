// User-Facing Confidence Indicators for DYOR BOT
// Backend data structures and calculation logic for showing research confidence

import { ResearchFindings, ResearchScore } from './research-scoring';
import { ResearchPlan } from './ai-research-orchestrator';

// ===== BACKEND: Confidence Data Structures =====

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

export class ConfidenceCalculator {
  calculateConfidenceMetrics(
    findings: ResearchFindings,
    researchScore: ResearchScore,
    researchPlan: ResearchPlan
  ): ConfidenceMetrics {
    const sourceDetails = this.buildSourceDetails(findings);
    const breakdown = this.calculateBreakdown(findings, sourceDetails);
    const overall = this.calculateOverallConfidence(researchScore, breakdown);
    const limitations = this.identifyLimitations(findings, researchPlan);
    const strengths = this.identifyStrengths(findings, sourceDetails);
    const userGuidance = this.generateUserGuidance(overall, breakdown, limitations, findings);

    return {
      overall,
      breakdown,
      sourceDetails,
      limitations,
      strengths,
      userGuidance
    };
  }

  private buildSourceDetails(findings: ResearchFindings): SourceConfidence[] {
    const sourceConfigs = [
      { key: 'whitepaper', name: 'Documentation', icon: '📄', desc: 'Official project documentation' },
      { key: 'onchain_data', name: 'Blockchain Data', icon: '⛓️', desc: 'On-chain metrics and contracts' },
      { key: 'avalanche_data', name: 'Avalanche Network', icon: '❄️', desc: 'Avalanche blockchain data and contracts' },
      { key: 'ronin_data', name: 'Ronin Network', icon: '🌐', desc: 'Ronin blockchain data and transactions' },
      { key: 'team_info', name: 'Team Information', icon: '👥', desc: 'Founder and team backgrounds' },
      { key: 'community_health', name: 'Community', icon: '💬', desc: 'Discord, Twitter, Telegram activity' },
      { key: 'financial_data', name: 'Financial Data', icon: '💰', desc: 'Market cap, funding, trading data' },
      { key: 'product_data', name: 'Product Metrics', icon: '🎮', desc: 'Game stats, user reviews, usage' },
      { key: 'game_specific', name: 'Game Data', icon: '🎯', desc: 'Game-specific metrics and analytics' },
      { key: 'security_audits', name: 'Security Audits', icon: '🛡️', desc: 'Smart contract audit reports' },
      { key: 'media_coverage', name: 'Media Coverage', icon: '📰', desc: 'News articles and press coverage' }
    ];

    return sourceConfigs.map(config => {
      const finding = findings[config.key];
      return {
        name: config.key,
        displayName: config.name,
        found: finding?.found || false,
        quality: finding?.quality || 'low',
        reliability: this.getSourceReliability(config.key),
        dataPoints: finding?.dataPoints || 0,
        lastUpdated: (finding?.timestamp || new Date()).toISOString(),
        confidence: this.calculateSourceConfidence(finding),
        issues: this.identifySourceIssues(finding),
        icon: config.icon,
        description: config.desc
      };
    });
  }

  private calculateBreakdown(findings: ResearchFindings, sources: SourceConfidence[]) {
    const foundSources = sources.filter(s => s.found);
    const totalSources = sources.length;
    
    return {
      dataCompleteness: {
        score: Math.round((foundSources.length / totalSources) * 100),
        found: foundSources.length,
        total: totalSources,
        missing: sources.filter(s => !s.found).map(s => s.displayName)
      },
      sourceReliability: {
        score: foundSources.length > 0 ? 
          Math.round(foundSources.reduce((sum, s) => sum + s.confidence, 0) / foundSources.length) : 0,
        official: foundSources.filter(s => s.reliability === 'official').length,
        verified: foundSources.filter(s => s.reliability === 'verified').length,
        scraped: foundSources.filter(s => s.reliability === 'scraped').length
      },
      dataFreshness: {
        score: this.calculateFreshnessScore(foundSources),
        averageAge: this.calculateAverageAge(foundSources),
        oldestSource: this.findOldestSource(foundSources)
      }
    };
  }

  private calculateOverallConfidence(score: ResearchScore, breakdown: any) {
    const confidenceLevel = this.determineConfidenceLevel(score.confidence);
    
    return {
      score: Math.round(score.confidence * 100),
      grade: score.grade,
      level: confidenceLevel,
      description: this.generateConfidenceDescription(confidenceLevel, score.grade)
    };
  }

  private generateUserGuidance(overall: any, breakdown: any, limitations: string[], findings: ResearchFindings) {
    let trustLevel: 'high' | 'medium' | 'low' = 'medium';
    let useCase = 'General research and due diligence';
    const warnings: string[] = [];
    const additionalResearch: string[] = [];

    if (overall.score >= 80) {
      trustLevel = 'high';
      useCase = 'Comprehensive project analysis and research';
    } else if (overall.score < 50) {
      trustLevel = 'low';
      useCase = 'Initial screening only - requires additional research';
      warnings.push('Limited data available - use caution');
    }

    if (breakdown.sourceReliability.official === 0) {
      // Check if this is an established project that should have official sources
      const isEstablishedProject = this.isEstablishedProject(findings);
      if (isEstablishedProject) {
        warnings.push('Established project missing official sources - this may indicate data collection issues');
        additionalResearch.push('Search for official project documentation and whitepaper');
        additionalResearch.push('Check for security audit reports and institutional backing');
      } else {
        warnings.push('No official sources found - rely on external verification');
        additionalResearch.push('Search for official project documentation');
      }
    }

    if (breakdown.dataFreshness.averageAge > 30) {
      warnings.push('Some data may be outdated');
      additionalResearch.push('Check for recent project updates');
    }

    return { trustLevel, useCase, warnings, additionalResearch };
  }

  // Helper methods
  private getSourceReliability(sourceName: string): 'official' | 'verified' | 'scraped' {
    const reliabilityMap: Record<string, 'official' | 'verified' | 'scraped'> = {
      'whitepaper': 'official',
      'onchain_data': 'verified',
      'team_info': 'verified',
      'community_health': 'verified',
      'financial_data': 'verified',
      'product_data': 'verified',
      'security_audits': 'official',
      'media_coverage': 'scraped'
    };
    return reliabilityMap[sourceName] || 'scraped';
  }

  private calculateSourceConfidence(finding: any): number {
    if (!finding?.found) return 0;
    
    let confidence = 50; // Base confidence
    
    if (finding.quality === 'high') confidence += 30;
    else if (finding.quality === 'medium') confidence += 15;
    
    confidence += Math.min(finding.dataPoints * 2, 20); // Bonus for data richness
    
    const ageInDays = finding.timestamp ? 
      (Date.now() - finding.timestamp.getTime()) / (1000 * 60 * 60 * 24) : 30;
    if (ageInDays < 7) confidence += 10;
    else if (ageInDays > 90) confidence -= 15;
    
    return Math.max(0, Math.min(100, confidence));
  }

  private identifySourceIssues(finding: any): string[] {
    const issues: string[] = [];
    if (!finding?.found) return ['No data found'];
    
    if (finding.quality === 'low') issues.push('Low data quality');
    if (finding.dataPoints < 3) issues.push('Limited data points');
    
    const ageInDays = finding.timestamp ? 
      (Date.now() - finding.timestamp.getTime()) / (1000 * 60 * 60 * 24) : 0;
    if (ageInDays > 90) issues.push('Data may be outdated');
    
    return issues;
  }

  private determineConfidenceLevel(confidence: number): 'very_high' | 'high' | 'medium' | 'low' | 'very_low' {
    // confidence is expected to be between 0 and 1
    if (confidence >= 0.9) return 'very_high';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'very_low';
  }

  private generateConfidenceDescription(level: string, grade: string): string {
    const descriptions: Record<string, string> = {
      'very_high': 'Comprehensive data from multiple reliable sources',
      'high': 'Strong data coverage with good source reliability',
      'medium': 'Adequate data for general analysis with some limitations',
      'low': 'Limited data available - additional research recommended',
      'very_low': 'Insufficient data for reliable analysis'
    };
    return descriptions[level] || 'Analysis confidence not determined';
  }

  private calculateFreshnessScore(sources: SourceConfidence[]): number {
    if (sources.length === 0) return 0;
    
    const avgAge = this.calculateAverageAge(sources);
    if (avgAge <= 7) return 100;
    if (avgAge <= 30) return 80;
    if (avgAge <= 90) return 60;
    return 40;
  }

  private calculateAverageAge(sources: SourceConfidence[]): number {
    if (sources.length === 0) return 0;
    
    const now = Date.now();
    const totalAge = sources.reduce((sum, source) => {
      const age = (now - new Date(source.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      return sum + age;
    }, 0);
    
    return Math.round(totalAge / sources.length);
  }

  private findOldestSource(sources: SourceConfidence[]): string {
    if (sources.length === 0) return 'None';
    
    const oldest = sources.reduce((oldest, current) => 
      new Date(current.lastUpdated) < new Date(oldest.lastUpdated) ? current : oldest
    );
    
    return oldest.displayName;
  }

  // Helper method to detect established projects
  private isEstablishedProject(findings: ResearchFindings): boolean {
    const hasOfficialWhitepaper = findings.whitepaper?.found && findings.whitepaper?.quality === 'high';
    const hasSecurityAudit = findings.security_audits?.found && findings.security_audits?.quality === 'high';
    const hasInstitutionalBacking = findings.financial_data?.data?.funding_rounds || 
                                   findings.financial_data?.data?.institutional_investors;
    const hasExtensiveDocumentation = findings.whitepaper?.dataPoints > 20;
    
    return hasOfficialWhitepaper && (hasSecurityAudit || hasInstitutionalBacking || hasExtensiveDocumentation);
  }



  private identifyLimitations(findings: ResearchFindings, plan: ResearchPlan): string[] {
    const limitations: string[] = [];
    
    const foundSources = Object.keys(findings).filter(k => findings[k]?.found);
    const criticalMissing = ['whitepaper', 'team_info', 'onchain_data']
      .filter(source => !foundSources.includes(source));
    
    if (criticalMissing.length > 0) {
      limitations.push(`Missing critical data: ${criticalMissing.join(', ')}`);
    }
    
    const totalDataPoints = Object.values(findings)
      .reduce((sum, f) => sum + (f?.dataPoints || 0), 0);
    if (totalDataPoints < 15) {
      limitations.push('Limited data points collected');
    }
    
    const hasOfficialSources = Object.values(findings)
      .some(f => f?.found && this.getSourceReliability(f.data?.source) === 'official');
    if (!hasOfficialSources) {
      limitations.push('No official project sources verified');
    }
    
    return limitations;
  }

  private identifyStrengths(findings: ResearchFindings, sources: SourceConfidence[]): string[] {
    const strengths: string[] = [];
    
    const highQualitySources = sources.filter(s => s.found && s.quality === 'high').length;
    if (highQualitySources >= 3) {
      strengths.push(`${highQualitySources} high-quality data sources`);
    }
    
    const officialSources = sources.filter(s => s.found && s.reliability === 'official').length;
    if (officialSources > 0) {
      strengths.push(`${officialSources} official source${officialSources > 1 ? 's' : ''} verified`);
    }
    
    const totalDataPoints = sources.reduce((sum, s) => sum + s.dataPoints, 0);
    if (totalDataPoints >= 25) {
      strengths.push(`Comprehensive data (${totalDataPoints} data points)`);
    }
    
    const recentSources = sources.filter(s => {
      const ageInDays = (Date.now() - new Date(s.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      return s.found && ageInDays <= 7;
    }).length;
    if (recentSources >= 2) {
      strengths.push(`Fresh data from ${recentSources} recent sources`);
    }
    
    return strengths;
  }
}

// ===== BACKEND INTEGRATION =====

export function generateConfidenceMetrics(
  findings: ResearchFindings,
  researchScore: ResearchScore,
  researchPlan: ResearchPlan
): ConfidenceMetrics {

  
  const calculator = new ConfidenceCalculator();
  const result = calculator.calculateConfidenceMetrics(findings, researchScore, researchPlan);
  

  return result;
}

// Example usage in your API endpoint:
// export async function handleAnalysisWithConfidence(projectName: string) {
//   // ... your existing research logic ...
//   
//   const confidenceMetrics = generateConfidenceMetrics(findings, researchScore, researchPlan);
//   
//   return {
//     analysis: aiAnalysis,
//     confidence: confidenceMetrics,
//     meta: {
//       researchGrade: confidenceMetrics.overall.grade,
//       trustLevel: confidenceMetrics.userGuidance.trustLevel,
//       dataQuality: confidenceMetrics.overall.score
//     }
//   };
// } 