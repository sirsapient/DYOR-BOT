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

function App() {
  const [projectName, setProjectName] = useState('');
  const [research, setResearch] = useState<ProjectResearch | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'auto' | 'ethereum' | 'ronin'>('auto');
  const [contractAddress, setContractAddress] = useState('');
  const [roninContractAddress, setRoninContractAddress] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);
    setResearch(null);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://dyor-bot.onrender.com';
      const endpoint = '/api/research';
      const fullUrl = `${apiUrl}${endpoint}`;
      

      
      const requestBody: any = { projectName };
      
      // Add network-specific contract addresses
      if (selectedNetwork === 'ethereum' && contractAddress) {
        requestBody.contractAddress = contractAddress;
      } else if (selectedNetwork === 'ronin' && roninContractAddress) {
        requestBody.roninContractAddress = roninContractAddress;
      } else if (selectedNetwork === 'auto') {
        // Try both if available
        if (contractAddress) requestBody.contractAddress = contractAddress;
        if (roninContractAddress) requestBody.roninContractAddress = roninContractAddress;
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
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Enter project or token name"
            style={{ marginRight: 8, flex: 1 }}
          />
          <button type="submit" disabled={researchLoading || !projectName}>
            {researchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Network Selection */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            Network (Optional):
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={selectedNetwork}
              onChange={e => setSelectedNetwork(e.target.value as 'auto' | 'ethereum' | 'ronin')}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="auto">Auto-detect</option>
              <option value="ethereum">Ethereum</option>
              <option value="ronin">Ronin Network</option>
            </select>
            
            {selectedNetwork === 'ethereum' && (
              <input
                type="text"
                value={contractAddress}
                onChange={e => setContractAddress(e.target.value)}
                placeholder="Ethereum contract address (0x...)"
                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            )}
            
            {selectedNetwork === 'ronin' && (
              <input
                type="text"
                value={roninContractAddress}
                onChange={e => setRoninContractAddress(e.target.value)}
                placeholder="Ronin contract address (0x...)"
                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            )}
            
            {selectedNetwork === 'auto' && (
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                  placeholder="Ethereum contract (optional)"
                  style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="text"
                  value={roninContractAddress}
                  onChange={e => setRoninContractAddress(e.target.value)}
                  placeholder="Ronin contract (optional)"
                  style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Axie Infinity Button */}
        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setProjectName('Axie Infinity');
              setSelectedNetwork('ronin');
              setRoninContractAddress('0x97a9107c1793bc407d6f527b77e7fff4d812bece'); // AXS token contract
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🎮 Quick Search: Axie Infinity
          </button>
        </div>
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
        <div className="research-container">
          <h3>Project: {research.projectName}</h3>
          <p><strong>Type:</strong> {research.projectType}</p>
          
          {/* Confidence Indicator */}
          {research.confidence && (
            <ConfidenceIndicator confidence={research.confidence} />
          )}
          

          
          {research.aiSummary && research.aiSummary.startsWith('Anthropic:') ? (
            <div className="markdown-content" style={{ marginBottom: 12, color: 'red' }}>
              There was an issue retrieving the AI summary. Please try again later.
            </div>
          ) : research.aiSummary ? (
            <div className="markdown-content" style={{ marginBottom: 12 }}>
              <h4>AI Analysis Summary</h4>
              <ReactMarkdown>{research.aiSummary}</ReactMarkdown>
            </div>
          ) : null}

          <div style={{ marginBottom: 16 }}>
            <h4>Key Findings</h4>
            {research.keyFindings.positives.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h5 style={{ color: 'green' }}>✅ Positive Aspects</h5>
                <ul style={{ textAlign: 'left' }}>
                  {research.keyFindings.positives.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            
            {research.keyFindings.negatives.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h5 style={{ color: 'orange' }}>⚠️ Negative Aspects</h5>
                <ul style={{ textAlign: 'left' }}>
                  {research.keyFindings.negatives.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            )}
            
            {research.keyFindings.redFlags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h5 style={{ color: 'red' }}>🚨 Red Flags</h5>
                <ul style={{ textAlign: 'left' }}>
                  {research.keyFindings.redFlags.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>

          {research.financialData && (
            <div style={{ marginBottom: 16 }}>
              <h4>Financial Data</h4>
              {research.financialData.marketCap && (
                <p><strong>Market Cap:</strong> ${research.financialData.marketCap.toLocaleString()}</p>
              )}
              {research.financialData.tokenDistribution && (
                <p><strong>Token Distribution:</strong> Available</p>
              )}
              {research.financialData.fundingInfo && (
                <p><strong>Funding Info:</strong> Available</p>
              )}
              
              {/* Ronin Network Data */}
              {research.financialData.roninTokenInfo && (
                <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, border: '1px solid #4a90e2' }}>
                  <h5 style={{ color: '#4a90e2', margin: '0 0 8px 0' }}>🌐 Ronin Network Data</h5>
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
                  
                  {/* Axie Infinity Specific Data */}
                  {research.financialData.roninTokenInfo.axieSpecificData && (
                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
                      <h6 style={{ color: '#2e7d32', margin: '0 0 4px 0' }}>🎮 Axie Infinity Game Data</h6>
                      {research.financialData.roninTokenInfo.axieSpecificData.gameStats && (
                        <p style={{ fontSize: '14px', margin: '2px 0' }}>
                          <strong>Game Stats:</strong> Available
                        </p>
                      )}
                      {research.financialData.roninTokenInfo.axieSpecificData.marketplaceData && (
                        <p style={{ fontSize: '14px', margin: '2px 0' }}>
                          <strong>Marketplace Data:</strong> Available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {research.teamAnalysis && (
            <div style={{ marginBottom: 16 }}>
              <h4>Team Analysis</h4>
              {research.teamAnalysis.studioAssessment && research.teamAnalysis.studioAssessment.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>🏢 Studio Background</h5>
                  <ul style={{ textAlign: 'left' }}>
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
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>💼 LinkedIn Insights</h5>
                  <p style={{ textAlign: 'left' }}>{research.teamAnalysis.linkedinSummary}</p>
                </div>
              )}
              {research.teamAnalysis.glassdoorSummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>🏢 Company Reviews</h5>
                  <p style={{ textAlign: 'left' }}>{research.teamAnalysis.glassdoorSummary}</p>
                </div>
              )}
            </div>
          )}

          {research.technicalAssessment && (
            <div style={{ marginBottom: 16 }}>
              <h4>Technical Assessment</h4>
              {research.technicalAssessment.securitySummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>🔒 Security Analysis</h5>
                  <p style={{ textAlign: 'left' }}>{research.technicalAssessment.securitySummary}</p>
                </div>
              )}
              {research.technicalAssessment.reviewSummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>📊 Review Scores</h5>
                  <p style={{ textAlign: 'left' }}>{research.technicalAssessment.reviewSummary}</p>
                </div>
              )}
              {research.technicalAssessment.githubRepo && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>💻 GitHub Activity</h5>
                  <p style={{ textAlign: 'left' }}>
                    <strong>Repository:</strong> {research.technicalAssessment.githubRepo}
                    {research.technicalAssessment.githubStats && (
                      <span> | <strong>Stats:</strong> {research.technicalAssessment.githubStats}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {research.communityHealth && (
            <div style={{ marginBottom: 16 }}>
              <h4>Community Health</h4>
              {research.communityHealth.twitterSummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>🐦 Twitter Activity</h5>
                  <p style={{ textAlign: 'left' }}>{research.communityHealth.twitterSummary}</p>
                </div>
              )}
              {research.communityHealth.steamReviewSummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>🎮 Steam Reviews</h5>
                  <p style={{ textAlign: 'left' }}>{research.communityHealth.steamReviewSummary}</p>
                </div>
              )}
              {research.communityHealth.discordData && research.communityHealth.discordData.server_name && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>💬 Discord Community</h5>
                  <p style={{ textAlign: 'left' }}>
                    <strong>Server:</strong> {research.communityHealth.discordData.server_name}
                    {research.communityHealth.discordData.member_count && (
                      <span> | <strong>Members:</strong> {research.communityHealth.discordData.member_count.toLocaleString()}</span>
                    )}
                  </p>
                </div>
              )}
              {research.communityHealth.redditSummary && (
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ color: '#2c5aa0' }}>📱 Reddit Community</h5>
                  <p style={{ textAlign: 'left' }}>{research.communityHealth.redditSummary}</p>
                </div>
              )}
            </div>
          )}

          {research.sourcesUsed && research.sourcesUsed.length > 0 && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <strong>Data Sources:</strong> {research.sourcesUsed.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
