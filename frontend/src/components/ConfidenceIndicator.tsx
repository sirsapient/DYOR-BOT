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
      'very_high': { color: '#059669', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
      'high': { color: '#10b981', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
      'medium': { color: '#d97706', backgroundColor: '#fffbeb', borderColor: '#fed7aa' },
      'low': { color: '#ea580c', backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
      'very_low': { color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }
    };
    return colors[level] || colors.medium;
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '24px' }}>
      {/* Main Confidence Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            padding: '8px 12px', 
            borderRadius: '9999px', 
            fontSize: '14px', 
            fontWeight: '500', 
            border: '1px solid',
            ...getConfidenceColor(confidence.overall.level)
          }}>
            Grade {confidence.overall.grade}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            {confidence.overall.score}% Confidence
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Score Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
          <span>Research Quality</span>
          <span>{confidence.overall.score}/100</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
          <div 
            style={{ 
              height: '8px', 
              borderRadius: '9999px', 
              transition: 'all 0.5s',
              backgroundColor: getScoreBarColor(confidence.overall.score),
              width: `${confidence.overall.score}%` 
            }}
          />
        </div>
      </div>

      {/* Description */}
      <p style={{ color: '#374151', marginBottom: '16px' }}>{confidence.overall.description}</p>

      {/* User Guidance */}
      {confidence.userGuidance && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          border: '1px solid',
          ...(confidence.userGuidance.trustLevel === 'high' ? 
            { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' } :
            confidence.userGuidance.trustLevel === 'medium' ? 
            { backgroundColor: '#fffbeb', borderColor: '#fed7aa' } :
            { backgroundColor: '#fef2f2', borderColor: '#fecaca' }
          )
        }}>
          <div style={{ fontSize: '14px' }}>
            <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
              Recommended Use: {confidence.userGuidance.useCase || 'General research'}
            </div>
            {confidence.userGuidance.warnings && confidence.userGuidance.warnings.length > 0 && (
              <div style={{ color: '#b45309' }}>
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
            <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '12px' }}>Data Sources</h4>
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
              <h5 style={{ fontWeight: '500', color: '#059669', marginBottom: '8px' }}>✅ Strengths</h5>
              <ul style={{ fontSize: '14px', color: '#4b5563', listStyle: 'none', padding: 0 }}>
                {confidence.strengths.map((strength, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>• {strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 style={{ fontWeight: '500', color: '#ea580c', marginBottom: '8px' }}>⚠️ Limitations</h5>
              <ul style={{ fontSize: '14px', color: '#4b5563', listStyle: 'none', padding: 0 }}>
                {confidence.limitations.map((limitation, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>• {limitation}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Research Suggestions */}
          {confidence.userGuidance && confidence.userGuidance.additionalResearch && confidence.userGuidance.additionalResearch.length > 0 && (
            <div>
              <h5 style={{ fontWeight: '500', color: '#2563eb', marginBottom: '8px' }}>🔍 Suggested Additional Research</h5>
              <ul style={{ fontSize: '14px', color: '#4b5563', listStyle: 'none', padding: 0 }}>
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
    if (!source.found) return { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
    if (source.quality === 'high') return { backgroundColor: '#dcfce7', borderColor: '#86efac' };
    if (source.quality === 'medium') return { backgroundColor: '#fef3c7', borderColor: '#fcd34d' };
    return { backgroundColor: '#fee2e2', borderColor: '#fca5a5' };
  };

  return (
    <div style={{ 
      padding: '12px', 
      borderRadius: '8px', 
      border: '1px solid', 
      textAlign: 'center',
      ...getStatusColor()
    }}>
      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{source.icon}</div>
      <div style={{ fontSize: '12px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>{source.displayName}</div>
      {source.found ? (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          {source.dataPoints} data points
          {source.issues && source.issues.length > 0 && (
            <div style={{ color: '#dc2626', marginTop: '4px' }}>{source.issues[0]}</div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>Not found</div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ title: string; score: number; detail: string }> = ({ 
  title, score, detail 
}) => (
  <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{score}%</div>
    <div style={{ fontSize: '12px', color: '#4b5563' }}>{detail}</div>
  </div>
); 