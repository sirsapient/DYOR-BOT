const express = require('express');
const cors = require('cors');
// @ts-ignore
const fetch = require('node-fetch').default || require('node-fetch');
require('dotenv').config();
import { ethers } from 'ethers';
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');
const { URL } = require('url');
import { ResearchScoringEngine, mapDataToFindings } from './research-scoring';
import { QualityGatesEngine, formatQualityGateResponse, ProjectType } from './quality-gates';
import { generateConfidenceMetrics, ConfidenceMetrics } from './confidence-indicators';
import { conductAIOrchestratedResearch, AIResearchOrchestrator } from './ai-research-orchestrator';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Add root route
app.get('/', (req: any, res: any) => {
  res.send('DYOR BOT API is running');
});

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok' });
});

// Mock endpoint for testing confidence indicators
app.post('/api/research-mock', (req: any, res: any) => {
  const { projectName } = req.body;
  
  const mockConfidenceMetrics = {
    overall: {
      score: 85,
      grade: 'A',
      level: 'high',
      description: 'Strong data coverage with good source reliability'
    },
    breakdown: {
      dataCompleteness: {
        score: 75,
        found: 6,
        total: 8,
        missing: ['Documentation', 'Media Coverage']
      },
      sourceReliability: {
        score: 94,
        official: 1,
        verified: 5,
        scraped: 0
      },
      dataFreshness: {
        score: 100,
        averageAge: 0,
        oldestSource: 'Blockchain Data'
      }
    },
    sourceDetails: [
      {
        name: 'whitepaper',
        displayName: 'Documentation',
        found: false,
        quality: 'low',
        reliability: 'official',
        dataPoints: 0,
        lastUpdated: new Date().toISOString(),
        confidence: 0,
        issues: ['No data found'],
        icon: '📄',
        description: 'Official project documentation'
      },
      {
        name: 'onchain_data',
        displayName: 'Blockchain Data',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 3,
        lastUpdated: new Date().toISOString(),
        confidence: 96,
        issues: [],
        icon: '⛓️',
        description: 'On-chain metrics and contracts'
      },
      {
        name: 'team_info',
        displayName: 'Team Information',
        found: true,
        quality: 'medium',
        reliability: 'verified',
        dataPoints: 1,
        lastUpdated: new Date().toISOString(),
        confidence: 77,
        issues: ['Limited data points'],
        icon: '👥',
        description: 'Founder and team backgrounds'
      },
      {
        name: 'community_health',
        displayName: 'Community',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: new Date().toISOString(),
        confidence: 100,
        issues: [],
        icon: '💬',
        description: 'Discord, Twitter, Telegram activity'
      },
      {
        name: 'financial_data',
        displayName: 'Financial Data',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: new Date().toISOString(),
        confidence: 100,
        issues: [],
        icon: '💰',
        description: 'Market cap, funding, trading data'
      },
      {
        name: 'product_data',
        displayName: 'Product Metrics',
        found: true,
        quality: 'high',
        reliability: 'verified',
        dataPoints: 6,
        lastUpdated: new Date().toISOString(),
        confidence: 100,
        issues: [],
        icon: '🎮',
        description: 'Game stats, user reviews, usage'
      },
      {
        name: 'security_audits',
        displayName: 'Security Audits',
        found: true,
        quality: 'high',
        reliability: 'official',
        dataPoints: 1,
        lastUpdated: new Date().toISOString(),
        confidence: 92,
        issues: ['Limited audit data'],
        icon: '🛡️',
        description: 'Smart contract audit reports'
      },
      {
        name: 'media_coverage',
        displayName: 'Media Coverage',
        found: false,
        quality: 'low',
        reliability: 'scraped',
        dataPoints: 0,
        lastUpdated: new Date().toISOString(),
        confidence: 0,
        issues: ['No data found'],
        icon: '📰',
        description: 'News articles and press coverage'
      }
    ],
    limitations: [
      'Missing critical data: Documentation',
      'No official project sources verified'
    ],
    strengths: [
      '5 high-quality data sources',
      '1 official source verified',
      'Comprehensive data (22 data points)',
      'Fresh data from 6 recent sources'
    ],
    userGuidance: {
      trustLevel: 'high',
      useCase: 'Comprehensive project analysis and research',
      warnings: [],
      additionalResearch: [
        'Search for official project documentation',
        'Check for recent project updates'
      ]
    }
  };

  const mockResearchReport = {
    projectName: projectName || 'Mock Project',
    projectType: 'Web3Game',
    keyFindings: {
      positives: [
        'Strong community engagement',
        'Active development team',
        'Good market performance'
      ],
      negatives: [
        'Limited documentation available',
        'Some data sources missing'
      ],
      redFlags: []
    },
    financialData: {
      marketCap: 1000000,
      tokenDistribution: 'Available',
      fundingInfo: 'Available'
    },
    teamAnalysis: {
      studioAssessment: [
        {
          companyName: 'Mock Studio',
          isDeveloper: true,
          isPublisher: true,
          firstProjectDate: '2020'
        }
      ],
      linkedinSummary: 'Team has strong gaming background',
      glassdoorSummary: 'Positive company reviews'
    },
    technicalAssessment: {
      securitySummary: 'Security audit completed',
      reviewSummary: 'Positive user reviews',
      githubRepo: 'github.com/mock/project',
      githubStats: 'Active development'
    },
    communityHealth: {
      twitterSummary: 'Active Twitter community',
      steamReviewSummary: 'Positive Steam reviews',
      discordData: {
        server_name: 'Mock Community',
        member_count: 5000
      },
      redditSummary: 'Active Reddit community'
    },
    sourcesUsed: ['CoinGecko', 'IGDB', 'Steam', 'Discord', 'Etherscan'],
    aiSummary: 'This is a mock AI analysis summary for testing confidence indicators.',
    confidence: mockConfidenceMetrics
  };

  res.json(mockResearchReport);
});

const REQUIRED_ENV_VARS = [
  'IGDB_CLIENT_ID',
  'IGDB_CLIENT_SECRET',
  'ETHERSCAN_API_KEY',
  'YOUTUBE_API_KEY',
  'ANTHROPIC_API_KEY',
];
const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.warn('WARNING: Missing required environment variables:', missingVars.join(', '));
  console.warn('Server will start but some features may not work properly.');
}

const serpApiKey = process.env.SERPAPI_KEY;

async function searchContractAddressWithLLM(projectName: string): Promise<string | null> {
  if (!serpApiKey || !process.env.ANTHROPIC_API_KEY) return null;
  // 1. Use SerpAPI to search for the contract address
  const serpRes = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(projectName + ' token contract address')}&api_key=${serpApiKey}`);
  if (!serpRes.ok) return null;
  const serpJson = await serpRes.json();
  // Collect snippets from organic results
  const snippets = (serpJson.organic_results || []).map((r: any) => r.snippet || r.title || '').filter(Boolean).join('\n');
  if (!snippets) return null;
  // 2. Use Anthropic Claude to extract the contract address
  const prompt = `Given the following web search results, extract the most likely Ethereum contract address for the project ${projectName}. Only return the address, or say 'not found' if you are not sure.\n\nResults:\n${snippets}`;
  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 64,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!aiRes.ok) return null;
  const aiJson = await aiRes.json();
  const text = aiJson.content?.[0]?.text || '';
  // Extract Ethereum address (0x...)
  const match = text.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

async function fetchWhitepaperUrl(websiteUrl: string): Promise<string | null> {
  // Enhanced whitepaper discovery for established projects
  try {
    const res = await fetch(websiteUrl);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let found = null;
    
    // Strategy 1: Direct whitepaper links
    const whitepaperSelectors = [
      'a[href*="whitepaper"]',
      'a[href*="tokenomics"]',
      'a[href*="docs"]',
      'a[href*="documentation"]',
      'a[href*="litepaper"]',
      'a[href*="technical-paper"]',
      'a[href*="economics"]',
      'a[href*="governance"]'
    ];
    
    for (const selector of whitepaperSelectors) {
      const link = $(selector).first();
      if (link.length) {
        const href = link.attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, websiteUrl).href;
          found = fullUrl;
          break;
        }
      }
    }
    
    // Strategy 2: Look for common whitepaper URL patterns
    if (!found) {
      const commonPaths = [
        '/whitepaper',
        '/docs',
        '/documentation',
        '/tokenomics',
        '/economics',
        '/governance',
        '/technical'
      ];
      
      for (const path of commonPaths) {
        try {
          const testUrl = new URL(path, websiteUrl).href;
          const testRes = await fetch(testUrl);
          if (testRes.ok) {
            found = testUrl;
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
    }
    
    // Strategy 3: Search for PDF links
    if (!found) {
      const pdfLinks = $('a[href*=".pdf"]');
      for (let i = 0; i < pdfLinks.length; i++) {
        const href = $(pdfLinks[i]).attr('href');
        if (href && (href.includes('whitepaper') || href.includes('tokenomics') || href.includes('audit'))) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, websiteUrl).href;
          found = fullUrl;
          break;
        }
      }
    }
    
    return found;
  } catch (e) {
    return null;
  }
}

// Enhanced function to detect if a project is established
function isEstablishedProject(projectName: string, aliases: string[]): boolean {
  const establishedKeywords = [
    'sandbox', 'decentraland', 'mana',
    'illuvium', 'gods', 'unchained',
    'stepn', 'move', 'earn',
    'gala', 'games', 'foundation',
    'enjin', 'coin', 'platform',
    'immutable', 'x', 'gods',
    'ultra', 'u', 'token',
    'wax', 'blockchain', 'platform',
    'flow', 'dapper', 'labs',
    'polygon', 'studios', 'gaming'
  ];
  
  const allNames = [projectName.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
  
  return establishedKeywords.some(keyword => 
    allNames.some(name => name.includes(keyword))
  );
}

// Enhanced function to find official sources for established projects
async function findOfficialSourcesForEstablishedProject(projectName: string, aliases: string[]): Promise<any> {
  const officialSources: any = {
    whitepaper: null,
    documentation: null,
    github: null,
    securityAudit: null,
    teamInfo: null,
    fundingInfo: null
  };
  
  // Strategy 1: Try common domain patterns
  const domainPatterns = [
    `${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
    `${projectName.toLowerCase().replace(/\s+/g, '')}.io`,
    `${projectName.toLowerCase().replace(/\s+/g, '')}.org`,
    `${aliases[0]?.toLowerCase().replace(/\s+/g, '')}.com`,
    `${aliases[0]?.toLowerCase().replace(/\s+/g, '')}.io`
  ];
  
  for (const domain of domainPatterns) {
    try {
      const websiteUrl = `https://${domain}`;
      const res = await fetch(websiteUrl);
      if (res.ok) {
        // Found official website, now look for whitepaper
        const whitepaperUrl = await fetchWhitepaperUrl(websiteUrl);
        if (whitepaperUrl) {
          officialSources.whitepaper = whitepaperUrl;
        }
        
        // Look for GitHub link
        const html = await res.text();
        const $ = cheerio.load(html);
        const githubLink = $('a[href*="github.com"]').first();
        if (githubLink.length) {
          officialSources.github = githubLink.attr('href');
        }
        
        // Look for documentation
        const docsLink = $('a[href*="docs"], a[href*="documentation"]').first();
        if (docsLink.length) {
          officialSources.documentation = docsLink.attr('href');
        }
        
        break;
      }
    } catch (e) {
      // Continue to next domain
    }
  }
  
  // Strategy 2: Search for GitHub repositories
  if (!officialSources.github) {
    for (const alias of aliases) {
      try {
        const githubRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(alias)}`);
        if (githubRes.ok) {
          const githubData = await githubRes.json();
          if (githubData.items && githubData.items.length > 0) {
            const topRepo = githubData.items[0];
            if (topRepo.stargazers_count > 100) { // Only consider popular repos
              officialSources.github = topRepo.html_url;
            }
          }
        }
      } catch (e) {
        // Continue to next alias
      }
    }
  }
  
  // Strategy 3: Search for security audit reports
  if (!officialSources.securityAudit) {
    for (const alias of aliases) {
      try {
        const auditSearchTerms = [
          `${alias} security audit`,
          `${alias} certik audit`,
          `${alias} audit report`,
          `${alias} security verification`
        ];
        
        for (const searchTerm of auditSearchTerms) {
          // This would integrate with a search API like SerpAPI
          // For now, we'll return a placeholder
          // TODO: Implement actual audit search functionality
        }
      } catch (e) {
        // Continue to next alias
      }
    }
  }
  
  return officialSources;
}

async function fetchPdfBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res: any) => {
      if (res.statusCode !== 200) return resolve(null);
      const data: any[] = [];
      res.on('data', (chunk: any) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', () => resolve(null));
  });
}

async function extractTokenomicsFromWhitepaper(websiteUrl: string): Promise<any | null> {
  const whitepaperUrl = await fetchWhitepaperUrl(websiteUrl);
  if (!whitepaperUrl) return null;
  let text = '';
  if (/\.pdf$/i.test(whitepaperUrl)) {
    // PDF extraction
    const pdfBuffer = await fetchPdfBuffer(whitepaperUrl);
    if (!pdfBuffer) return null;
    const pdfData = await pdfParse(pdfBuffer);
    text = pdfData.text;
  } else {
    // HTML extraction
    try {
      const res = await fetch(whitepaperUrl);
      if (!res.ok) return null;
      const html = await res.text();
      const $ = cheerio.load(html);
      // Try to extract main content (look for <main>, <article>, or fallback to body)
      let mainText = $('main').text() || $('article').text() || $('body').text();
      // Clean up whitespace
      text = mainText.replace(/\s+/g, ' ').trim();
    } catch (e) {
      return null;
    }
  }
  if (!text) return null;
  // Use Anthropic Claude to extract tokenomics
  const prompt = `Given the following text from a crypto project whitepaper or tokenomics page, extract the tokenomics details. Focus on:

    1. Token names and symbols (e.g., AXS, SLP)
2. Total supply and circulating supply
3. Token distribution breakdown (team, community, treasury, etc.)
4. Vesting schedules and unlock periods
5. Token utility and use cases
6. Inflation/deflation mechanisms
7. Staking rewards and tokenomics

Return as structured JSON with clear field names. If no clear tokenomics data is found, return null.

Text:
${text.substring(0, 12000)}`;
  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 256,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!aiRes.ok) return null;
  const aiJson = await aiRes.json();
  let json = null;
  try {
    json = JSON.parse(aiJson.content?.[0]?.text || '');
  } catch (e) {
    // fallback: return raw text
    json = { extracted: aiJson.content?.[0]?.text || '' };
  }
  return json;
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return null;
  }
}

function extractSocialLinksFromHtml(html: string): {discord?: string, twitter?: string} {
  const $ = cheerio.load(html);
  let discord: string | undefined = undefined, twitter: string | undefined = undefined;
  $('a').each((_: any, el: any) => {
    const href = $(el).attr('href');
    if (href) {
      if (!discord && /discord\.(gg|com)\//i.test(href)) discord = href;
      if (!twitter && /twitter\.com\//i.test(href)) twitter = href;
    }
  });
  return { discord, twitter };
}

async function searchProjectSpecificTokenomics(projectName: string, aliases: string[]): Promise<any | null> {
  if (!serpApiKey || !process.env.ANTHROPIC_API_KEY) return null;
  
  // Search for project-specific tokenomics information
  const searchTerms = [
    `${projectName} tokenomics`,
    `${projectName} token distribution`,
    `${projectName} whitepaper`,
    `${projectName} token economics`
  ];
  
  // Add aliases to search terms
  for (const alias of aliases.slice(0, 3)) { // Limit to first 3 aliases
    searchTerms.push(`${alias} tokenomics`);
    searchTerms.push(`${alias} token distribution`);
  }
  
  let allSnippets = '';
  
  // Search each term
  for (const term of searchTerms.slice(0, 4)) { // Limit to first 4 terms
    try {
      const serpRes = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(term)}&api_key=${serpApiKey}`);
      if (serpRes.ok) {
        const serpJson = await serpRes.json();
        const snippets = (serpJson.organic_results || []).map((r: any) => r.snippet || r.title || '').filter(Boolean).join('\n');
        allSnippets += snippets + '\n';
      }
    } catch (e) {
      // Continue with next search term
    }
  }
  
  if (!allSnippets) return null;
  
  // Use AI to extract tokenomics from search results
  const prompt = `Given the following web search results about ${projectName}, extract the tokenomics details (total supply, distribution breakdown, vesting schedule, token names, etc.). Return as structured JSON. If no clear tokenomics data is found, return null.

Search Results:
${allSnippets.substring(0, 8000)}`;

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 512,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (aiRes.ok) {
      const aiJson = await aiRes.json();
      const text = aiJson.content?.[0]?.text || '';
      
      // Try to parse JSON from response
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        // If not valid JSON, return as extracted text
        return { extracted_text: text };
      }
    }
  } catch (e) {
    // Return null if AI extraction fails
  }
  
  return null;
}

// List of Nitter instances to try
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
  'https://nitter.poast.org',
  'https://nitter.moomoo.me',
];

async function fetchTwitterProfileAndTweets(handle: string) {
  for (const base of NITTER_INSTANCES) {
    try {
      const res = await fetch(`${base}/${handle}`);
      if (res.ok) {
        const html = await res.text();
        // Extract profile bio
        const bioMatch = html.match(/<div class="profile-bio">([\s\S]*?)<\/div>/);
        const bio = bioMatch ? bioMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        // Extract follower count
        const followerMatch = html.match(/<li><span class="profile-stat-num">([\d,]+)<\/span> Followers<\/li>/);
        const followers = followerMatch ? followerMatch[1] : '';
        // Extract pinned tweet
        const pinnedMatch = html.match(/<div class="pinned">([\s\S]*?)<\/div>\s*<div class="tweet-content media-body">([\s\S]*?)<\/div>/);
        const pinned = pinnedMatch ? pinnedMatch[2].replace(/<[^>]+>/g, '').trim() : '';
        // Extract last 10 tweets
        const tweetMatches = [...html.matchAll(/<div class="tweet-content media-body">([\s\S]*?)<\/div>/g)];
        let tweets = tweetMatches.slice(0, 10).map(m => m[1].replace(/<[^>]+>/g, '').trim());
        // Extract likes/retweets
        const likeMatches = [...html.matchAll(/<span class="icon-heart"><\/span>\s*(\d+)/g)];
        const rtMatches = [...html.matchAll(/<span class="icon-retweet"><\/span>\s*(\d+)/g)];
        let likes = likeMatches.slice(0, 10).map(m => m[1]);
        let rts = rtMatches.slice(0, 10).map(m => m[1]);
        // Sentiment
        let pos = 0, neg = 0;
        for (const t of tweets) {
          if (/(great|excite|love|win|success|launch|update|active|good|moon|hype)/i.test(t)) pos++;
          if (/(delay|scam|rug|problem|concern|down|bad|fail|fud|abandon|inactive)/i.test(t)) neg++;
        }
        return {
          bio,
          followers,
          pinned,
          tweets,
          likes,
          rts,
          sentiment: { pos, neg },
        };
      }
    } catch (e) { /* try next instance */ }
  }
  return null;
}

async function fetchSteamDescription(appid: string): Promise<string> {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
    if (res.ok) {
      const json = await res.json();
      const data = json[appid]?.data;
      if (data && data.short_description) return data.short_description;
    }
  } catch (e) {}
  return '';
}

async function fetchWebsiteAboutSection(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);
    // Try to find About/Game section
    let about = $('section:contains("About")').text() || $('section:contains("Game")').text() || $('body').text();
    return about.replace(/\s+/g, ' ').trim().substring(0, 2000);
  } catch (e) { return ''; }
}

app.post('/api/research', async (req: any, res: any) => {
  const { projectName, tokenSymbol, contractAddress, roninContractAddress } = req.body;
  if (!projectName) {
    return res.status(400).json({ error: 'Missing projectName' });
  }



  try {
    // Check if we have the required API key for AI orchestration
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {

      // Fall back to traditional research method
      return await performTraditionalResearch(req, res);
    }

    // Use AI orchestrator for research planning and execution
    const aiResult = await conductAIOrchestratedResearch(
      projectName,
      anthropicApiKey,
      {
        name: projectName,
        aliases: tokenSymbol ? [projectName, tokenSymbol] : [projectName],
        // Add any additional basic info if available
      }
    );

    if (!aiResult.success) {

      return await performTraditionalResearch(req, res);
    }



    // Transform AI result to match expected response format
    const researchReport = {
      projectName: aiResult.researchPlan.projectClassification.type === 'web3_game' ? projectName : projectName,
      projectType: aiResult.researchPlan.projectClassification.type === 'web3_game' ? 'Web3Game' : 'TraditionalGame',
      keyFindings: {
        positives: aiResult.completeness?.recommendations?.filter(r => !r.includes('missing')) || [],
        negatives: aiResult.completeness?.gaps || [],
        redFlags: [],
      },
      financialData: {
        marketCap: null,
        tokenDistribution: null,
        fundingInfo: null,
      },
      teamAnalysis: {
        studioAssessment: [],
        linkedinSummary: '',
        glassdoorSummary: '',
      },
      technicalAssessment: {
        securitySummary: '',
        reviewSummary: '',
        githubRepo: null,
        githubStats: null,
      },
      communityHealth: {
        twitterSummary: '',
        steamReviewSummary: '',
        discordData: null,
        redditSummary: '',
      },
      sourcesUsed: aiResult.meta?.sourcesCollected ? ['AI-Orchestrated'] : [],
      aiSummary: `AI Analysis: ${aiResult.completeness?.confidence || 0}% confidence. ${aiResult.completeness?.recommendations?.join(', ') || 'Analysis complete'}`,
      confidence: await generateConfidenceMetrics({
        whitepaper: { found: true, data: {}, quality: 'high' as const, timestamp: new Date(), dataPoints: 1 },
        onchain_data: { found: true, data: {}, quality: 'high' as const, timestamp: new Date(), dataPoints: 1 },
        team_info: { found: true, data: {}, quality: 'medium' as const, timestamp: new Date(), dataPoints: 1 },
        community_health: { found: true, data: {}, quality: 'medium' as const, timestamp: new Date(), dataPoints: 1 },
        financial_data: { found: true, data: {}, quality: 'high' as const, timestamp: new Date(), dataPoints: 1 },
        media_coverage: { found: true, data: {}, quality: 'medium' as const, timestamp: new Date(), dataPoints: 1 },
        documentation: { found: true, data: {}, quality: 'high' as const, timestamp: new Date(), dataPoints: 1 },
        security_audit: { found: true, data: {}, quality: 'high' as const, timestamp: new Date(), dataPoints: 1 },
      }, { 
        totalScore: aiResult.completeness?.confidence || 75, 
        grade: 'B' as const, 
        confidence: 0.8,
        passesThreshold: true,
        breakdown: {
          dataCoverage: 80,
          sourceReliability: 85,
          recencyFactor: 90
        },
        missingCritical: [],
        recommendations: aiResult.completeness?.recommendations || []
      }, aiResult.researchPlan)
    };

    res.json(researchReport);

  } catch (error) {
    console.error('❌ Error in AI-orchestrated research:', error);
    // Fall back to traditional research
    return await performTraditionalResearch(req, res);
  }
});

// Traditional research method (fallback)
async function performTraditionalResearch(req: any, res: any) {
  const { projectName, tokenSymbol, contractAddress, roninContractAddress } = req.body;
  
  // --- Alias collection logic ---
  let aliases = [projectName];
  if (tokenSymbol) aliases.push(tokenSymbol);
  // Try to get from CoinGecko and IGDB after fetch
  // Try to get from website domain after fetch

  const sourcesUsed = [];
  let cgData = null, igdbData = null, steamData = null, discordData = null, etherscanData = null, solscanData = null, youtubeData = null, aiSummary = null, nftData = null, preLaunch = false, devTimeYears = null, fundingType = 'unknown', tokenomics = {}, steamReviewSummary = '', githubRepo = null, githubStats = null, steamChartsSummary = '', redditSummary = '', openseaSummary = '', magicEdenSummary = '', crunchbaseSummary = '', duneSummary = '', securitySummary = '', reviewSummary = '', linkedinSummary = '', glassdoorSummary = '', twitterSummary = '', blogSummary = '', telegramSummary = '';
  let roninTokenInfo = null;

  // Enhanced CoinGecko fetch
  try {
    let coinId = null;

    // 1. If contract address is provided, try contract endpoint (Ethereum only for now)
    if (contractAddress) {
      const contractRes = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${contractAddress}`);
      if (contractRes.ok) {
        cgData = await contractRes.json();
        sourcesUsed.push('CoinGecko');
    
        if (cgData.name) aliases.push(cgData.name);
        if (cgData.symbol) aliases.push(cgData.symbol);
        if (cgData.links && cgData.links.homepage && cgData.links.homepage[0]) {
          const dom = extractDomain(cgData.links.homepage[0]);
          if (dom) aliases.push(dom);
        }
      } else {
        cgData = { error: `CoinGecko contract: ${contractRes.status} ${contractRes.statusText}` };
    
      }
    } else {
      // 2. Otherwise, fetch all coins and try to match using all aliases

      
      const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (listRes.ok) {
        const coins: any[] = await listRes.json();

        
        // Try all aliases for id, name, symbol, partial/fuzzy
        let candidates: any[] = [];
        for (const alias of aliases) {
          const lowerAlias = alias.toLowerCase();
          candidates = coins.filter((c: any) => c.id.toLowerCase() === lowerAlias || c.name.toLowerCase() === lowerAlias);
          if (candidates.length) {

            break;
          }
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase() === tokenSymbol.toLowerCase());
          if (candidates.length) {

          }
        }
        if (!candidates.length) {
          for (const alias of aliases) {
            const lowerAlias = alias.toLowerCase();
            candidates = coins.filter((c: any) => c.id.toLowerCase().includes(lowerAlias) || c.name.toLowerCase().includes(lowerAlias));
            if (candidates.length) {

              break;
            }
          }
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase().includes(tokenSymbol.toLowerCase()));
          if (candidates.length) {

          }
        }
        if (candidates.length) {
          coinId = candidates[0].id;

          const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
          if (cgRes.ok) {
            cgData = await cgRes.json();
            sourcesUsed.push('CoinGecko');

            if (cgData.name) aliases.push(cgData.name);
            if (cgData.symbol) aliases.push(cgData.symbol);
            if (cgData.links && cgData.links.homepage && cgData.links.homepage[0]) {
              const dom = extractDomain(cgData.links.homepage[0]);
              if (dom) aliases.push(dom);
            }
          } else {
            cgData = { error: `CoinGecko: ${cgRes.status} ${cgRes.statusText}` };

          }
        } else {

          // Fallback: LLM-powered web search for contract address using all aliases
          let llmAddress = null;
          for (const alias of aliases) {
            llmAddress = await searchContractAddressWithLLM(alias);
            if (llmAddress) break;
          }
          if (llmAddress) {
            cgData = { fallback_contract_address: llmAddress };

          } else {
            cgData = { error: 'No matching token found on CoinGecko (checked id, name, symbol, partial matches, all aliases), and LLM web search did not find a contract address.' };

          }
        }
      } else {
        cgData = { error: `CoinGecko list: ${listRes.status} ${listRes.statusText}` };

      }
    }
  } catch (e) {
    cgData = { error: 'CoinGecko fetch failed' };

  }

  // IGDB fetch
  try {

    const igdbTokenRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
    const igdbTokenJson = await igdbTokenRes.json();
    const igdbToken = igdbTokenJson.access_token;
    
    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${igdbToken}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      },
      body: `search "${projectName}"; fields name,summary,platforms.name,genres.name,first_release_date,rating,cover.url,websites.url,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; limit 1;`,
    });
    if (igdbRes.ok) {
      const igdbJson = await igdbRes.json();
      igdbData = igdbJson[0] || null;
      if (igdbData) {
        sourcesUsed.push('IGDB');
      }
      if (igdbData && igdbData.name) aliases.push(igdbData.name);
      if (igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
        for (const w of igdbData.websites) {
          if (w.url) {
            const dom = extractDomain(w.url);
            if (dom) aliases.push(dom);
          }
        }
      }
      // 1. Update IGDB query to include involved_companies
      // 2. Fetch company details for each involved company
      // 3. Determine if studio is a developer, and if this is their first project
      // 4. Add studioAssessment to research report
      if (igdbData && igdbData.involved_companies && Array.isArray(igdbData.involved_companies)) {
        const studioAssessment = [];
        for (const company of igdbData.involved_companies) {
          if (company.developer) {
            const companyRes = await fetch(`https://api.igdb.com/v4/companies/${company.company}`, {
              method: 'GET',
              headers: {
                'Client-ID': process.env.IGDB_CLIENT_ID,
                'Authorization': `Bearer ${igdbToken}`,
                'Accept': 'application/json',
              },
            });
            if (companyRes.ok) {
              const companyJson = await companyRes.json();
              const isFirstProject = companyJson.first_project_date ? new Date(companyJson.first_project_date * 1000).toISOString() : 'N/A';
              studioAssessment.push({
                companyName: companyJson.name,
                isDeveloper: true,
                isPublisher: companyJson.publisher,
                firstProjectDate: isFirstProject,
              });
            }
          }
        }
        igdbData.studioAssessment = studioAssessment;
      }
    } else {
      igdbData = { error: `IGDB: ${igdbRes.status} ${igdbRes.statusText}` };
    }
  } catch (e) {
    igdbData = { error: 'IGDB fetch failed' };
  }

  // Deduplicate and prioritize aliases
  aliases = Array.from(new Set(aliases.map(a => a.trim().toLowerCase()).filter(Boolean)));

  // Enhanced search for established projects
  let officialSourcesData: any = null;
  if (isEstablishedProject(projectName, aliases)) {
    console.log(`Detected established project: ${projectName}, searching for official sources...`);
    officialSourcesData = await findOfficialSourcesForEstablishedProject(projectName, aliases);
    if (officialSourcesData) {
      sourcesUsed.push('OfficialSources');
      console.log('Found official sources:', Object.keys(officialSourcesData).filter(key => officialSourcesData[key]));
    }
  }

  // Steam fetch
  try {
    const steamRes = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(projectName)}&cc=us&l=en`);
    if (steamRes.ok) {
      const steamJson = await steamRes.json();
      steamData = steamJson.items && steamJson.items.length > 0 ? steamJson.items[0] : null;
      if (steamData) {
        sourcesUsed.push('Steam');
      }
    } else {
      steamData = { error: `Steam: ${steamRes.status} ${steamRes.statusText}` };
    }
  } catch (e) {
    steamData = { error: 'Steam fetch failed' };
  }

  // Collect all possible homepages/website URLs from CoinGecko, IGDB, and aliases
  let homepageUrls = [];
  if (cgData && cgData.links && cgData.links.homepage && Array.isArray(cgData.links.homepage)) {
    homepageUrls.push(...cgData.links.homepage.filter(Boolean));
  }
  if (igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    homepageUrls.push(...igdbData.websites.map((w: any) => w.url).filter(Boolean));
  }
  homepageUrls = Array.from(new Set(homepageUrls.filter(Boolean)));

  // --- Discord extraction ---
  let discordInvite = null;
  // 1. Try CoinGecko chat_url
  if (!discordInvite && cgData && cgData.links && cgData.links.chat_url && Array.isArray(cgData.links.chat_url)) {
    const cgDiscord = cgData.links.chat_url.find((u: string) => u && /discord\.(gg|com)\//i.test(u));
    if (cgDiscord) {
      discordInvite = cgDiscord;
    }
  }
  // 2. Try IGDB websites
  if (!discordInvite && igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    const igdbDiscord = igdbData.websites.find((w: any) => w.url && /discord\.(gg|com)\//i.test(w.url));
    if (igdbDiscord) {
      discordInvite = igdbDiscord.url;
    }
  }
  // 3. Try Steam community
  if (!discordInvite && steamData && steamData.metacritic && steamData.metacritic.url) {
    try {
      const steamCommunityRes = await fetch(steamData.metacritic.url);
      if (steamCommunityRes.ok) {
        const steamHtml = await steamCommunityRes.text();
        const discordMatch = steamHtml.match(/discord\.(gg|com)\/[a-zA-Z0-9]+/i);
        if (discordMatch) {
          discordInvite = `https://discord.gg/${discordMatch[0].split('/').pop()}`;
        }
      }
    } catch (e) {
      // Ignore Steam community fetch errors
    }
  }
  // 4. Try website scraping for Discord
  if (!discordInvite && homepageUrls.length > 0) {
    for (const url of homepageUrls.slice(0, 2)) { // Limit to first 2 URLs
      try {
        const websiteRes = await fetch(url);
        if (websiteRes.ok) {
          const websiteHtml = await websiteRes.text();
          const discordMatch = websiteHtml.match(/discord\.(gg|com)\/[a-zA-Z0-9]+/i);
          if (discordMatch) {
            discordInvite = `https://discord.gg/${discordMatch[0].split('/').pop()}`;
            break;
          }
        }
      } catch (e) {
        // Ignore website fetch errors
      }
    }
  }

  // --- Discord data fetch ---
  if (discordInvite) {
    try {
      const discordRes = await fetch(`https://discord.com/api/v10/invites/${discordInvite.split('/').pop()}?with_counts=true`);
      if (discordRes.ok) {
        const discordJson = await discordRes.json();
        discordData = {
          server_name: discordJson.guild?.name,
          member_count: discordJson.approximate_member_count,
        };
        sourcesUsed.push('Discord');
      }
    } catch (e) {
      discordData = { error: 'Discord fetch failed' };
    }
  }

  // --- Etherscan data fetch ---
  let ethAddress = null;
  if (contractAddress) {
    ethAddress = contractAddress;
  } else if (cgData && cgData.contracts && cgData.contracts.ethereum) {
    ethAddress = cgData.contracts.ethereum;
  } else if (cgData && cgData.platforms && cgData.platforms.ethereum) {
    ethAddress = cgData.platforms.ethereum;
  }

  if (ethAddress && process.env.ETHERSCAN_API_KEY) {
    try {
      const etherscanRes = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=${ethAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`);
      if (etherscanRes.ok) {
        const etherscanJson = await etherscanRes.json();
        if (etherscanJson.result && etherscanJson.result !== 'Contract source code not verified') {
          etherscanData = etherscanJson.result;
          sourcesUsed.push('Etherscan');
        }
      }
    } catch (e) {
      etherscanData = { error: 'Etherscan fetch failed' };
    }
  }

  // --- Solscan data fetch ---
  let solAddress = null;
  if (cgData && cgData.platforms && cgData.platforms.solana) {
    solAddress = cgData.platforms.solana;
  }

  if (solAddress) {
    try {
      const solscanRes = await fetch(`https://public-api.solscan.io/account/${solAddress}`);
      if (solscanRes.ok) {
        const solscanJson = await solscanRes.json();
        if (solscanJson.data) {
          solscanData = solscanJson.data;
          sourcesUsed.push('Solscan');
        }
      }
    } catch (e) {
      solscanData = { error: 'Solscan fetch failed' };
    }
  }

  // --- Ronin Network data fetch ---
  let roninAddress = null;
  if (roninContractAddress) {
    roninAddress = roninContractAddress;
  } else if (cgData && cgData.platforms && cgData.platforms.ronin) {
    roninAddress = cgData.platforms.ronin;
  }

  if (roninAddress) {
    try {

      
      // Fetch Ronin token data
      const roninTokenData = await fetchRoninTokenData(roninAddress);
      if (roninTokenData) {
        roninTokenInfo = roninTokenData;
        sourcesUsed.push('Ronin');

      }

      // Fetch Ronin transaction history
      const roninTxHistory = await fetchRoninTransactionHistory(roninAddress);
      if (roninTxHistory) {
        if (!roninTokenInfo) roninTokenInfo = {};
        roninTokenInfo.transactionHistory = roninTxHistory;
        
      }


    } catch (e) {

      roninTokenInfo = { error: 'Ronin fetch failed' };
    }
  }

  // --- YouTube data fetch ---
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(projectName)}&maxResults=3&type=video&key=${process.env.YOUTUBE_API_KEY}`);
      if (youtubeRes.ok) {
        const youtubeJson = await youtubeRes.json();
        if (youtubeJson.items && youtubeJson.items.length > 0) {
          const videoIds = youtubeJson.items.map((item: any) => item.id.videoId).join(',');
          const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`);
          if (detailsRes.ok) {
            const detailsJson = await detailsRes.json();
            youtubeData = detailsJson.items || [];
            sourcesUsed.push('YouTube');
          }
        }
      }
    } catch (e) {
      youtubeData = { error: 'YouTube fetch failed' };
    }
  }

  // --- AI Summary generation ---
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `Analyze this Web3/Gaming project data and provide a comprehensive summary:

Project: ${projectName}
Token Symbol: ${tokenSymbol || 'N/A'}
Contract Address: ${contractAddress || 'N/A'}

Data Sources:
- CoinGecko: ${cgData ? 'Available' : 'Not found'}
- IGDB: ${igdbData ? 'Available' : 'Not found'}
- Steam: ${steamData ? 'Available' : 'Not found'}
- Discord: ${discordData ? 'Available' : 'Not found'}
- Etherscan: ${etherscanData ? 'Available' : 'Not found'}
- YouTube: ${youtubeData ? 'Available' : 'Not found'}

Key Data Points:
${cgData ? `- Market Cap: ${cgData.market_data?.market_cap?.usd ? `$${(cgData.market_data.market_cap.usd / 1e6).toFixed(2)}M` : 'N/A'}
- Price: ${cgData.market_data?.current_price?.usd ? `$${cgData.market_data.current_price.usd}` : 'N/A'}
- 24h Volume: ${cgData.market_data?.total_volume?.usd ? `$${(cgData.market_data.total_volume.usd / 1e6).toFixed(2)}M` : 'N/A'}` : '- No financial data available'}

${igdbData ? `- Game Type: ${igdbData.genres?.map((g: any) => g.name).join(', ') || 'N/A'}
- Release Date: ${igdbData.first_release_date ? new Date(igdbData.first_release_date * 1000).toLocaleDateString() : 'N/A'}
- Rating: ${igdbData.rating ? `${(igdbData.rating / 10).toFixed(1)}/10` : 'N/A'}` : '- No game data available'}

${discordData ? `- Discord Members: ${discordData.member_count?.toLocaleString() || 'N/A'}` : '- No community data available'}

Please provide a comprehensive analysis including:
1. Project overview and type classification
2. Key strengths and weaknesses
3. Market position and competitive analysis
4. Community health assessment
5. Technical foundation evaluation
6. Risk assessment and red flags
7. Investment recommendation (if applicable)

Format the response as a clear, structured analysis suitable for investors and researchers.`;

      const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const aiResponse = await response.json();
        aiSummary = aiResponse.content[0].text;
        sourcesUsed.push('Anthropic');
      } else {
        aiSummary = 'Anthropic: Failed to generate AI summary';
      }
    } catch (e) {
      aiSummary = 'Anthropic: Error generating AI summary';
    }
  }

  // --- Data mapping and scoring ---


  const findings = mapDataToFindings({
    cgData,
    igdbData,
    steamData,
    discordData,
    etherscanData,
    roninTokenInfo,
    studioAssessment: igdbData?.studioAssessment,
    securitySummary,
    twitterSummary,
    redditSummary,
    telegramSummary,
    officialSourcesData,
  });





  // Quality gates check
  if (sourcesUsed.length === 0) {
    return res.status(404).json({ error: 'No data found for this project from any source.' });
  }

  const scoringEngine = new ResearchScoringEngine();
  const score = scoringEngine.calculateResearchScore(findings);
  const proceed = score.passesThreshold;
  const reason = proceed ? 'Research quality sufficient for analysis' : 'Research quality below threshold';

  const qualityGates = new QualityGatesEngine();
  const gateResult = qualityGates.checkQualityGates(findings, {
    type: 'web3_game',
    confidence: score.confidence
  });

  const confidenceMetrics = await generateConfidenceMetrics(findings, score, {
    projectClassification: {
      type: 'web3_game',
      confidence: score.confidence,
      reasoning: 'AI analysis'
    },
    prioritySources: [],
    riskAreas: [],
    searchAliases: [],
    estimatedResearchTime: 0,
    successCriteria: {
      minimumSources: 0,
      criticalDataPoints: [],
      redFlagChecks: []
    }
  });

  // Research report
  const researchReport: any = {
    projectName: cgData?.name || igdbData?.name || projectName,
    projectType: 'Web3Game', // Placeholder, real logic needed

    keyFindings: {
      positives: [],
      negatives: [],
      redFlags: [],
    },
    financialData: {
      marketCap: cgData?.market_data?.market_cap?.usd,
      roninTokenInfo,
    },
    teamAnalysis: {
      studioAssessment: igdbData?.studioAssessment,
      linkedinSummary,
      glassdoorSummary,
    },
    technicalAssessment: {
      securitySummary,
      reviewSummary,
      githubRepo,
      githubStats,
    },
    communityHealth: {
      twitterSummary,
      steamReviewSummary,
      discordData,
      redditSummary,
    },
    recommendation: {},
    sourcesUsed,
    aiSummary,
    telegramSummary,
    blogSummary,
    twitterSummary,
    linkedinSummary,
    securitySummary,
    reviewSummary,
    glassdoorSummary,
    studioAssessment: igdbData?.studioAssessment,
    
    // Quality Gates Results
    researchQuality: {
      score: score.totalScore,
      grade: score.grade,
      confidence: score.confidence,
      passesThreshold: proceed,
      breakdown: score.breakdown,
      missingCritical: score.missingCritical,
      recommendations: score.recommendations,
      proceedWithAnalysis: proceed,
      reason: reason,
      qualityGates: {
        passed: gateResult.passed,
        gatesFailed: gateResult.gatesFailed,
        recommendations: gateResult.recommendations,
        manualSuggestions: gateResult.manualResearchSuggestions,
        retryAfter: gateResult.retryAfter,
        severity: gateResult.gatesFailed.includes('red_flags') ? 'critical' : 
                  gateResult.gatesFailed.includes('critical_sources') ? 'high' : 'medium'
      }
    }
  };

  // Add confidence data at the end to ensure it's not overwritten
  researchReport.confidence = confidenceMetrics;
  

  
  res.json(researchReport);
}

app.listen(PORT, () => {
  // Server started
});

// Helper: Retry logic for Anthropic API
async function fetchWithRetry(url: string, options: any, retries = 3, backoff = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 529) {
      return res;
    }
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
  }
  // Final attempt
  return await fetch(url, options);
}

// Export functions for testing
export { searchProjectSpecificTokenomics };

// Ronin Network Support
async function fetchRoninTokenData(contractAddress: string): Promise<any> {
  try {
    // Ronin Network RPC endpoint
    const roninRpcUrl = 'https://api.roninchain.com/free/mainnet';
    
    // Fetch token data using Ronin RPC
    const tokenDataRes = await fetch(roninRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: '0x18160ddd' // totalSupply()
          },
          'latest'
        ],
        id: 1
      })
    });

    if (tokenDataRes.ok) {
      const tokenData = await tokenDataRes.json();
      
      // Fetch token metadata
      const metadataRes = await fetch(roninRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: contractAddress,
              data: '0x95d89b41' // symbol()
            },
            'latest'
          ],
          id: 1
        })
      });

      const metadata = await metadataRes.json();
      
      return {
        totalSupply: tokenData.result,
        symbol: metadata.result,
        network: 'ronin',
        contractAddress: contractAddress
      };
    }
  } catch (e) {

  }
  return null;
}

async function fetchRoninTransactionHistory(contractAddress: string): Promise<any> {
  try {
    // Use Ronin blockchain explorer API
    const explorerUrl = `https://explorer.roninchain.com/api/token/${contractAddress}/transactions`;
    const res = await fetch(explorerUrl);
    
    if (res.ok) {
      const data = await res.json();
      return {
        transactionCount: data.total || 0,
        recentTransactions: data.transactions?.slice(0, 10) || [],
        network: 'ronin'
      };
    }
  } catch (e) {

  }
  return null;
}





function countDataPoints(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return Math.min(sentences.length, 50);
}