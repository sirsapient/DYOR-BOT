import React, { useState } from 'react';
import { ProjectResearch } from './types';
import './App.css';
import ReactMarkdown from 'react-markdown';

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
      <h1>DYOR BOT</h1>
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
        <strong>About:</strong> DYOR BOT is a research tool for analyzing Web3 and gaming projects. Enter a project or token name above and click Search to get a risk score, investment grade, and key findings. Data is sourced from IGDB, CoinGecko, Steam, Etherscan, and more. <br/><br/>
        <strong>How to use:</strong> Type a project or token name (e.g., "Axie Infinity", "Wildcard") and press Search. Review the summary and details to make informed decisions.
      </div>
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
