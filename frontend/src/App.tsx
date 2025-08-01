import React, { useState, useEffect } from 'react';
import { ProjectResearch } from './types';
import { ConfidenceIndicator } from './components/ConfidenceIndicator';
import './App.css';
import ReactMarkdown from 'react-markdown';

function LoadingModal({ show }: { show: boolean }) {
  const images = [
    '/conspiracy.jpg',
    '/thinking-kid.jpg',
    '/math-guy.jpg',
    '/math-woman.jpg',
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [show]);
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      flexDirection: 'column',
    }}>
      <img src={images[index]} alt="Researching..." style={{ maxWidth: 350, maxHeight: 350, borderRadius: 12, boxShadow: '0 4px 24px #0008' }} />
      <div style={{ color: '#fff', marginTop: 24, fontSize: 22, fontWeight: 600 }}>Researching project...</div>
    </div>
  );
}

// New Expandable Section Component
function ExpandableSection({ 
  title, 
  children, 
  icon, 
  color = '#4a90e2',
  defaultExpanded = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: string;
  color?: string;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div style={{
      border: `1px solid ${color}20`,
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          border: 'none',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{ 
          fontSize: '18px', 
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${color}20`,
          backgroundColor: '#fafbfc'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Social Links Component
function SocialLinks({ research }: { research: ProjectResearch }) {
  interface SocialLink {
    name: string;
    url: string;
    icon: string;
  }
  
  const links: SocialLink[] = [];
  
  // Extract links from various sources
  if (research.sourcesUsed) {
    research.sourcesUsed.forEach(source => {
      if (source.includes('twitter.com')) links.push({ name: 'Twitter', url: source, icon: '🐦' });
      if (source.includes('discord.gg')) links.push({ name: 'Discord', url: source, icon: '💬' });
      if (source.includes('reddit.com')) links.push({ name: 'Reddit', url: source, icon: '📱' });
      if (source.includes('github.com')) links.push({ name: 'GitHub', url: source, icon: '💻' });
      if (source.includes('steam.com')) links.push({ name: 'Steam', url: source, icon: '🎮' });
      if (source.includes('linkedin.com')) links.push({ name: 'LinkedIn', url: source, icon: '💼' });
    });
  }
  
  // NEW: Add whitepaper and litepaper links from research data
  if (research.whitepaper?.found && research.whitepaper.data?.url) {
    const url = research.whitepaper.data.url;
    const isLitepaper = url.toLowerCase().includes('lite') || url.toLowerCase().includes('lite-paper');
    const name = isLitepaper ? 'Litepaper' : 'Whitepaper';
    const icon = isLitepaper ? '📋' : '📄';
    
    links.push({ name, url, icon });
  }
  
  // Add common social patterns
  const projectName = research.projectName.toLowerCase().replace(/\s+/g, '');
  const commonSocials: SocialLink[] = [
    { name: 'Website', url: `https://${projectName}.com`, icon: '🌐' },
    { name: 'Twitter', url: `https://twitter.com/${projectName}`, icon: '🐦' },
    { name: 'Discord', url: `https://discord.gg/${projectName}`, icon: '💬' },
    { name: 'Telegram', url: `https://t.me/${projectName}`, icon: '📱' },
    { name: 'Medium', url: `https://medium.com/@${projectName}`, icon: '📝' },
  ];
  
  // Only add common socials if we don't have specific ones
  commonSocials.forEach(social => {
    if (!links.find(l => l.name === social.name)) {
      links.push(social);
    }
  });
  
  if (links.length === 0) return null;
  
  return (
    <ExpandableSection title="Social Links & Resources" icon="🔗" color="#17a2b8" defaultExpanded={true}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <span style={{ fontSize: '16px' }}>{link.icon}</span>
            <span>{link.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.6 }}>↗</span>
          </a>
        ))}
      </div>
    </ExpandableSection>
  );
}

// Data Sources Grid Component
function DataSourcesGrid({ research }: { research: ProjectResearch }) {
  const sources = [
    { name: 'Documentation', icon: '📄', color: '#28a745', data: research.sourcesUsed?.filter(s => s.includes('docs') || s.includes('whitepaper')).length || 0 },
    { name: 'Blockchain Data', icon: '🔗', color: '#007bff', data: research.financialData ? 1 : 0 },
    { name: 'Ronin Network', icon: '🌐', color: '#6f42c1', data: research.financialData?.roninTokenInfo ? 1 : 0 },
    { name: 'Team Information', icon: '👥', color: '#fd7e14', data: research.teamAnalysis ? 1 : 0 },
    { name: 'Community', icon: '👥', color: '#20c997', data: research.communityHealth ? 1 : 0 },
    { name: 'Financial Data', icon: '💰', color: '#28a745', data: research.financialData ? 1 : 0 },
    { name: 'Product Metrics', icon: '🎮', color: '#e83e8c', data: research.technicalAssessment ? 1 : 0 },
    { name: 'Game Data', icon: '🎯', color: '#6f42c1', data: research.communityHealth?.steamReviewSummary ? 1 : 0 },
    { name: 'Security Audits', icon: '🛡️', color: '#dc3545', data: research.technicalAssessment?.securitySummary ? 1 : 0 },
    { name: 'Media Coverage', icon: '📰', color: '#17a2b8', data: research.sourcesUsed?.filter(s => s.includes('news') || s.includes('media')).length || 0 },
  ];
  
  return (
    <ExpandableSection title="Data Sources Overview" icon="📊" color="#6c757d" defaultExpanded={true}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {sources.map((source, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              backgroundColor: source.data > 0 ? '#f8f9fa' : '#e9ecef',
              border: `2px solid ${source.data > 0 ? source.color : '#dee2e6'}`,
              borderRadius: '12px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{source.icon}</div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '14px', 
              color: source.data > 0 ? '#333' : '#6c757d',
              marginBottom: '4px'
            }}>
              {source.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: source.data > 0 ? source.color : '#6c757d',
              fontWeight: '500'
            }}>
              {source.data > 0 ? `${source.data} data points` : 'Not found'}
            </div>
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}

// Analysis Card Component
function AnalysisCard({ 
  title, 
  icon, 
  color, 
  summary, 
  children, 
  dataPoints = 0,
  status = 'available'
}: { 
  title: string; 
  icon: string; 
  color: string; 
  summary: string; 
  children: React.ReactNode; 
  dataPoints?: number;
  status?: 'available' | 'limited' | 'not-found';
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = () => {
    switch (status) {
      case 'available': return color;
      case 'limited': return '#ffc107';
      case 'not-found': return '#6c757d';
      default: return color;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'available': return `${dataPoints} data points`;
      case 'limited': return `${dataPoints} data points - Limited`;
      case 'not-found': return 'Not found';
      default: return `${dataPoints} data points`;
    }
  };
  
  return (
    <div style={{
      border: `2px solid ${getStatusColor()}40`,
      borderRadius: '12px',
      backgroundColor: status === 'not-found' ? '#f8f9fa' : '#fff',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer'
    }}
    onClick={() => setIsExpanded(!isExpanded)}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{
        padding: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '14px', 
          color: status === 'not-found' ? '#6c757d' : '#333',
          marginBottom: '4px'
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: getStatusColor(),
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          {getStatusText()}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          lineHeight: '1.4',
          maxHeight: '40px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {summary}
        </div>
      </div>
      
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${getStatusColor()}20`,
          backgroundColor: '#fafbfc',
          padding: '16px'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Analysis Grid Component
function AnalysisGrid({ research }: { research: ProjectResearch }) {
  const analysisSections = [
    {
      title: 'AI Analysis Summary',
      icon: '🤖',
      color: '#6f42c1',
      status: research.aiSummary ? ('available' as const) : ('not-found' as const),
      dataPoints: research.aiSummary ? 1 : 0,
      summary: research.aiSummary ? 
        research.aiSummary.substring(0, 100) + (research.aiSummary.length > 100 ? '...' : '') : 
        'No AI analysis available',
      content: research.aiSummary && (
        <div className="markdown-content">
          <ReactMarkdown>{research.aiSummary}</ReactMarkdown>
        </div>
      )
    },
    {
      title: 'Key Findings',
      icon: '🔍',
      color: '#28a745',
      status: (research.keyFindings.positives.length > 0 || 
               research.keyFindings.negatives.length > 0 || 
               research.keyFindings.redFlags.length > 0) ? ('available' as const) : ('not-found' as const),
      dataPoints: research.keyFindings.positives.length + 
                  research.keyFindings.negatives.length + 
                  research.keyFindings.redFlags.length,
      summary: `Positive: ${research.keyFindings.positives.length}, Negative: ${research.keyFindings.negatives.length}, Red Flags: ${research.keyFindings.redFlags.length}`,
      content: (research.keyFindings.positives.length > 0 || 
                research.keyFindings.negatives.length > 0 || 
                research.keyFindings.redFlags.length > 0) && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {research.keyFindings.positives.length > 0 && (
            <div style={{
              padding: '16px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#155724', margin: '0 0 12px 0' }}>✅ Positive Aspects</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#155724' }}>
                {research.keyFindings.positives.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          
          {research.keyFindings.negatives.length > 0 && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#856404', margin: '0 0 12px 0' }}>⚠️ Negative Aspects</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                {research.keyFindings.negatives.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
          
          {research.keyFindings.redFlags.length > 0 && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#721c24', margin: '0 0 12px 0' }}>🚨 Red Flags</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#721c24' }}>
                {research.keyFindings.redFlags.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Financial Data',
      icon: '💰',
      color: '#28a745',
      status: research.financialData ? ('available' as const) : ('not-found' as const),
      dataPoints: research.financialData ? 
        (research.financialData.marketCap ? 1 : 0) + 
        (research.financialData.roninTokenInfo ? 1 : 0) + 
        (research.financialData.avalancheTokenInfo ? 1 : 0) : 0,
      summary: research.financialData ? 
        `Market Cap: ${research.financialData.marketCap ? '$' + research.financialData.marketCap.toLocaleString() : 'N/A'}` : 
        'No financial data available',
      content: research.financialData && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {research.financialData.marketCap && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <strong>Market Cap:</strong> ${research.financialData.marketCap.toLocaleString()}
            </div>
          )}
          
          {research.financialData.roninTokenInfo && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f8ff',
              border: '1px solid #4a90e2',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#4a90e2', margin: '0 0 12px 0' }}>🌐 Ronin Network Data</h5>
              {research.financialData.roninTokenInfo.symbol && (
                <p><strong>Token Symbol:</strong> {research.financialData.roninTokenInfo.symbol}</p>
              )}
              {research.financialData.roninTokenInfo.totalSupply && (
                <p><strong>Total Supply:</strong> {parseInt(research.financialData.roninTokenInfo.totalSupply, 16).toLocaleString()}</p>
              )}
              {research.financialData.roninTokenInfo.contractAddress && (
                <p><strong>Contract:</strong> <code style={{ fontSize: '12px' }}>{research.financialData.roninTokenInfo.contractAddress}</code></p>
              )}
              {research.financialData.roninTokenInfo.transactionHistory && (
                <p><strong>Transactions:</strong> {research.financialData.roninTokenInfo.transactionHistory.transactionCount?.toLocaleString() || 'N/A'}</p>
              )}
            </div>
          )}
          
          {research.financialData.avalancheTokenInfo && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f0ff',
              border: '1px solid #e91e63',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#e91e63', margin: '0 0 12px 0' }}>❄️ Avalanche Network Data</h5>
              {research.financialData.avalancheTokenInfo.symbol && (
                <p><strong>Token Symbol:</strong> {research.financialData.avalancheTokenInfo.symbol}</p>
              )}
              {research.financialData.avalancheTokenInfo.tokenInfo && (
                <>
                  {research.financialData.avalancheTokenInfo.tokenInfo.tokenName && (
                    <p><strong>Token Name:</strong> {research.financialData.avalancheTokenInfo.tokenInfo.tokenName}</p>
                  )}
                  {research.financialData.avalancheTokenInfo.tokenInfo.tokenSymbol && (
                    <p><strong>Token Symbol:</strong> {research.financialData.avalancheTokenInfo.tokenInfo.tokenSymbol}</p>
                  )}
                  {research.financialData.avalancheTokenInfo.tokenInfo.totalSupply && (
                    <p><strong>Total Supply:</strong> {parseInt(research.financialData.avalancheTokenInfo.tokenInfo.totalSupply, 16).toLocaleString()}</p>
                  )}
                  {research.financialData.avalancheTokenInfo.tokenInfo.decimals && (
                    <p><strong>Decimals:</strong> {research.financialData.avalancheTokenInfo.tokenInfo.decimals}</p>
                  )}
                </>
              )}
              {research.financialData.avalancheTokenInfo.contractAddress && (
                <p><strong>Contract:</strong> <code style={{ fontSize: '12px' }}>{research.financialData.avalancheTokenInfo.contractAddress}</code></p>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Team Analysis',
      icon: '👥',
      color: '#fd7e14',
      status: research.teamAnalysis ? ('available' as const) : ('not-found' as const),
      dataPoints: research.teamAnalysis ? 
        (research.teamAnalysis.studioAssessment ? 1 : 0) + 
        (research.teamAnalysis.linkedinSummary ? 1 : 0) + 
        (research.teamAnalysis.glassdoorSummary ? 1 : 0) : 0,
      summary: research.teamAnalysis ? 
        `Studio: ${research.teamAnalysis.studioAssessment ? 'Yes' : 'No'}, LinkedIn: ${research.teamAnalysis.linkedinSummary ? 'Yes' : 'No'}, Reviews: ${research.teamAnalysis.glassdoorSummary ? 'Yes' : 'No'}` : 
        'No team analysis available',
      content: research.teamAnalysis && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {research.teamAnalysis.studioAssessment && research.teamAnalysis.studioAssessment.length > 0 && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>🏢 Studio Background</h5>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {research.teamAnalysis.studioAssessment.map((studio: any, i: number) => (
                  <li key={i}>
                    <strong>{studio.companyName}</strong>: 
                    {studio.isDeveloper ? ' Developer' : ''}
                    {studio.isPublisher ? ' Publisher' : ''}
                    {studio.firstProjectDate && studio.firstProjectDate !== 'N/A' ? 
                      ` | First project: ${studio.firstProjectDate}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {research.teamAnalysis.linkedinSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>💼 LinkedIn Insights</h5>
              <p style={{ margin: 0 }}>{research.teamAnalysis.linkedinSummary}</p>
            </div>
          )}
          {research.teamAnalysis.glassdoorSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>🏢 Company Reviews</h5>
              <p style={{ margin: 0 }}>{research.teamAnalysis.glassdoorSummary}</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Technical Assessment',
      icon: '🔧',
      color: '#6c757d',
      status: research.technicalAssessment ? ('available' as const) : ('not-found' as const),
      dataPoints: research.technicalAssessment ? 
        (research.technicalAssessment.securitySummary ? 1 : 0) + 
        (research.technicalAssessment.reviewSummary ? 1 : 0) + 
        (research.technicalAssessment.githubRepo ? 1 : 0) : 0,
      summary: research.technicalAssessment ? 
        `Security: ${research.technicalAssessment.securitySummary ? 'Yes' : 'No'}, Reviews: ${research.technicalAssessment.reviewSummary ? 'Yes' : 'No'}, GitHub: ${research.technicalAssessment.githubRepo ? 'Yes' : 'No'}` : 
        'No technical assessment available',
      content: research.technicalAssessment && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {research.technicalAssessment.securitySummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>🔒 Security Analysis</h5>
              <p style={{ margin: 0 }}>{research.technicalAssessment.securitySummary}</p>
            </div>
          )}
          {research.technicalAssessment.reviewSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>📊 Review Scores</h5>
              <p style={{ margin: 0 }}>{research.technicalAssessment.reviewSummary}</p>
            </div>
          )}
          {research.technicalAssessment.githubRepo && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>💻 GitHub Activity</h5>
              <p style={{ margin: 0 }}>
                <strong>Repository:</strong> {research.technicalAssessment.githubRepo}
                {research.technicalAssessment.githubStats && (
                  <span> | <strong>Stats:</strong> {research.technicalAssessment.githubStats}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Community Health',
      icon: '👥',
      color: '#20c997',
      status: research.communityHealth ? ('available' as const) : ('not-found' as const),
      dataPoints: research.communityHealth ? 
        (research.communityHealth.twitterSummary ? 1 : 0) + 
        (research.communityHealth.steamReviewSummary ? 1 : 0) + 
        (research.communityHealth.discordData ? 1 : 0) + 
        (research.communityHealth.redditSummary ? 1 : 0) : 0,
      summary: research.communityHealth ? 
        `Twitter: ${research.communityHealth.twitterSummary ? 'Yes' : 'No'}, Steam: ${research.communityHealth.steamReviewSummary ? 'Yes' : 'No'}, Discord: ${research.communityHealth.discordData ? 'Yes' : 'No'}, Reddit: ${research.communityHealth.redditSummary ? 'Yes' : 'No'}` : 
        'No community health data available',
      content: research.communityHealth && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {research.communityHealth.twitterSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>🐦 Twitter Activity</h5>
              <p style={{ margin: 0 }}>{research.communityHealth.twitterSummary}</p>
            </div>
          )}
          {research.communityHealth.steamReviewSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>🎮 Steam Reviews</h5>
              <p style={{ margin: 0 }}>{research.communityHealth.steamReviewSummary}</p>
            </div>
          )}
          {research.communityHealth.discordData && research.communityHealth.discordData.server_name && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>💬 Discord Community</h5>
              <p style={{ margin: 0 }}>
                <strong>Server:</strong> {research.communityHealth.discordData.server_name}
                {research.communityHealth.discordData.member_count && (
                  <span> | <strong>Members:</strong> {research.communityHealth.discordData.member_count.toLocaleString()}</span>
                )}
              </p>
            </div>
          )}
          {research.communityHealth.redditSummary && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h5 style={{ color: '#2c5aa0', margin: '0 0 12px 0' }}>📱 Reddit Community</h5>
              <p style={{ margin: 0 }}>{research.communityHealth.redditSummary}</p>
            </div>
          )}
        </div>
      )
    }
  ];
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {analysisSections.map((section, index) => (
        <AnalysisCard
          key={index}
          title={section.title}
          icon={section.icon}
          color={section.color}
          summary={section.summary}
          dataPoints={section.dataPoints}
          status={section.status}
        >
          {section.content}
        </AnalysisCard>
      ))}
    </div>
  );
}

function App() {
  const [projectName, setProjectName] = useState('');
  const [research, setResearch] = useState<ProjectResearch | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'auto' | 'ethereum' | 'ronin' | 'avalanche'>('auto');
  const [contractAddress, setContractAddress] = useState('');
  const [roninContractAddress, setRoninContractAddress] = useState('');
  const [avalancheContractAddress, setAvalancheContractAddress] = useState('');
  const [useEnhancedResearch, setUseEnhancedResearch] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);
    setResearch(null);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://dyor-bot.onrender.com';
      const endpoint = useEnhancedResearch ? '/api/research-enhanced' : '/api/research';
      const fullUrl = `${apiUrl}${endpoint}`;
      
      const requestBody: any = { 
        projectName,
        selectedNetwork // Send the selected network to the backend
      };
      
      // Add network-specific contract addresses
      if (selectedNetwork === 'ethereum' && contractAddress) {
        requestBody.contractAddress = contractAddress;
      } else if (selectedNetwork === 'ronin' && roninContractAddress) {
        requestBody.roninContractAddress = roninContractAddress;
      } else if (selectedNetwork === 'avalanche' && avalancheContractAddress) {
        requestBody.avalancheContractAddress = avalancheContractAddress;
      } else if (selectedNetwork === 'auto') {
        // Try all available contract addresses
        if (contractAddress) requestBody.contractAddress = contractAddress;
        if (roninContractAddress) requestBody.roninContractAddress = roninContractAddress;
        if (avalancheContractAddress) requestBody.avalancheContractAddress = avalancheContractAddress;
      }
      
      // Add feedback for enhanced research
      if (useEnhancedResearch && feedback) {
        requestBody.feedback = {
          needsMoreData: true,
          missingDataTypes: ['whitepaper', 'team_info'],
          confidenceLevel: 'medium',
          specificRequests: [feedback],
          analysisReadiness: false,
          recommendations: ['Need more comprehensive data']
        };
      }
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setResearch(data);
    } catch (err) {
      setError(`Failed to fetch research: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResearchLoading(false);
    }
  };

  return (
    <div className="App">
      <LoadingModal show={researchLoading} />
      <h1>DYOR BOT</h1>
      <hr />
      <h2>Project Research</h2>
      <form onSubmit={handleSearch} style={{ 
        marginBottom: 16, 
        maxWidth: 600, 
        margin: '0 auto 16px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        
        {/* Quick Search Buttons */}

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px',
          width: '100%',
          maxWidth: 500
        }}>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Enter project or token name"
            style={{ 
              marginRight: 8, 
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
          <button 
            type="submit" 
            disabled={researchLoading || !projectName}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '16px',
              cursor: researchLoading || !projectName ? 'not-allowed' : 'pointer',
              opacity: researchLoading || !projectName ? 0.6 : 1
            }}
          >
            {researchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>



          {/* NEW: Enhanced Research Options */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={useEnhancedResearch}
                onChange={(e) => setUseEnhancedResearch(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Use Enhanced Research (Caching, Confidence Thresholds, Feedback Loop)
            </label>
          </div>

          {useEnhancedResearch && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Feedback for Second AI (Optional):
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter specific data requests or feedback for the AI orchestrator..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  minHeight: 60,
                  resize: 'vertical',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
      </form>
      <div style={{
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        margin: '16px auto',
        maxWidth: 600,
        fontSize: '1.1em',
        color: '#333',
      }}>
        <strong>About:</strong> DYOR BOT is a research tool for analyzing Web3 and gaming projects. It uses over 10 data sources to provide comprehensive project analysis and key findings.<br/><br/>
        <strong>How to use:</strong> Type a project or token name and press Search. Review the summary and details to make informed decisions.
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {research && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
          minHeight: '100vh'
        }}>
          {/* Header Section */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>{research.projectName}</h2>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
                  Type: <strong>{research.projectType}</strong>
                </p>
              </div>
              {research.confidence && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '18px'
                  }}>
                    Grade {research.confidence.overall.grade}
                  </div>
                  <div style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {research.confidence.overall.score}% Confidence
                  </div>
                </div>
              )}
            </div>
            
            {research.confidence && (
              <ConfidenceIndicator confidence={research.confidence} />
            )}
          </div>

          {/* Data Sources Grid */}
          <DataSourcesGrid research={research} />

          {/* Analysis Grid */}
          <AnalysisGrid research={research} />

          {/* Social Links */}
          <SocialLinks research={research} />

          {/* Sources Used */}
          {research.sourcesUsed && research.sourcesUsed.length > 0 && (
            <div style={{
              fontSize: '0.9em',
              color: '#666',
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Data Sources:</strong> {research.sourcesUsed.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
