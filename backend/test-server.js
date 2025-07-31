const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4001; // Changed port to avoid conflicts

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok' });
});

// Simple test endpoint
app.post('/api/research', (req, res) => {
  console.log('Received research request:', req.body);
  
  // Mock response with confidence data
  const mockResponse = {
    projectName: "Axie Infinity",
    projectType: "Web3Game",
    confidence: {
      overall: {
        score: 75,
        grade: 'B',
        level: 'high',
        description: 'Strong data coverage with good source reliability'
      },
      breakdown: {
        dataCompleteness: { score: 75, found: 6, total: 8, missing: ['whitepaper'] },
        sourceReliability: { score: 94, official: 1, verified: 5, scraped: 0 },
        dataFreshness: { score: 100, averageAge: 0, oldestSource: 'Blockchain Data' }
      },
      sourceDetails: [
        {
          name: 'onchain_data',
          displayName: 'Blockchain Data',
          found: true,
          quality: 'high',
          reliability: 'verified',
          dataPoints: 3,
          lastUpdated: '2025-07-31T02:07:36.926Z',
          confidence: 96,
          issues: [],
          icon: '⛓️',
          description: 'On-chain metrics and contracts'
        }
      ],
      limitations: [
        'Missing critical data: whitepaper',
        'No official project sources verified'
      ],
      strengths: [
        '5 high-quality data sources',
        '1 official source verified',
        'Fresh data from 6 recent sources'
      ],
      userGuidance: {
        trustLevel: 'medium',
        useCase: 'General research and due diligence',
        warnings: [],
        additionalResearch: []
      }
    }
  };
  
  console.log('Sending response with confidence data');
  res.json(mockResponse);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Server is ready to accept requests');
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Research endpoint: http://localhost:${PORT}/api/research`);
}); 