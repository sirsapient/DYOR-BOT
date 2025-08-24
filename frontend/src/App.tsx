import React, { useState, useEffect } from 'react';
import { ProjectResearch } from './types';
import { mockAxieInfinityData } from './mockData';
import { TokenPriceChart } from './components/TokenPriceChart';
import { NFTLifetimeValueChart } from './components/NFTLifetimeValueChart';
import ChatBubble, { ChatMessage } from './components/ChatBubble';
import './App.css';

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
  }, [show, images.length]);
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
  const [developmentMode, setDevelopmentMode] = useState(false);
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionProjects, setSessionProjects] = useState<{ [key: string]: ProjectResearch }>({});

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

  // Chat message handling
  const handleChatMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      projectContext: Object.keys(sessionProjects)
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      // Call the backend chat API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const fullUrl = `${apiUrl}/api/chat`;
      
      const requestBody = {
        message,
        projects: sessionProjects,
        sessionId: Date.now().toString() // Simple session ID for now
      };
      
      console.log('💬 Sending chat request:', requestBody);
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        projectContext: Object.keys(sessionProjects)
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback to simple response if backend fails
      const fallbackResponse = generateFallbackResponse(message, sessionProjects);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date(),
        projectContext: Object.keys(sessionProjects)
      };
      setChatMessages(prev => [...prev, botMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Fallback response generator (simple keyword matching)
  const generateFallbackResponse = (message: string, projects: { [key: string]: ProjectResearch }): string => {
    const projectNames = Object.keys(projects);
    
    if (projectNames.length === 0) {
      return "I don't have any project data in my session. Please search for a project first!";
    }

    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('market cap') || lowerMessage.includes('marketcap')) {
      const responses = projectNames.map(name => {
        const project = projects[name];
        const marketCap = project.financialData?.marketCap;
        return `${name}: $${marketCap ? marketCap.toLocaleString() : 'N/A'}`;
      });
      return `Market Cap Comparison:\n${responses.join('\n')}`;
    }

    if (lowerMessage.includes('team') || lowerMessage.includes('founder')) {
      const responses = projectNames.map(name => {
        const project = projects[name];
        const teamSize = project.teamAnalysis?.teamMembers?.length || 0;
        return `${name}: ${teamSize} team members found`;
      });
      return `Team Information:\n${responses.join('\n')}`;
    }

    if (lowerMessage.includes('community') || lowerMessage.includes('discord')) {
      const responses = projectNames.map(name => {
        const project = projects[name];
        const discordMembers = project.communityHealth?.discordData?.member_count || 0;
        return `${name}: ${discordMembers.toLocaleString()} Discord members`;
      });
      return `Community Size:\n${responses.join('\n')}`;
    }

    if (lowerMessage.includes('risk') || lowerMessage.includes('red flag')) {
      const responses = projectNames.map(name => {
        const project = projects[name];
        const redFlags = project.keyFindings?.redFlags?.length || 0;
        return `${name}: ${redFlags} red flags identified`;
      });
      return `Risk Assessment:\n${responses.join('\n')}`;
    }

    if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
      return `I can help you compare the projects! Try asking about specific metrics like:
- Market cap comparison
- Team size differences  
- Community engagement
- Risk assessment
- Token information`;
    }

    return `I have data for ${projectNames.join(', ')}. You can ask me about:
- Market cap and financial data
- Team information and background
- Community size and engagement
- Risk factors and red flags
- Token details and metrics
- General project comparisons`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);
    setResearch(null);
    setError(null);
    
    console.log('🔍 Search initiated for:', projectName);
    console.log('🔍 Development mode:', developmentMode);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Development mode - use mock data (only in development environment)
    if (process.env.NODE_ENV === 'development' && developmentMode) {
      console.log('🔍 Using mock data (development mode enabled)');
      setTimeout(() => {
        setResearch(mockAxieInfinityData);
        // Add to session projects
        setSessionProjects(prev => ({
          ...prev,
          [mockAxieInfinityData.projectName]: mockAxieInfinityData
        }));
        setResearchLoading(false);
      }, 1000); // Simulate loading time
      return;
    }
    
    console.log('🔍 Making live API call...');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // First, check if the backend is available
      console.log('🔍 Checking backend health...');
      try {
        const healthRes = await fetch(`${apiUrl}/api/health`);
        if (!healthRes.ok) {
          throw new Error(`Backend health check failed: ${healthRes.status}`);
        }
        console.log('🔍 Backend is healthy');
      } catch (healthErr) {
        console.error('🔍 Backend health check failed:', healthErr);
        throw new Error(`Backend is not available. Please ensure the backend server is running. Error: ${healthErr instanceof Error ? healthErr.message : 'Unknown error'}`);
      }
      
      const fullUrl = `${apiUrl}/api/research`;
      
      const requestBody = { 
        projectName
      };
      
      // Debug: Log what we're sending
      console.log('🔍 API URL:', apiUrl);
      console.log('🔍 Full URL:', fullUrl);
      console.log('🔍 Sending request with data:', requestBody);
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('🔍 Response status:', res.status);
      console.log('🔍 Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('🔍 Error response body:', errorText);
        throw new Error(`API error: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('🔍 Received data:', data);
      setResearch(data);
      
      // Add to session projects
      setSessionProjects(prev => ({
        ...prev,
        [data.projectName]: data
      }));
    } catch (err) {
      console.error('🔍 Search error:', err);
      setError(`Failed to fetch research: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResearchLoading(false);
    }
  };

  // If we have research results, show the two-panel layout
  if (research) {
  return (
    <div className="App">
      <LoadingModal show={researchLoading} />
      
      <ChatBubble
        onSendMessage={handleChatMessage}
        messages={chatMessages}
        isLoading={chatLoading}
        projectsInSession={Object.keys(sessionProjects)}
      />
        
        <div className="main-container">
          {/* Left Panel - Interactive Data Sources */}
          <div className="left-panel">
            {/* Project Header */}
            <div className="project-header">
              <h2 className="project-title">{research.projectName}</h2>
              <div className="project-type">{research.projectType}</div>
            </div>

            {/* Token Price Chart */}
            <TokenPriceChart
              tokenId={research.projectName === "Axie Infinity" ? "axie-infinity" :
                      research.financialData?.roninTokenInfo?.symbol?.toLowerCase() || 
                      research.financialData?.avalancheTokenInfo?.tokenInfo?.tokenSymbol?.toLowerCase() ||
                      research.projectName.toLowerCase().replace(/\s+/g, '-')}
              tokenSymbol={research.financialData?.roninTokenInfo?.symbol || 
                          research.financialData?.avalancheTokenInfo?.tokenInfo?.tokenSymbol}
              projectName={research.projectName}
            />

            {/* NFT Lifetime Value Chart */}
            {research.nftData && research.nftData.length > 0 && (
              <NFTLifetimeValueChart
                nftData={research.nftData[0]} // Show the top NFT collection
                projectName={research.projectName}
              />
            )}

            {/* Confidence Display */}
            {research.confidence && (
              <div className="confidence-section">
                <div className="confidence-title">RESEARCH GRADE</div>
                <div className="grade-display">
                  <div className="grade-text">GRADE {research.confidence.overall.grade}</div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${research.confidence.overall.score}%` }}></div>
                  </div>
                  <div className="confidence-score">
                    {research.confidence.overall.score}% CONFIDENCE
                  </div>
                </div>
                <div className="confidence-description">
                  {research.confidence.overall.description}
                </div>
              </div>
            )}

            {/* Interactive Data Sources */}
            <div className="interactive-sources">
              <div className="sources-title">INTERACTIVE DATA SOURCES</div>
              
              {/* Official Sources */}
              {research.discoveredUrls && Object.keys(research.discoveredUrls).length > 0 && (
                <div className="source-category">
                  <div className="category-title">🌐 OFFICIAL SOURCES</div>
                  <div className="source-links">
                    {Object.entries(research.discoveredUrls).map(([sourceType, url], index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="source-link">
                        <div className="source-icon">
                          {sourceType === 'whitepaper' ? '📄' :
                           sourceType === 'documentation' ? '📚' :
                           sourceType === 'github' ? '💻' :
                           sourceType === 'security_audit' ? '🔒' :
                           sourceType === 'team_info' ? '🏢' :
                           sourceType === 'blog' ? '📝' :
                           sourceType === 'social_media' ? '🐦' :
                           sourceType === 'website' ? '🌐' : '🔗'}
                        </div>
                        <div className="source-info">
                          <div className="source-name">{sourceType.replace('_', ' ').toUpperCase()}</div>
                          <div className="source-domain">
                            {(() => {
                              try {
                                return url && new URL(url).hostname;
                              } catch (error) {
                                return 'Invalid URL';
                              }
                            })()}
                          </div>
                        </div>
                        <div className="source-arrow">→</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Download Links */}
              {research.gameData && research.gameData.downloadLinks && research.gameData.downloadLinks.length > 0 && (
                <div className="source-category">
                  <div className="category-title">🎮 GAME DOWNLOADS</div>
                  <div className="source-links">
                    {research.gameData.downloadLinks.map((link, index) => (
                      <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="source-link">
                        <div className="source-icon">
                          {link.platform === 'steam' ? '🎮' :
                           link.platform === 'epic' ? '🎯' :
                           link.platform === 'website' ? '🌐' :
                           link.platform === 'appstore' ? '📱' :
                           link.platform === 'googleplay' ? '🤖' :
                           link.platform === 'itchio' ? '🎲' :
                           link.platform === 'gog' ? '💎' :
                           link.platform === 'humble' ? '🎁' : '🔗'}
                        </div>
                        <div className="source-info">
                          <div className="source-name">{link.platform.toUpperCase()}</div>
                          <div className="source-domain">
                            {(() => {
                              try {
                                return link.url && new URL(link.url).hostname;
                              } catch (error) {
                                return 'Invalid URL';
                              }
                            })()}
                          </div>
                        </div>
                        <div className="source-arrow">→</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {(research.keyFindings.positives.length > 0 || 
                research.keyFindings.negatives.length > 0 || 
                research.keyFindings.redFlags.length > 0) && (
                <div className="source-category">
                  <div className="category-title">🔍 KEY FINDINGS</div>
                  <div className="findings-summary">
                    {research.keyFindings.positives && research.keyFindings.positives.length > 0 && (
                      <div className="finding-item positive">
                        <span className="finding-icon">✅</span>
                        <span className="finding-text">{research.keyFindings.positives.length} Positive Aspects</span>
                      </div>
                    )}
                    {research.keyFindings.negatives && research.keyFindings.negatives.length > 0 && (
                      <div className="finding-item negative">
                        <span className="finding-icon">⚠️</span>
                        <span className="finding-text">{research.keyFindings.negatives.length} Negative Aspects</span>
                      </div>
                    )}
                    {research.keyFindings.redFlags && research.keyFindings.redFlags.length > 0 && (
                      <div className="finding-item red-flag">
                        <span className="finding-icon">🚨</span>
                        <span className="finding-text">{research.keyFindings.redFlags.length} Red Flags</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Buttons */}
              <div className="export-section">
                <div className="export-title">EXPORT OPTIONS</div>
                <button className="export-button" onClick={exportReport}>
                  EXPORT REPORT
                </button>
                <button className="export-button" onClick={exportData}>
                  EXPORT DATA
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Summary (Crown Jewel) + Data Point Summaries */}
          <div className="right-panel">
            {/* Search and Branding Header */}
            <div className="search-header">
              <div className="logo-container">
                <div className="logo">
                  <div className="redacted-bar"></div>
                </div>
                <h1 className="brand-title">DYOR BOT</h1>
              </div>
              
              {/* Development Mode Toggle - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="dev-mode-toggle">
                  <label className="dev-mode-label">
                    <input
                      type="checkbox"
                      checked={developmentMode}
                      onChange={(e) => setDevelopmentMode(e.target.checked)}
                      className="dev-mode-checkbox"
                    />
                    <span className="dev-mode-text">DEV MODE (Axie Infinity Mock Data)</span>
                  </label>
                </div>
              )}
              
              <div className="search-input-section">
                <div className="search-input-title">SEARCH INPUT</div>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder={process.env.NODE_ENV === 'development' && developmentMode ? "// dev mode - any input works" : "// enter token or project"}
                    className="search-input"
                  />
                  <button 
                    type="submit" 
                    disabled={researchLoading || (!projectName && !(process.env.NODE_ENV === 'development' && developmentMode))}
                    className="search-button"
                  >
                    {researchLoading ? 'SEARCHING...' : 'SEARCH'}
                  </button>
                  {developmentMode && process.env.NODE_ENV === 'development' && (
                    <button 
                      type="button"
                      onClick={() => {
                        setResearchLoading(true);
                        setTimeout(() => {
                          setResearch(mockAxieInfinityData);
                          // Add to session projects
                          setSessionProjects(prev => ({
                            ...prev,
                            [mockAxieInfinityData.projectName]: mockAxieInfinityData
                          }));
                          setResearchLoading(false);
                        }, 500);
                      }}
                      disabled={researchLoading}
                      className="mock-data-button"
                    >
                      LOAD MOCK DATA
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* AI Summary - Crown Jewel */}
            {research.aiSummary && (
              <div className="ai-summary-crown-jewel">
                <div className="crown-jewel-title">AI ANALYSIS SUMMARY</div>
                <div className="ai-summary-content expanded">
                  <div className="ai-summary-paragraphs">
                    {research.aiSummary
                      .split('\n\n') // Split into sections
                      .map((section, sectionIndex) => {
                        const lines = section.split('\n');
                        const firstLine = lines[0];
                        
                        // Check if this is a main section header (starts with #)
                        if (firstLine.startsWith('# ')) {
                          const sectionTitle = firstLine.replace('# ', '');
                          const sectionContent = lines.slice(1).join('\n');
                          
                          return (
                            <div key={sectionIndex} className="ai-summary-section">
                              <h2 className="section-header">{sectionTitle}</h2>
                              {sectionContent && (
                                <div className="section-content">
                                  {sectionContent
                                    .split('\n')
                                    .map((paragraph, paraIndex) => {
                                      // Handle subsection headers (##)
                                      if (paragraph.startsWith('## ')) {
                                        const subsectionTitle = paragraph.replace('## ', '');
                                        return (
                                          <h3 key={paraIndex} className="subsection-header">
                                            {subsectionTitle}
                                          </h3>
                                        );
                                      }
                                      
                                      // Handle bullet points
                                      if (paragraph.startsWith('- **') || paragraph.startsWith('- ')) {
                                        const bulletText = paragraph.replace('- **', '').replace('- ', '');
                                        return (
                                          <div key={paraIndex} className="bullet-point">
                                            <span className="bullet-icon">•</span>
                                            <span className="bullet-text">{bulletText}</span>
                                          </div>
                                        );
                                      }
                                      
                                      // Regular paragraphs
                                      if (paragraph.trim().length > 0) {
                                        return (
                                          <p key={paraIndex} className="ai-summary-paragraph">
                                            {paragraph.trim()}
                                          </p>
                                        );
                                      }
                                      
                                      return null;
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        // Handle content without main headers
                        return (
                          <div key={sectionIndex} className="ai-summary-section">
                            {lines.map((line, lineIndex) => {
                              if (line.startsWith('## ')) {
                                const subsectionTitle = line.replace('## ', '');
                                return (
                                  <h3 key={lineIndex} className="subsection-header">
                                    {subsectionTitle}
                                  </h3>
                                );
                              }
                              
                              if (line.startsWith('- **') || line.startsWith('- ')) {
                                const bulletText = line.replace('- **', '').replace('- ', '');
                                return (
                                  <div key={lineIndex} className="bullet-point">
                                    <span className="bullet-icon">•</span>
                                    <span className="bullet-text">{bulletText}</span>
                                  </div>
                                );
                              }
                              
                              if (line.trim().length > 0) {
                                return (
                                  <p key={lineIndex} className="ai-summary-paragraph">
                                    {line.trim()}
                                  </p>
                                );
                              }
                              
                              return null;
                            })}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Data Point Summaries */}
            <div className="data-summaries">
              {/* Financial Summary */}
              {research.financialData && (
                <div className="data-summary-section">
                  <div className="summary-title">💰 FINANCIAL SUMMARY</div>
                  <div className="summary-content">
                    {research.financialData.marketCap && (
                      <div className="summary-item">
                        <span className="summary-label">Market Cap:</span>
                        <span className="summary-value">${research.financialData.marketCap.toLocaleString()}</span>
                      </div>
                    )}
                    {research.financialData.roninTokenInfo && (
                      <div className="summary-item">
                        <span className="summary-label">Ronin Token:</span>
                        <span className="summary-value">{research.financialData.roninTokenInfo.symbol || 'N/A'}</span>
                      </div>
                    )}
                    {research.financialData.avalancheTokenInfo && (
                      <div className="summary-item">
                        <span className="summary-label">Avalanche Token:</span>
                        <span className="summary-value">{research.financialData.avalancheTokenInfo.tokenInfo?.tokenSymbol || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team Summary */}
              {research.teamAnalysis && (
                <div className="data-summary-section">
                  <div className="summary-title">👥 TEAM SUMMARY</div>
                  <div className="summary-content">
                    {research.teamAnalysis.studioAssessment && research.teamAnalysis.studioAssessment.length > 0 && (
                      <div className="summary-item">
                        <span className="summary-label">Studios:</span>
                        <span className="summary-value">{research.teamAnalysis.studioAssessment.length} found</span>
                      </div>
                    )}
                    {research.teamAnalysis.teamMembers && research.teamAnalysis.teamMembers.length > 0 && (
                      <div className="summary-item">
                        <span className="summary-label">Team Members:</span>
                        <span className="summary-value">{research.teamAnalysis.teamMembers.length} found</span>
                      </div>
                    )}
                    {research.teamAnalysis.linkedinSummary && (
                      <div className="summary-item">
                        <span className="summary-label">LinkedIn:</span>
                        <span className="summary-value">Data available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Summary */}
              {research.technicalAssessment && (
                <div className="data-summary-section">
                  <div className="summary-title">🔧 TECHNICAL SUMMARY</div>
                  <div className="summary-content">
                    {research.technicalAssessment.securitySummary && (
                      <div className="summary-item">
                        <span className="summary-label">Security:</span>
                        <span className="summary-value">Analysis available</span>
                      </div>
                    )}
                    {research.technicalAssessment.reviewSummary && (
                      <div className="summary-item">
                        <span className="summary-label">Reviews:</span>
                        <span className="summary-value">Data available</span>
                      </div>
                    )}
                    {research.technicalAssessment.githubRepo && (
                      <div className="summary-item">
                        <span className="summary-label">GitHub:</span>
                        <span className="summary-value">Repository found</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Community Summary */}
              {research.communityHealth && (
                <div className="data-summary-section">
                  <div className="summary-title">🌐 COMMUNITY SUMMARY</div>
                  <div className="summary-content">
                    {research.communityHealth.twitterSummary && (
                      <div className="summary-item">
                        <span className="summary-label">Twitter:</span>
                        <span className="summary-value">Activity data</span>
                      </div>
                    )}
                    {research.communityHealth.discordData && research.communityHealth.discordData.server_name && (
                      <div className="summary-item">
                        <span className="summary-label">Discord:</span>
                        <span className="summary-value">{research.communityHealth.discordData.member_count?.toLocaleString() || 'N/A'} members</span>
                      </div>
                    )}
                    {research.communityHealth.redditSummary && (
                      <div className="summary-item">
                        <span className="summary-label">Reddit:</span>
                        <span className="summary-value">Community data</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Game Data Summary */}
              {research.gameData && (
                <div className="data-summary-section">
                  <div className="summary-title">🎮 GAME DATA SUMMARY</div>
                  <div className="summary-content">
                    {research.gameData.downloadLinks && research.gameData.downloadLinks.length > 0 && (
                      <div className="summary-item">
                        <span className="summary-label">Download Links:</span>
                        <span className="summary-value">{research.gameData.downloadLinks.length} platforms</span>
                      </div>
                    )}
                    {research.gameData.found && (
                      <div className="summary-item">
                        <span className="summary-label">Data Points:</span>
                        <span className="summary-value">{research.gameData.dataPoints || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Collection Summary */}
              {research.totalDataPoints && (
                <div className="data-summary-section">
                  <div className="summary-title">📊 DATA COLLECTION</div>
                  <div className="summary-content">
                    <div className="summary-item">
                      <span className="summary-label">Total Data Points:</span>
                      <span className="summary-value">{research.totalDataPoints}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Sources Used:</span>
                      <span className="summary-value">{research.sourcesUsed?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}
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
      
      <ChatBubble
        onSendMessage={handleChatMessage}
        messages={chatMessages}
        isLoading={chatLoading}
        projectsInSession={Object.keys(sessionProjects)}
      />
      
      <div className="initial-screen">
        {/* Logo and Title */}
        <div className="logo-container">
          <div className="logo">
            <div className="redacted-bar"></div>
          </div>
          <h1 className="brand-title">DYOR BOT</h1>
        </div>

        {/* Development Mode Toggle - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="dev-mode-toggle">
            <label className="dev-mode-label">
              <input
                type="checkbox"
                checked={developmentMode}
                onChange={(e) => setDevelopmentMode(e.target.checked)}
                className="dev-mode-checkbox"
              />
              <span className="dev-mode-text">DEV MODE (Axie Infinity Mock Data)</span>
            </label>
          </div>
        )}

        {/* Search Form */}
        <div className="search-form-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder={process.env.NODE_ENV === 'development' && developmentMode ? "// dev mode - any input works" : "// enter token or project"}
              className="search-input-large"
            />
            <button 
              type="submit" 
              disabled={researchLoading || (!projectName && !(process.env.NODE_ENV === 'development' && developmentMode))}
              className="search-button-large"
            >
              {researchLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
            {process.env.NODE_ENV === 'development' && developmentMode && (
              <button 
                type="button"
                onClick={() => {
                  setResearchLoading(true);
                  setTimeout(() => {
                    setResearch(mockAxieInfinityData);
                    // Add to session projects
                    setSessionProjects(prev => ({
                      ...prev,
                      [mockAxieInfinityData.projectName]: mockAxieInfinityData
                    }));
                    setResearchLoading(false);
                  }, 500);
                }}
                disabled={researchLoading}
                className="mock-data-button"
                style={{ marginTop: '10px', width: '100%' }}
              >
                LOAD MOCK DATA
              </button>
            )}
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
