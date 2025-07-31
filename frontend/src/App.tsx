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
  const [useMockApi, setUseMockApi] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);
    setResearch(null);
    setError(null);
    try {
      // Use local backend for mock API, production for real API
      const apiUrl = useMockApi ? 'http://localhost:4000' : (process.env.REACT_APP_API_URL || 'http://localhost:4000');
      const endpoint = useMockApi ? '/api/research-mock' : '/api/research';
      const fullUrl = `${apiUrl}${endpoint}`;
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error('API error');
      }
      
      setResearch(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch research');
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
            style={{ marginRight: 8 }}
          />
          <button type="submit" disabled={researchLoading || !projectName}>
            {researchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <label>
            <input
              type="checkbox"
              checked={useMockApi}
              onChange={e => setUseMockApi(e.target.checked)}
              style={{ marginRight: '4px' }}
            />
            Use Mock API (for testing confidence indicators)
          </label>
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
