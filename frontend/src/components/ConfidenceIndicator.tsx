// User-Facing Confidence Indicators for DYOR BOT
// Frontend React components for showing research confidence

import React, { useState } from 'react';

// ===== FRONTEND: React Components =====

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

interface ConfidenceIndicatorProps {
  confidence: ConfidenceMetrics;
  showDetails?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ 
  confidence, 
  showDetails = false 
}) => {
  const [expanded, setExpanded] = useState(showDetails);

  const getConfidenceColor = (level: string) => {
    const colors: Record<string, React.CSSProperties> = {
      'very_high': { color: '#00ff41', backgroundColor: '#111', borderColor: '#00ff41' },
      'high': { color: '#00ff41', backgroundColor: '#111', borderColor: '#00ff41' },
      'medium': { color: '#ffaa00', backgroundColor: '#111', borderColor: '#ffaa00' },
      'low': { color: '#ff6600', backgroundColor: '#111', borderColor: '#ff6600' },
      'very_low': { color: '#ff00ff', backgroundColor: '#111', borderColor: '#ff00ff' }
    };
    return colors[level] || colors.medium;
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return '#00ff41';
    if (score >= 60) return '#ffaa00';
    if (score >= 40) return '#ff6600';
    return '#ff00ff';
  };

  return (
    <div style={{ 
      backgroundColor: '#111', 
      borderRadius: '8px', 
      border: '2px solid #00ff41', 
      padding: '16px', 
      marginBottom: '24px',
      color: '#00ff41',
      fontFamily: 'Share Tech Mono, monospace'
    }}>
      {/* Main Confidence Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            padding: '8px 12px', 
            borderRadius: '4px', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            border: '2px solid',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            ...getConfidenceColor(confidence.overall.level)
          }}>
            Grade {confidence.overall.grade}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff41', textTransform: 'uppercase' }}>
            {confidence.overall.score}% Confidence
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ 
            color: '#00ff41', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            background: 'none',
            border: '2px solid #00ff41',
            padding: '8px 16px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#00ff41';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#00ff41';
          }}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Score Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#00ff41', marginBottom: '4px', textTransform: 'uppercase' }}>
          <span>Research Quality</span>
          <span>{confidence.overall.score}/100</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#333', borderRadius: '4px', height: '8px', border: '1px solid #00ff41' }}>
          <div 
            style={{ 
              height: '8px', 
              borderRadius: '4px', 
              transition: 'all 0.5s',
              backgroundColor: getScoreBarColor(confidence.overall.score),
              width: `${confidence.overall.score}%`,
              boxShadow: `0 0 10px ${getScoreBarColor(confidence.overall.score)}`
            }}
          />
        </div>
      </div>

      {/* Description */}
      <p style={{ color: '#00ff41', marginBottom: '16px', fontSize: '14px' }}>{confidence.overall.description}</p>

      {/* User Guidance */}
      {confidence.userGuidance && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          border: '2px solid #00ff41',
          backgroundColor: '#111',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold', color: '#00ff41', marginBottom: '4px', textTransform: 'uppercase' }}>
              Recommended Use: {confidence.userGuidance.useCase || 'General research'}
            </div>
            {confidence.userGuidance.warnings && confidence.userGuidance.warnings.length > 0 && (
              <div style={{ color: '#ff00ff', fontSize: '12px' }}>
                ⚠️ {confidence.userGuidance.warnings.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {expanded && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Data Sources Grid */}
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#00ff41', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Data Sources</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {confidence.sourceDetails.map((source) => (
                <SourceCard key={source.name} source={source} />
              ))}
            </div>
          </div>

          {/* Breakdown Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <MetricCard 
              title="Data Completeness" 
              score={confidence.breakdown.dataCompleteness.score}
              detail={`${confidence.breakdown.dataCompleteness.found}/${confidence.breakdown.dataCompleteness.total} sources`}
            />
            <MetricCard 
              title="Source Reliability" 
              score={confidence.breakdown.sourceReliability.score}
              detail={`${confidence.breakdown.sourceReliability.official} official, ${confidence.breakdown.sourceReliability.verified} verified`}
            />
            <MetricCard 
              title="Data Freshness" 
              score={confidence.breakdown.dataFreshness.score}
              detail={`Avg age: ${confidence.breakdown.dataFreshness.averageAge} days`}
            />
          </div>

          {/* Strengths and Limitations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <h5 style={{ fontWeight: 'bold', color: '#00ff41', marginBottom: '8px', textTransform: 'uppercase' }}>✅ Strengths</h5>
              <ul style={{ fontSize: '14px', color: '#00ff41', listStyle: 'none', padding: 0 }}>
                {confidence.strengths.map((strength, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>• {strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 style={{ fontWeight: 'bold', color: '#ff00ff', marginBottom: '8px', textTransform: 'uppercase' }}>⚠️ Limitations</h5>
              <ul style={{ fontSize: '14px', color: '#ff00ff', listStyle: 'none', padding: 0 }}>
                {confidence.limitations.map((limitation, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>• {limitation}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Research Suggestions */}
          {confidence.userGuidance && confidence.userGuidance.additionalResearch && confidence.userGuidance.additionalResearch.length > 0 && (
            <div>
              <h5 style={{ fontWeight: 'bold', color: '#00ff41', marginBottom: '8px', textTransform: 'uppercase' }}>🔍 Suggested Additional Research</h5>
              <ul style={{ fontSize: '14px', color: '#00ff41', listStyle: 'none', padding: 0 }}>
                {confidence.userGuidance.additionalResearch.map((suggestion, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SourceCard: React.FC<{ source: SourceConfidence }> = ({ source }) => {
  const getStatusColor = (): React.CSSProperties => {
    if (!source.found) return { backgroundColor: '#111', borderColor: '#666', color: '#666' };
    if (source.quality === 'high') return { backgroundColor: '#111', borderColor: '#00ff41', color: '#00ff41' };
    if (source.quality === 'medium') return { backgroundColor: '#111', borderColor: '#ffaa00', color: '#ffaa00' };
    return { backgroundColor: '#111', borderColor: '#ff00ff', color: '#ff00ff' };
  };

  return (
    <div style={{ 
      padding: '12px', 
      borderRadius: '8px', 
      border: '2px solid', 
      textAlign: 'center',
      fontFamily: 'Share Tech Mono, monospace',
      ...getStatusColor()
    }}>
      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{source.icon}</div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{source.displayName}</div>
      {source.found ? (
        <div style={{ fontSize: '12px' }}>
          {source.dataPoints} data points
          {source.issues && source.issues.length > 0 && (
            <div style={{ color: '#ff00ff', marginTop: '4px' }}>{source.issues[0]}</div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#666' }}>Not found</div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ title: string; score: number; detail: string }> = ({ 
  title, score, detail 
}) => (
  <div style={{ 
    backgroundColor: '#111', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '2px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'Share Tech Mono, monospace'
  }}>
    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{title}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{score}%</div>
    <div style={{ fontSize: '12px' }}>{detail}</div>
  </div>
); 