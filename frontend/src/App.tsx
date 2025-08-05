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
    <div className="loading-modal">
      <img src={images[index]} alt="Researching..." className="loading-image" />
      <div className="loading-text">Researching project...</div>
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

  // Export functionality
  const exportReport = () => {
    if (!research) return;
    
    const reportData = {
      projectName: research.projectName,
      projectType: research.projectType,
      timestamp: new Date().toISOString(),
      aiSummary: research.aiSummary,
      keyFindings: research.keyFindings,
      financialData: research.financialData,
      teamAnalysis: research.teamAnalysis,
      technicalAssessment: research.technicalAssessment,
      communityHealth: research.communityHealth,
      confidence: research.confidence,
      sourcesUsed: research.sourcesUsed
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${research.projectName}_DYOR_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    if (!research) return;
    
    const csvData = [
      ['Project Name', research.projectName],
      ['Project Type', research.projectType],
      ['AI Summary', research.aiSummary || ''],
      ['Confidence Score', research.confidence?.overall.score || ''],
      ['Sources Used', research.sourcesUsed?.join('; ') || ''],
      ['Positive Findings', research.keyFindings.positives.join('; ') || ''],
      ['Negative Findings', research.keyFindings.negatives.join('; ') || ''],
      ['Red Flags', research.keyFindings.redFlags.join('; ') || '']
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${research.projectName}_DYOR_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        selectedNetwork
      };
      
      if (selectedNetwork === 'ethereum' && contractAddress) {
        requestBody.contractAddress = contractAddress;
      } else if (selectedNetwork === 'ronin' && roninContractAddress) {
        requestBody.roninContractAddress = roninContractAddress;
      } else if (selectedNetwork === 'avalanche' && avalancheContractAddress) {
        requestBody.avalancheContractAddress = avalancheContractAddress;
      } else if (selectedNetwork === 'auto') {
        if (contractAddress) requestBody.contractAddress = contractAddress;
        if (roninContractAddress) requestBody.roninContractAddress = roninContractAddress;
        if (avalancheContractAddress) requestBody.avalancheContractAddress = avalancheContractAddress;
      }
      
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

  // If we have research results, show the three-panel layout
  if (research) {
  return (
    <div className="App">
      <LoadingModal show={researchLoading} />
        
        <div className="main-container">
          {/* Left Panel - DYOR BOT Branding and Search */}
          <div className="left-panel">
            <div className="logo-container">
              <div className="logo">
                <div className="redacted-bar"></div>
              </div>
              <h1 className="brand-title">DYOR BOT</h1>
            </div>
            
            <div className="search-input-section">
              <div className="search-input-title">SEARCH INPUT</div>
              <form onSubmit={handleSearch}>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
                  placeholder="// enter token or project"
                  className="search-input"
          />
          <button 
            type="submit" 
            disabled={researchLoading || !projectName}
                  className="search-button"
                >
                  {researchLoading ? 'SEARCHING...' : 'SEARCH'}
          </button>
              </form>
        </div>

            {/* Gathered Links */}
            {research.sourcesUsed && Array.isArray(research.sourcesUsed) && research.sourcesUsed.length > 0 && (
              <div className="sources-section">
                <div className="search-input-title">GATHERED LINKS</div>
                <div className="links-container">
                  {research.sourcesUsed.map((source, index) => (
                    <div key={index} className="link-item">
                      <div className="link-icon">🔗</div>
                      <div className="link-content">
                        <div className="link-url">
                          {source && source.length > 50 ? source.substring(0, 50) + '...' : source}
                        </div>
                        <div className="link-domain">
                          {(() => {
                            try {
                              return source && new URL(source).hostname;
                            } catch (error) {
                              return 'Invalid URL';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="links-summary">
                  {research.sourcesUsed.length} data sources gathered
                </div>
              </div>
            )}
          </div>

          {/* Middle Panel - Research Results */}
          <div className="middle-panel">
            {/* Project Header */}
            <div className="research-header">
              <h2 className="research-title">{research.projectName}</h2>
              <div className="project-type">{research.projectType}</div>
            </div>

            {/* AI Summary */}
            {research.aiSummary && (
              <div className="research-section">
                <div className="section-title">AI ANALYSIS SUMMARY</div>
                <div className="markdown-content">
                  <ReactMarkdown>{research.aiSummary}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Key Findings */}
            {(research.keyFindings.positives.length > 0 || 
              research.keyFindings.negatives.length > 0 || 
              research.keyFindings.redFlags.length > 0) && (
              <div className="research-section">
                <div className="section-title">KEY FINDINGS</div>
                <div className="findings-grid">
                  {research.keyFindings.positives && Array.isArray(research.keyFindings.positives) && research.keyFindings.positives.length > 0 && (
                    <div className="finding-category positive">
                      <div className="finding-title">✅ POSITIVE ASPECTS</div>
                      <ul>
                        {research.keyFindings.positives.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {research.keyFindings.negatives && Array.isArray(research.keyFindings.negatives) && research.keyFindings.negatives.length > 0 && (
                    <div className="finding-category negative">
                      <div className="finding-title">⚠️ NEGATIVE ASPECTS</div>
                      <ul>
                        {research.keyFindings.negatives.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {research.keyFindings.redFlags && Array.isArray(research.keyFindings.redFlags) && research.keyFindings.redFlags.length > 0 && (
                    <div className="finding-category red-flag">
                      <div className="finding-title">🚨 RED FLAGS</div>
                      <ul>
                        {research.keyFindings.redFlags.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Data */}
            {research.financialData && (
              <div className="research-section">
                <div className="section-title">FINANCIAL DATA</div>
                <div className="financial-grid">
                  {research.financialData.marketCap && (
                    <div className="financial-item">
                      <div className="financial-label">Market Cap</div>
                      <div className="financial-value">${research.financialData.marketCap.toLocaleString()}</div>
                    </div>
                  )}
                  
                  {research.financialData.roninTokenInfo && (
                    <div className="financial-item">
                      <div className="financial-label">🌐 Ronin Network</div>
                      <div className="financial-details">
                        {research.financialData.roninTokenInfo.symbol && (
                          <div>Symbol: {research.financialData.roninTokenInfo.symbol}</div>
                        )}
                        {research.financialData.roninTokenInfo.totalSupply && (
                          <div>Supply: {parseInt(research.financialData.roninTokenInfo.totalSupply, 16).toLocaleString()}</div>
                        )}
                        {research.financialData.roninTokenInfo.contractAddress && (
                          <div>Contract: {research.financialData.roninTokenInfo.contractAddress.substring(0, 20)}...</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {research.financialData.avalancheTokenInfo && (
                    <div className="financial-item">
                      <div className="financial-label">❄️ Avalanche Network</div>
                      <div className="financial-details">
                        {research.financialData.avalancheTokenInfo.tokenInfo?.tokenSymbol && (
                          <div>Symbol: {research.financialData.avalancheTokenInfo.tokenInfo.tokenSymbol}</div>
                        )}
                        {research.financialData.avalancheTokenInfo.tokenInfo?.totalSupply && (
                          <div>Supply: {parseInt(research.financialData.avalancheTokenInfo.tokenInfo.totalSupply, 16).toLocaleString()}</div>
                        )}
                        {research.financialData.avalancheTokenInfo.contractAddress && (
                          <div>Contract: {research.financialData.avalancheTokenInfo.contractAddress.substring(0, 20)}...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Analysis */}
            {research.teamAnalysis && (
              <div className="research-section">
                <div className="section-title">TEAM ANALYSIS</div>
                <div className="team-content">
                  {research.teamAnalysis.studioAssessment && Array.isArray(research.teamAnalysis.studioAssessment) && research.teamAnalysis.studioAssessment.length > 0 && (
                    <div className="team-item">
                      <div className="team-label">🏢 Studio Background</div>
                      <ul>
                        {research.teamAnalysis.studioAssessment.map((studio: any, i: number) => (
                          <li key={i}>
                            <strong>{studio.companyName}</strong>
                            {studio.isDeveloper ? ' (Developer)' : ''}
                            {studio.isPublisher ? ' (Publisher)' : ''}
                            {studio.firstProjectDate && studio.firstProjectDate !== 'N/A' ? 
                              ` | First project: ${studio.firstProjectDate}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {research.teamAnalysis.linkedinSummary && (
                    <div className="team-item">
                      <div className="team-label">💼 LinkedIn Insights</div>
                      <p>{research.teamAnalysis.linkedinSummary}</p>
                    </div>
                  )}
                  
                  {research.teamAnalysis.glassdoorSummary && (
                    <div className="team-item">
                      <div className="team-label">🏢 Company Reviews</div>
                      <p>{research.teamAnalysis.glassdoorSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Assessment */}
            {research.technicalAssessment && (
              <div className="research-section">
                <div className="section-title">TECHNICAL ASSESSMENT</div>
                <div className="technical-content">
                  {research.technicalAssessment.securitySummary && (
                    <div className="technical-item">
                      <div className="technical-label">🔒 Security Analysis</div>
                      <p>{research.technicalAssessment.securitySummary}</p>
                    </div>
                  )}
                  
                  {research.technicalAssessment.reviewSummary && (
                    <div className="technical-item">
                      <div className="technical-label">📊 Review Scores</div>
                      <p>{research.technicalAssessment.reviewSummary}</p>
                    </div>
                  )}
                  
                  {research.technicalAssessment.githubRepo && (
                    <div className="technical-item">
                      <div className="technical-label">💻 GitHub Activity</div>
                      <p>
                        <strong>Repository:</strong> {research.technicalAssessment.githubRepo}
                        {research.technicalAssessment.githubStats && (
                          <span> | <strong>Stats:</strong> {research.technicalAssessment.githubStats}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Community Health */}
            {research.communityHealth && (
              <div className="research-section">
                <div className="section-title">COMMUNITY HEALTH</div>
                <div className="community-content">
                  {research.communityHealth.twitterSummary && (
                    <div className="community-item">
                      <div className="community-label">🐦 Twitter Activity</div>
                      <p>{research.communityHealth.twitterSummary}</p>
            </div>
          )}
                  
                  {research.communityHealth.steamReviewSummary && (
                    <div className="community-item">
                      <div className="community-label">🎮 Steam Reviews</div>
                      <p>{research.communityHealth.steamReviewSummary}</p>
      </div>
                  )}
                  
                  {research.communityHealth.discordData && research.communityHealth.discordData.server_name && (
                    <div className="community-item">
                      <div className="community-label">💬 Discord Community</div>
                      <p>
                        <strong>Server:</strong> {research.communityHealth.discordData.server_name}
                        {research.communityHealth.discordData.member_count && (
                          <span> | <strong>Members:</strong> {research.communityHealth.discordData.member_count.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {research.communityHealth.redditSummary && (
                    <div className="community-item">
                      <div className="community-label">📱 Reddit Community</div>
                      <p>{research.communityHealth.redditSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Right Panel - Confidence and Signal Report */}
          <div className="right-panel">
            {/* Confidence Display */}
              {research.confidence && (
              <div className="confidence-section">
                <div className="signal-title">RESEARCH GRADE</div>
                <div className="grade-display">
                  <div className="grade-text">GRADE {research.confidence.overall.grade}</div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${research.confidence.overall.score}%` }}></div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#00ff41' }}>
                    {research.confidence.overall.score}% CONFIDENCE
                  </div>
                </div>
                <div className="confidence-description">
                  {research.confidence.overall.description}
                  </div>
                </div>
              )}
            
            {/* Data Sources Overview */}
            {research.confidence && research.confidence.sourceDetails && Array.isArray(research.confidence.sourceDetails) && (
              <div className="sources-overview">
                <div className="signal-title">DATA SOURCES</div>
                <div className="sources-grid">
                  {research.confidence.sourceDetails.map((source, index) => (
                    <div key={index} className={`source-item ${source.found ? 'found' : 'not-found'}`}>
                      <div className="source-icon">{source.icon}</div>
                      <div className="source-name">{source.displayName}</div>
                      <div className="source-status">
                        {source.found ? `${source.dataPoints} data points` : 'Not found'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Guidance */}
            {research.confidence && research.confidence.userGuidance && (
              <div className="guidance-section">
                <div className="signal-title">RECOMMENDED USE</div>
                <div className="guidance-content">
                  <div className="guidance-text">{research.confidence.userGuidance.useCase}</div>
                  {research.confidence.userGuidance.warnings && Array.isArray(research.confidence.userGuidance.warnings) && research.confidence.userGuidance.warnings.length > 0 && (
                    <div className="guidance-warnings">
                      <div className="warning-title">⚠️ WARNINGS</div>
                      <ul>
                        {research.confidence.userGuidance.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Export Buttons */}
            <div className="export-section">
              <div className="signal-title">EXPORT OPTIONS</div>
              <button className="glitch-button export" onClick={exportReport}>
                EXPORT REPORT
              </button>
              <button className="glitch-button export" onClick={exportData}>
                EXPORT DATA ▼
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen - simple layout with logo, search, and description
  return (
    <div className="App">
      <LoadingModal show={researchLoading} />
      
      <div className="initial-screen">
        {/* Logo and Title */}
        <div className="logo-container">
          <div className="logo">
            <div className="redacted-bar"></div>
          </div>
          <h1 className="brand-title">DYOR BOT</h1>
        </div>

        {/* Search Form */}
        <div className="search-form-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="// enter token or project"
              className="search-input-large"
            />
            <button 
              type="submit" 
              disabled={researchLoading || !projectName}
              className="search-button-large"
            >
              {researchLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>
        </div>

        {/* Description */}
        <div className="app-description">
          <div className="description-title">ABOUT</div>
          <p>DYOR BOT is a research tool for analyzing Web3 and gaming projects. It uses over 10 data sources to provide comprehensive project analysis and key findings.</p>
          
          <div className="description-title">HOW TO USE</div>
          <p>Type a project or token name and press Search. Review the summary and details to make informed decisions.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default App;
