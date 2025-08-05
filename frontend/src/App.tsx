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
    const dataGridItems = [
      { icon: '🎯', title: 'PRODUCT METRICS' },
      { icon: '🛡️', title: 'SECURITY AUDIT' },
      { icon: '👥', title: 'TEAM INFO SECU!' },
      { icon: '👤', title: 'COMMUNITY // NOT FAURD' }
    ];

    return (
      <div className="App">
        <LoadingModal show={researchLoading} />
        
        <div className="main-container">
          {/* Left Panel - DYOR BOT Branding */}
          <div className="left-panel">
            <div className="logo-container">
              <div className="logo">
                <div className="redacted-bar"></div>
              </div>
              <h1 className="brand-title">DYOR BOT</h1>
            </div>
            
            <div className="search-input-section">
              <div className="search-input-title">SEARCH INPUT O X</div>
              <div className="search-suggestions">
                <div className="suggestion-item">ABOUT</div>
                <div className="suggestion-item">ASSORCS /HOW-TO</div>
                <div className="suggestion-item">Try: SRRN: SYGG</div>
                <div className="suggestion-item">Try: SRON SYGG</div>
                <div className="suggestion-item">// TRY + SYGG</div>
                <div className="suggestion-item">TRY: SYGG</div>
              </div>
            </div>
            
            <div className="color-swatches">
              <div className="color-swatch green"></div>
              <div className="color-swatch magenta"></div>
              <div className="color-swatch gray"></div>
            </div>
          </div>

          {/* Middle Panel - Search and Data Grid */}
          <div className="middle-panel">
            <div className="search-container">
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
              
              <div className="search-suggestions" style={{ marginTop: '15px' }}>
                <div className="suggestion-item">ABOUT SROM</div>
                <div className="suggestion-item">About: Ran a mjcst about Intercats. Try:</div>
                <div className="suggestion-item">SUGGEST USE</div>
                <div className="suggestion-item">Proceed with further research</div>
              </div>
            </div>

            <div className="search-input-title">DATA GRID</div>
            <div className="data-grid">
              {dataGridItems.map((item, index) => (
                <div key={index} className="data-grid-item">
                  <span className="data-grid-icon">{item.icon}</span>
                  <div className="data-grid-title">{item.title}</div>
                </div>
              ))}
            </div>

            {/* Research Results */}
            <div className="research-container">
              <div className="research-header">
                <h2 className="research-title">{research.projectName}</h2>
                {research.confidence && (
                  <div className="confidence-display">
                    <div className="grade-badge">Grade {research.confidence.overall.grade}</div>
                    <div className="confidence-badge">{research.confidence.overall.score}% Confidence</div>
                  </div>
                )}
              </div>
              
              {research.confidence && (
                <ConfidenceIndicator confidence={research.confidence} />
              )}
              
              {/* Research content would go here */}
              <div style={{ marginTop: '20px' }}>
                <p>Research data for {research.projectName} would be displayed here...</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Signal Report Card */}
          <div className="right-panel">
            <div className="signal-report">
              <div className="signal-title">SIGNAL REPORT CARD</div>
              <div className="grade-display">
                <div className="grade-text">GRADE A</div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: '85%' }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#00ff41' }}>05's CONFIDENCE</div>
              </div>
              <div className="search-suggestions">
                <div className="suggestion-item">SUGGESTED ACTION</div>
                <div className="suggestion-item">Proceed with further research</div>
              </div>
            </div>

            <div className="signal-title">WARNING BADGE</div>
            <div className="warning-badge">// DATA REDACTED</div>

            <div className="signal-title">GLITCH BUTTON</div>
            <button className="glitch-button export">
              EXPORT
            </button>
            <button className="glitch-button export">
              EXPORT ▼
            </button>
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
