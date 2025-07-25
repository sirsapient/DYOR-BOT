import React, { useState, useEffect } from 'react';
import { ProjectResearch } from './types';
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);
    setResearch(null);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResearch(data);
    } catch (err) {
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
        <strong>About:</strong> DYOR BOT is a research tool for analyzing Web3 and gaming projects. It uses over 10 data sources to provide risk scores, investment grades, and key findings.<br/><br/>
        <strong>How to use:</strong> Type a project or token name and press Search. Review the summary and details to make informed decisions.
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {research && (
        <div className="research-container">
          <h3>{research.projectName}</h3>
          <p>Type: {research.projectType}</p>
          <p>Risk Score: {research.riskScore}</p>
          <p>Investment Grade: {research.investmentGrade}</p>
          <h4>Key Findings</h4>
          {research.aiSummary && research.aiSummary.startsWith('Anthropic:') ? (
            <div className="markdown-content" style={{ marginBottom: 12, color: 'red' }}>
              There was an issue retrieving the AI summary. Please try again later.
            </div>
          ) : research.aiSummary ? (
            <div className="markdown-content" style={{ marginBottom: 12 }}>
              <ReactMarkdown>{research.aiSummary}</ReactMarkdown>
            </div>
          ) : null}
          <details>
            <summary>Details</summary>
            <ul>
              {research.keyFindings.positives.map((p, i) => <li key={i}>+ {p}</li>)}
              {research.keyFindings.negatives.map((n, i) => <li key={i}>- {n}</li>)}
              {research.keyFindings.redFlags.map((r, i) => <li key={i}>!! {r}</li>)}
            </ul>
          </details>
          {research.sourcesUsed && research.sourcesUsed.length > 0 && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: 8 }}>
              <strong>Cited:</strong> {research.sourcesUsed.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
