import express from 'express';
import cors from 'cors';
// @ts-ignore
const fetch = require('node-fetch');
require('dotenv').config();
import { ethers } from 'ethers';
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.send('DYOR BOT API is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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
  // Fetch the homepage and look for links containing 'whitepaper' or 'tokenomics'
  try {
    const res = await fetch(websiteUrl);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let found = null;
    $('a').each((_: any, el: any) => {
      const href = $(el).attr('href');
      if (href && /whitepaper|tokenomics/i.test(href)) {
        found = href.startsWith('http') ? href : new URL(href, websiteUrl).toString();
        return false;
      }
    });
    return found;
  } catch (e) {
    return null;
  }
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
  const prompt = `Given the following text from a crypto project whitepaper or tokenomics page, extract the tokenomics details (total supply, distribution breakdown, vesting schedule, etc.). Return as structured JSON.\n\nText:\n${text.substring(0, 12000)}`;
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

app.post('/api/research', async (req, res) => {
  console.log('Received POST /api/research', req.body);
  const { projectName, tokenSymbol, contractAddress, roninContractAddress } = req.body;
  if (!projectName) {
    return res.status(400).json({ error: 'Missing projectName' });
  }

  // --- Alias collection logic ---
  let aliases = [projectName];
  if (tokenSymbol) aliases.push(tokenSymbol);
  // Try to get from CoinGecko and IGDB after fetch
  // Try to get from website domain after fetch

  const sourcesUsed = [];
  let cgData = null, igdbData = null, steamData = null, discordData = null, etherscanData = null, solscanData = null, youtubeData = null, aiSummary = null, aiRiskScore = null, nftData = null, preLaunch = false, devTimeYears = null, fundingType = 'unknown', tokenomics = {}, steamReviewSummary = '', githubRepo = null, githubStats = null, steamChartsSummary = '', redditSummary = '', openseaSummary = '', magicEdenSummary = '', crunchbaseSummary = '', duneSummary = '', securitySummary = '', reviewSummary = '', linkedinSummary = '', glassdoorSummary = '', twitterSummary = '', blogSummary = '', telegramSummary = '';
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
          if (candidates.length) break;
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase() === tokenSymbol.toLowerCase());
        }
        if (!candidates.length) {
          for (const alias of aliases) {
            const lowerAlias = alias.toLowerCase();
            candidates = coins.filter((c: any) => c.id.toLowerCase().includes(lowerAlias) || c.name.toLowerCase().includes(lowerAlias));
            if (candidates.length) break;
          }
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase().includes(tokenSymbol.toLowerCase()));
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
      if (igdbData) sourcesUsed.push('IGDB');
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
          if (candidates.length) break;
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase() === tokenSymbol.toLowerCase());
        }
        if (!candidates.length) {
          for (const alias of aliases) {
            const lowerAlias = alias.toLowerCase();
            candidates = coins.filter((c: any) => c.id.toLowerCase().includes(lowerAlias) || c.name.toLowerCase().includes(lowerAlias));
            if (candidates.length) break;
          }
        }
        if (!candidates.length && tokenSymbol) {
          candidates = coins.filter((c: any) => c.symbol.toLowerCase().includes(tokenSymbol.toLowerCase()));
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

  // Steam fetch
  try {
    const steamRes = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(projectName)}&cc=us&l=en`);
    if (steamRes.ok) {
      const steamJson = await steamRes.json();
      steamData = steamJson.items && steamJson.items.length > 0 ? steamJson.items[0] : null;
      if (steamData) sourcesUsed.push('Steam');
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
      const match = cgDiscord.match(/discord\.(?:gg|com)\/(invite\/)?([\w-]+)/i);
      if (match) discordInvite = match[2];
    }
  }
  // 2. Try IGDB websites
  if (!discordInvite && igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    for (const w of igdbData.websites) {
      if (typeof w.url === 'string' && /discord\.(gg|com)\//i.test(w.url)) {
        const match = w.url.match(/discord\.(?:gg|com)\/(invite\/)?([\w-]+)/i);
        if (match) {
          discordInvite = match[2];
          break;
        }
      }
    }
  }
  // 3. Scrape all homepages for Discord links
  if (!discordInvite) {
    for (const url of homepageUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const html = await res.text();
          const { discord } = extractSocialLinksFromHtml(html);
          if (discord) {
            const match = discord.match(/discord\.(?:gg|com)\/(invite\/)?([\w-]+)/i);
            if (match) {
              discordInvite = match[2];
              break;
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
  }
  // Fetch Discord data if found
  if (discordInvite) {
    try {
      const discordRes = await fetch(`https://discord.com/api/v10/invites/${discordInvite}?with_counts=true&with_expiration=true`);
      if (discordRes.ok) {
        const discordJson = await discordRes.json();
        discordData = {
          approximate_member_count: discordJson.approximate_member_count,
          approximate_presence_count: discordJson.approximate_presence_count,
          server_name: discordJson.guild?.name,
          invite: discordInvite,
          created_at: discordJson.guild?.id ? new Date(parseInt(discordJson.guild.id) / 4194304 + 1420070400000).toISOString() : undefined,
        } as any;
        // Try to fetch widget info (if enabled)
        try {
          const widgetRes = await fetch(`https://discord.com/api/guilds/${discordJson.guild.id}/widget.json`);
          if (widgetRes.ok) {
            const widgetJson = await widgetRes.json();
            (discordData as any).online_count = widgetJson.presence_count;
            (discordData as any).instant_invite = widgetJson.instant_invite;
            (discordData as any).channels = widgetJson.channels?.length;
            (discordData as any).members = widgetJson.members?.length;
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { discordData = { ...(discordData as any), error: 'Discord fetch failed' }; }
  }

  // --- Twitter extraction ---
  let twitterHandle = null;
  // 1. Try CoinGecko
  if (cgData && cgData.links && cgData.links.twitter_screen_name) {
    twitterHandle = cgData.links.twitter_screen_name;
  }
  // 2. Try IGDB websites
  if (!twitterHandle && igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    const tw = igdbData.websites.find((w: any) => typeof w.url === 'string' && w.url.includes('twitter.com'));
    if (tw) {
      const match = tw.url.match(/twitter.com\/([\w_]+)/);
      if (match) twitterHandle = match[1];
    }
  }
  // 3. Scrape all homepages for Twitter links
  if (!twitterHandle) {
    for (const url of homepageUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const html = await res.text();
          const { twitter } = extractSocialLinksFromHtml(html);
          if (twitter) {
            const match = twitter.match(/twitter.com\/([\w_]+)/);
            if (match) {
              twitterHandle = match[1];
              break;
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
  }
  // Fetch Twitter data if found
  if (twitterHandle) {
    try {
      const twData = await fetchTwitterProfileAndTweets(twitterHandle);
      if (twData) {
        twitterSummary = `Twitter (@${twitterHandle}): Bio: ${twData.bio} | Followers: ${twData.followers} | Pinned: ${twData.pinned} | Last 5 tweets: ${twData.tweets.slice(0,5).map((t, i) => `"${t}" (${twData.likes[i] || 0} likes, ${twData.rts[i] || 0} RTs)`).join(' | ')}. Sentiment: ${twData.sentiment.pos} positive, ${twData.sentiment.neg} negative.`;
      }
    } catch (e) { /* ignore */ }
  }

  // Etherscan fetch
  try {
    let ethAddress = cgData?.platforms?.ethereum;
    // Use fallback contract address if found by LLM
    if (!ethAddress && cgData?.fallback_contract_address) {
      ethAddress = cgData.fallback_contract_address;
    }
    if (ethAddress && process.env.ETHERSCAN_API_KEY) {
      const etherscanRes = await fetch(`https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${ethAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`);
      if (etherscanRes.ok) {
        const etherscanJson = await etherscanRes.json();
        etherscanData = etherscanJson.result || null;
        if (etherscanData) sourcesUsed.push('Etherscan');
      } else {
        etherscanData = { error: `Etherscan: ${etherscanRes.status} ${etherscanRes.statusText}` };
      }
    }
  } catch (e) {
    etherscanData = { error: 'Etherscan fetch failed' };
  }

  // Solscan fetch
  try {
    const solAddress = cgData?.platforms?.solana;
    if (solAddress) {
      const solscanRes = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${solAddress}`);
      if (solscanRes.ok) {
        solscanData = await solscanRes.json();
        if (solscanData) sourcesUsed.push('Solscan');
      } else {
        solscanData = { error: `Solscan: ${solscanRes.status} ${solscanRes.statusText}` };
      }
    }
  } catch (e) {
    solscanData = { error: 'Solscan fetch failed' };
  }

  // YouTube enrichment: fetch more video details and top comments
  try {
    if (process.env.YOUTUBE_API_KEY) {
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(projectName)}&maxResults=3&type=video&key=${process.env.YOUTUBE_API_KEY}`);
      if (ytRes.ok) {
        const ytJson = await ytRes.json();
        if (ytJson.items && ytJson.items.length > 0) {
          const videoIds = ytJson.items.map((v: any) => v.id.videoId).join(',');
          const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`);
          let detailsJson = null;
          if (detailsRes.ok) detailsJson = await detailsRes.json();
          let ytSummary = ytJson.items.map((v: any, i: number) => {
            const d = detailsJson && detailsJson.items && detailsJson.items[i];
            return `${v.snippet.title} (${d?.statistics?.viewCount || 'N/A'} views, ${d?.statistics?.likeCount || 'N/A'} likes, by ${v.snippet.channelTitle}, ${v.snippet.publishedAt})`;
          }).join(' | ');
          // Optionally fetch top comment for first video
          let topComment = '';
          if (detailsJson && detailsJson.items && detailsJson.items[0]) {
            const vid = detailsJson.items[0].id;
            const commentRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${vid}&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`);
            if (commentRes.ok) {
              const commentJson = await commentRes.json();
              if (commentJson.items && commentJson.items[0]) {
                topComment = commentJson.items[0].snippet.topLevelComment.snippet.textDisplay;
              }
            }
          }
          youtubeData = ytJson.items;
          if (ytSummary) {
            youtubeData.summary = `YouTube: ${ytSummary}${topComment ? ' | Top comment: ' + topComment : ''}`;
          }
        }
      }
    }
  } catch (e) { /* ignore */ }

  // OpenSea NFT stats (Ethereum)
  try {
    const openseaRes = await fetch(`https://api.opensea.io/api/v2/collections?chain=ethereum&asset_owner=${encodeURIComponent(projectName)}`);
    if (openseaRes.ok) {
      const openseaJson = await openseaRes.json();
      if (openseaJson && openseaJson.collections && openseaJson.collections.length > 0) {
        nftData = openseaJson.collections;
        sourcesUsed.push('OpenSea');
        // Fetch stats for the first collection
        const slug = openseaJson.collections[0].slug;
        const statsRes = await fetch(`https://api.opensea.io/api/v2/collections/${slug}/stats`);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson && statsJson.stats) {
            openseaSummary = `OpenSea: Floor ${statsJson.stats.floor_price}, 24h vol ${statsJson.stats.one_day_volume}, 7d vol ${statsJson.stats.seven_day_volume}, holders ${statsJson.stats.num_owners}`;
          }
        }
      }
    }
  } catch (e) { /* ignore */ }

  // Magic Eden NFT stats (Solana)
  try {
    if (solscanData && solscanData.symbol) {
      const meRes = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${solscanData.symbol}/stats`);
      if (meRes.ok) {
        const meJson = await meRes.json();
        magicEdenSummary = `Magic Eden: Floor ${meJson.floorPrice}, listed ${meJson.listedCount}, owners ${meJson.ownerCount}, 24h vol ${meJson.volume24hr}`;
      }
    }
  } catch (e) { /* ignore */ }

  // Crunchbase integration: search for project/company, fetch funding/team info
  try {
    const cbRes = await fetch(`https://api.crunchbase.com/api/v4/entities/organizations?user_key=YOUR_CRUNCHBASE_API_KEY&query=${encodeURIComponent(projectName)}&limit=1`);
    if (cbRes.ok) {
      const cbJson = await cbRes.json();
      if (cbJson.entities && cbJson.entities.length > 0) {
        const org = cbJson.entities[0];
        let funding = org.funding_total ? `Raised ${org.funding_total}` : '';
        let rounds = org.funding_rounds ? `in ${org.funding_rounds.length} rounds` : '';
        let lastRound = org.funding_rounds && org.funding_rounds.length > 0 ? `last round ${org.funding_rounds[0].announced_on}` : '';
        let investors = org.investors && org.investors.length > 0 ? `Investors: ${org.investors.map((i: any) => i.name).join(', ')}` : '';
        let team = org.num_employees_min ? `Team size: ${org.num_employees_min}+` : '';
        crunchbaseSummary = `Crunchbase: ${funding} ${rounds} ${lastRound} ${investors} ${team}`;
      }
    }
  } catch (e) { /* ignore */ }

  // Dune Analytics integration: fetch on-chain activity/token flow metrics
  try {
    // Example: fetch a public Dune dashboard for the project (stub, replace with real query if available)
    // You need a Dune API key for real queries
    // const duneRes = await fetch(`https://api.dune.com/api/v1/query/YOUR_QUERY_ID/results?api_key=YOUR_DUNE_API_KEY`);
    // if (duneRes.ok) { ... parse and summarize ... }
    // For now, stub:
    duneSummary = 'Dune: On-chain analytics integration coming soon.';
  } catch (e) { /* ignore */ }

  // CertiK security audit integration (basic public scrape)
  try {
    const certikRes = await fetch(`https://www.certik.com/projects/${encodeURIComponent(projectName.toLowerCase())}`);
    if (certikRes.ok) {
      const html = await certikRes.text();
      // Look for audit status and score in the HTML
      const scoreMatch = html.match(/Security Score<\/div>\s*<div[^>]*>([\d.]+)<\/div>/);
      const statusMatch = html.match(/Audit Status<\/div>\s*<div[^>]*>([A-Za-z ]+)<\/div>/);
      const lastAuditMatch = html.match(/Last Audit<\/div>\s*<div[^>]*>([^<]+)<\/div>/);
      let score = scoreMatch ? scoreMatch[1] : null;
      let status = statusMatch ? statusMatch[1] : null;
      let lastAudit = lastAuditMatch ? lastAuditMatch[1] : null;
      if (score || status || lastAudit) {
        securitySummary += `CertiK: ${status ? status + ', ' : ''}${score ? 'score ' + score + ', ' : ''}${lastAudit ? 'last audit ' + lastAudit : ''}`;
      }
    }
  } catch (e) { /* ignore */ }
  // Immunefi bug bounty check (basic public search)
  try {
    const immunefiRes = await fetch(`https://immunefi.com/bounty/${encodeURIComponent(projectName.toLowerCase())}/`);
    if (immunefiRes.ok) {
      const html = await immunefiRes.text();
      if (/Bug Bounty/.test(html)) {
        securitySummary += (securitySummary ? ' | ' : '') + 'Immunefi: Bug bounty active.';
      }
    }
  } catch (e) { /* ignore */ }

  // LinkedIn integration (basic public search/scrape)
  try {
    const searchRes = await fetch(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(projectName)}`);
    if (searchRes.ok) {
      const html = await searchRes.text();
      // Try to extract the first company page URL
      const match = html.match(/<a[^>]+href="(https:\/\/www.linkedin.com\/company\/[^"?]+)"/);
      if (match) {
        const companyUrl = match[1];
        const companyRes = await fetch(companyUrl);
        if (companyRes.ok) {
          const companyHtml = await companyRes.text();
          // Extract employee count
          const empMatch = companyHtml.match(/([\d,]+) employees/);
          const empCount = empMatch ? empMatch[1] : null;
          // Extract notable team members (very basic: look for 'Notable alumni' or 'People also viewed')
          let notable = [];
          const notableMatch = companyHtml.match(/Notable alumni[\s\S]*?<ul[\s\S]*?<li[\s\S]*?>([\s\S]*?)<\/ul>/);
          if (notableMatch) {
            const names = notableMatch[1].match(/<span[^>]*>([^<]+)<\/span>/g);
            if (names) {
              notable = names.map((n: any) => n.replace(/<[^>]+>/g, ''));
            }
          }
          linkedinSummary = `LinkedIn: ${empCount ? empCount + ' employees' : 'Employee count N/A'}${notable.length ? ', notable: ' + notable.join(', ') : ''}`;
        }
      }
    }
  } catch (e) { /* ignore */ }

  // Pre-launch detection (IGDB and Steam)
  if (
    (igdbData && igdbData.first_release_date && Date.now() < igdbData.first_release_date * 1000) ||
    (steamData && steamData.release_date && steamData.release_date.coming_soon)
  ) {
    preLaunch = true;
  }

  // Dev time estimation
  let now = Date.now();
  let earliestDate = null;
  if (igdbData && igdbData.first_release_date) {
    earliestDate = igdbData.first_release_date * 1000;
  }
  if (steamData && steamData.release_date && steamData.release_date.date) {
    let steamDate = Date.parse(steamData.release_date.date);
    if (!isNaN(steamDate) && (!earliestDate || steamDate < earliestDate)) {
      earliestDate = steamDate;
    }
  }
  if (earliestDate) {
    devTimeYears = ((now - earliestDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
  }

  // Funding source detection (CoinGecko)
  if (cgData && cgData.funding_rounds && Array.isArray(cgData.funding_rounds) && cgData.funding_rounds.length > 0) {
    fundingType = 'VC-backed';
  } else if (cgData && cgData.description && /self[- ]funded/i.test(cgData.description.en || '')) {
    fundingType = 'self-funded';
  }

  // Tokenomics & holder distribution
  if (cgData && cgData.market_data) {
    tokenomics = {
      circulating_supply: cgData.market_data.circulating_supply,
      total_supply: cgData.market_data.total_supply,
      max_supply: cgData.market_data.max_supply,
      holders: etherscanData && etherscanData.holders,
      // Add more fields as needed
    };
  } else if (cgData && cgData.links && cgData.links.homepage && cgData.links.homepage[0]) {
    // Fallback: try to extract from whitepaper
    const extracted = await extractTokenomicsFromWhitepaper(cgData.links.homepage[0]);
    if (extracted) tokenomics = extracted;
  }

  // Steam review sentiment summary (basic)
  if (steamData && steamData.steam_appid) {
    try {
      const reviewsRes = await fetch(`https://store.steampowered.com/appreviews/${steamData.steam_appid}?json=1&num_per_page=20`);
      if (reviewsRes.ok) {
        const reviewsJson = await reviewsRes.json();
        if (reviewsJson.reviews && Array.isArray(reviewsJson.reviews)) {
          let delayMentions = 0, commMentions = 0, total = 0;
          for (const r of reviewsJson.reviews) {
            if (/delay|slow|update|wait|late|roadmap/i.test(r.review)) delayMentions++;
            if (/dev|communicat|abandon|inactive|progress/i.test(r.review)) commMentions++;
            total++;
          }
          steamReviewSummary = `Out of ${total} recent reviews: ${delayMentions} mention delays/updates, ${commMentions} mention dev communication/progress.`;
        }
      }
    } catch (e) { /* ignore */ }
  }

  // SteamCharts scraping for player count history
  if (steamData && steamData.steam_appid) {
    try {
      const chartsRes = await fetch(`https://steamcharts.com/app/${steamData.steam_appid}`);
      if (chartsRes.ok) {
        const html = await chartsRes.text();
        // Simple regex to extract player numbers from the summary table
        const m = html.match(/<td class="num">([\d,]+)<\/td>\s*<td class="num">([\d,]+)<\/td>\s*<td class="num">([\d,]+)<\/td>\s*<td class="num">([\d,]+)<\/td>/);
        if (m) {
          const [_, current, peak24h, avg30d, peak30d] = m.map((x: any) => x && x.replace(/,/g, ''));
          steamChartsSummary = `Current players: ${current}, 24h peak: ${peak24h}, 30d avg: ${avg30d}, 30d peak: ${peak30d}`;
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Auto-detect GitHub repo from IGDB and CoinGecko
  if (igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    const gh = igdbData.websites.find((w: any) => typeof w.url === 'string' && w.url.includes('github.com'));
    if (gh) githubRepo = gh.url;
  }
  if (!githubRepo && cgData && cgData.links && cgData.links.repos_url && Array.isArray(cgData.links.repos_url.github) && cgData.links.repos_url.github.length > 0) {
    githubRepo = cgData.links.repos_url.github[0];
  }
  // Fetch GitHub repo stats if found
  if (githubRepo) {
    try {
      // Extract owner/repo from URL
      const match = githubRepo.match(/github.com\/(.+?)\/(.+?)(\/|$)/);
      if (match) {
        const owner = match[1];
        const repo = match[2];
        const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          githubStats = {
            stargazers_count: ghJson.stargazers_count,
            forks_count: ghJson.forks_count,
            open_issues_count: ghJson.open_issues_count,
            subscribers_count: ghJson.subscribers_count,
            pushed_at: ghJson.pushed_at,
            created_at: ghJson.created_at,
            updated_at: ghJson.updated_at,
            language: ghJson.language,
            license: ghJson.license && ghJson.license.spdx_id,
            // Add more fields as needed
          };
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Reddit integration: search for recent posts/comments mentioning the project
  try {
    const redditRes = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(projectName)}&sort=new&limit=20`);
    if (redditRes.ok) {
      const redditJson = await redditRes.json();
      if (redditJson.data && redditJson.data.children && Array.isArray(redditJson.data.children)) {
        let pos = 0, neg = 0, neu = 0, total = 0;
        for (const post of redditJson.data.children) {
          const text = (post.data.title + ' ' + (post.data.selftext || '')).toLowerCase();
          if (/scam|rug|delay|abandon|dead|problem|concern|down|bad|fail|fud/.test(text)) neg++;
          else if (/great|good|awesome|excite|love|moon|up|success|win|active|dev/.test(text)) pos++;
          else neu++;
          total++;
        }
        redditSummary = `Reddit (last 20 posts): ${pos} positive, ${neg} negative, ${neu} neutral.`;
      }
    }
  } catch (e) { /* ignore */ }

  // Metacritic integration (basic public scrape)
  try {
    const metaRes = await fetch(`https://www.metacritic.com/search/game/${encodeURIComponent(projectName)}/results`);
    if (metaRes.ok) {
      const html = await metaRes.text();
      // Try to extract the first result's URL
      const match = html.match(/<a href=\"(\/game\/[^\"]+)\"/);
      if (match) {
        const gameUrl = `https://www.metacritic.com${match[1]}`;
        const gameRes = await fetch(gameUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (gameRes.ok) {
          const gameHtml = await gameRes.text();
          const criticScore = (gameHtml.match(/<span class=\"metascore_w xlarge game positive\">(\d+)<\/span>/) || [])[1];
          const userScore = (gameHtml.match(/<div class=\"metascore_w user large game positive\">([\d.]+)<\/div>/) || [])[1];
          const numCriticReviews = (gameHtml.match(/based on (\d+) Critic Reviews/) || [])[1];
          const numUserReviews = (gameHtml.match(/based on (\d+) Ratings/) || [])[1];
          reviewSummary += `Metacritic: Critic score ${criticScore || 'N/A'}, user score ${userScore || 'N/A'}, ${numCriticReviews || 'N/A'} critic reviews, ${numUserReviews || 'N/A'} user ratings.`;
        }
      }
    }
  } catch (e) { /* ignore */ }
  // OpenCritic integration (basic public scrape)
  try {
    const ocRes = await fetch(`https://opencritic.com/search/all/${encodeURIComponent(projectName)}`);
    if (ocRes.ok) {
      const html = await ocRes.text();
      // Try to extract the first result's URL
      const match = html.match(/<a href=\"(\/game\/\d+\/[^\"]+)\"/);
      if (match) {
        const gameUrl = `https://opencritic.com${match[1]}`;
        const gameRes = await fetch(gameUrl);
        if (gameRes.ok) {
          const gameHtml = await gameRes.text();
          const score = (gameHtml.match(/<span class=\"score\">(\d+)<\/span>/) || [])[1];
          const numReviews = (gameHtml.match(/Based on (\d+) critic reviews/) || [])[1];
          reviewSummary += (reviewSummary ? ' | ' : '') + `OpenCritic: Score ${score || 'N/A'}, ${numReviews || 'N/A'} critic reviews.`;
        }
      }
    }
  } catch (e) { /* ignore */ }

  // Glassdoor integration (basic public scrape)
  try {
    const searchRes = await fetch(`https://www.glassdoor.com/Reviews/${encodeURIComponent(projectName)}-reviews-SRCH_KE0,${projectName.length}.htm`);
    if (searchRes.ok) {
      const html = await searchRes.text();
      // Try to extract the first company page URL
      const match = html.match(/<a href=\"(\/Overview\/Working-at-[^\"]+)\"/);
      if (match) {
        const companyUrl = `https://www.glassdoor.com${match[1]}`;
        const companyRes = await fetch(companyUrl);
        if (companyRes.ok) {
          const companyHtml = await companyRes.text();
          // Extract overall rating
          const rating = (companyHtml.match(/<span class=\"ratingNum\">([\d.]+)<\/span>/) || [])[1];
          // Extract number of reviews
          const numReviews = (companyHtml.match(/([\d,]+) Reviews/) || [])[1];
          // Extract CEO approval
          const ceoApproval = (companyHtml.match(/CEO Approval[\s\S]*?<span[^>]*>([\d]+)%<\/span>/) || [])[1];
          // Extract pros/cons (very basic: first listed)
          const pros = (companyHtml.match(/Pros[\s\S]*?<span[^>]*>([^<]+)<\/span>/) || [])[1];
          const cons = (companyHtml.match(/Cons[\s\S]*?<span[^>]*>([^<]+)<\/span>/) || [])[1];
          glassdoorSummary = `Glassdoor: ${rating || 'N/A'} stars, ${numReviews || 'N/A'} reviews, CEO approval ${ceoApproval || 'N/A'}%. Pros: ${pros || 'N/A'}. Cons: ${cons || 'N/A'}.`;
        }
      }
    }
  } catch (e) { /* ignore */ }

  // Medium/Blog integration: auto-detect link, fetch recent posts, summarize
  let blogUrl = null;
  // Try CoinGecko
  if (cgData && cgData.links && cgData.links.official_forum_url && Array.isArray(cgData.links.official_forum_url)) {
    const mediumLink = cgData.links.official_forum_url.find((u: string) => u && (u.includes('medium.com') || u.includes('blog.')));
    if (mediumLink) blogUrl = mediumLink;
  }
  // Try IGDB websites
  if (!blogUrl && igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    const blog = igdbData.websites.find((w: any) => typeof w.url === 'string' && (w.url.includes('medium.com') || w.url.includes('blog.')));
    if (blog) blogUrl = blog.url;
  }
  // Fetch recent Medium posts (public RSS)
  if (blogUrl && blogUrl.includes('medium.com')) {
    try {
      // Convert to RSS feed URL
      let feedUrl = blogUrl.replace('medium.com/', 'medium.com/feed/');
      if (!feedUrl.endsWith('/')) feedUrl += '/';
      const rssRes = await fetch(feedUrl);
      if (rssRes.ok) {
        const xml = await rssRes.text();
        // Extract titles and dates (very basic)
        const items = [...xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g)];
        blogSummary = 'Medium: ' + items.slice(0, 3).map(m => `${m[1]} (${m[2]})`).join(' | ');
      }
    } catch (e) { /* ignore */ }
  }
  // Fetch recent blog posts (basic public RSS for blog.*)
  if (blogUrl && blogUrl.includes('blog.') && !blogUrl.includes('medium.com')) {
    try {
      let feedUrl = blogUrl;
      if (!feedUrl.endsWith('/')) feedUrl += '/';
      feedUrl += 'feed';
      const rssRes = await fetch(feedUrl);
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const items = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g)];
        blogSummary = 'Blog: ' + items.slice(0, 3).map(m => `${m[1]} (${m[2]})`).join(' | ');
      }
    } catch (e) { /* ignore */ }
  }

  // Telegram integration: auto-detect link, fetch group/channel info, summarize
  let telegramUrl = null;
  // Try CoinGecko
  if (cgData && cgData.links && cgData.links.chat_url && Array.isArray(cgData.links.chat_url)) {
    const tgLink = cgData.links.chat_url.find((u: string) => u && u.includes('t.me/'));
    if (tgLink) telegramUrl = tgLink;
  }
  // Try IGDB websites
  if (!telegramUrl && igdbData && igdbData.websites && Array.isArray(igdbData.websites)) {
    const tg = igdbData.websites.find((w: any) => typeof w.url === 'string' && w.url.includes('t.me/'));
    if (tg) telegramUrl = tg.url;
  }
  // Fetch Telegram group/channel info (scrape public page)
  if (telegramUrl) {
    try {
      const tgRes = await fetch(telegramUrl);
      if (tgRes.ok) {
        const html = await tgRes.text();
        // Extract member count
        const memberMatch = html.match(/([\d,]+) members/);
        const memberCount = memberMatch ? memberMatch[1] : 'N/A';
        // Extract last 3 messages (very basic)
        const msgMatches = [...html.matchAll(/<div class="tgme_widget_message_text"[^>]*>([\s\S]*?)<\/div>/g)];
        const messages = msgMatches.slice(0, 3).map(m => m[1].replace(/<[^>]+>/g, '').trim());
        telegramSummary = `Telegram: ${memberCount} members. Last 3 messages: ${messages.join(' | ')}`;
      }
    } catch (e) { /* ignore */ }
  }

  // --- Enhanced project and studio description logic ---
  let gameDescription = '';
  if (igdbData && (igdbData.summary || igdbData.storyline)) {
    gameDescription += (igdbData.summary || '') + ' ' + (igdbData.storyline || '');
  }
  if (steamData && steamData.steam_appid) {
    const steamDesc = await fetchSteamDescription(steamData.steam_appid);
    if (steamDesc) gameDescription += ' ' + steamDesc;
  }
  for (const url of homepageUrls) {
    const about = await fetchWebsiteAboutSection(url);
    if (about) { gameDescription += ' ' + about; break; }
  }
  // Studio background
  let studioBackground = '';
  if (igdbData && igdbData.studioAssessment && Array.isArray(igdbData.studioAssessment)) {
    studioBackground = igdbData.studioAssessment.map((s: any) => `${s.companyName}: Developer: ${s.isDeveloper}, Publisher: ${s.isPublisher}, First project: ${s.firstProjectDate}`).join(' | ');
  }

  // AI Summary (Anthropic Claude)
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      // Derive team size and funding info if possible
      let teamSize = 'unknown';
      let funding = 'unknown';
      if (igdbData && igdbData.involved_companies && Array.isArray(igdbData.involved_companies)) {
        teamSize = igdbData.involved_companies.length.toString();
      }
      if (cgData && cgData.market_data && cgData.market_data.market_cap && cgData.market_data.market_cap.usd) {
        funding = `$${cgData.market_data.market_cap.usd}`;
      }
      // Derive community sentiment (basic: count negative/positive Steam reviews if available)
      let communitySentiment = 'unknown';
      if (steamData && steamData.review_score_desc) {
        communitySentiment = steamData.review_score_desc;
      }
      // Delivery status (basic: check for recent updates or negative comments about updates)
      let deliveryStatus = 'unknown';
      if (steamData && steamData.release_date && steamData.release_date.date) {
        deliveryStatus = `Released: ${steamData.release_date.date}`;
      }
      // Compose AI prompt
      const aiPrompt = `You are an expert game project analyst. Given the following data about a game or Web3 project, write a comprehensive, user-friendly summary for users.\n\n- Provide a detailed, readable description of the game, its genre, and current status (alpha, beta, live, etc.) using all available sources (IGDB, Steam, website, etc.).\n- Provide background on the studio/developer: experience, previous projects, reputation.\n- Summarize community presence (Discord, Twitter, Reddit, etc.).\n- Summarize tokenomics and blockchain integration.\n- Provide a risk score and investment grade.\n- Highlight red flags and positive indicators.\n- Be honest, specific, and clear.\n- IMPORTANT: If data for a category is missing, say 'No data found' or 'Could not verify' rather than 'does not exist.' Only state that something does not exist if you are certain from the data.\n- Do NOT include a 'Key Findings' section.\n\nGame Description:\n${gameDescription}\n\nStudio Background:\n${studioBackground}\n\nData:\n${JSON.stringify({cgData, igdbData, steamData, discordData, etherscanData, solscanData, youtubeData, nftData, preLaunch, devTimeYears, fundingType, tokenomics, steamReviewSummary, githubRepo, githubStats, steamChartsSummary, redditSummary, openseaSummary, magicEdenSummary, crunchbaseSummary, duneSummary, securitySummary, reviewSummary, linkedinSummary, glassdoorSummary, twitterSummary, blogSummary, telegramSummary}, null, 2)}\n`;
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
            { role: 'user', content: aiPrompt }
          ]
        })
      });
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        aiSummary = aiJson.content?.[0]?.text || null;
        // Optionally extract risk score from summary if present
        const riskMatch = aiSummary && aiSummary.match(/risk score\s*[:=\-]?\s*(\d{1,3})/i);
        if (riskMatch) {
          aiRiskScore = parseInt(riskMatch[1], 10);
        }
        sourcesUsed.push('Anthropic');
      } else {
        aiSummary = `Anthropic: ${aiRes.status} ${aiRes.statusText}`;
      }
    }
  } catch (e) {
    aiSummary = 'AI summary failed.';
  }

  // Enhanced Key Findings
  const positives: any[] = [];
  const negatives: any[] = [];
  const redFlags: any[] = [];

  // CoinGecko
  if (cgData && cgData.description && cgData.description.en) {
    positives.push('Has CoinGecko description');
  } else {
    negatives.push('No CoinGecko description found');
  }
  if (cgData && cgData.market_data && cgData.market_data.market_cap && cgData.market_data.market_cap.usd) {
    positives.push('Market cap data available');
  }
  if (cgData && cgData.error) {
    negatives.push('CoinGecko: ' + cgData.error);
  }

  // IGDB
  if (igdbData && igdbData.summary) {
    positives.push('Has IGDB summary');
  } else if (igdbData && !igdbData.error) {
    negatives.push('No IGDB summary found');
  }
  if (igdbData && igdbData.error) {
    negatives.push('IGDB: ' + igdbData.error);
  }

  // Steam
  if (steamData && steamData.name) {
    positives.push('Found on Steam');
  } else if (steamData && steamData.error) {
    negatives.push('Steam: ' + steamData.error);
  }

  // Discord
  if (discordData && discordData.server_name) {
    positives.push('Active Discord community');
  } else if (discordData && (discordData as any).error) {
    negatives.push('Discord: ' + (discordData as any).error);
  }

  // Etherscan
  if (etherscanData && !etherscanData.error) {
    positives.push('Etherscan data available');
  } else if (etherscanData && etherscanData.error) {
    negatives.push('Etherscan: ' + etherscanData.error);
  }

  // Solscan
  if (solscanData && !solscanData.error) {
    positives.push('Solscan data available');
  } else if (solscanData && solscanData.error) {
    negatives.push('Solscan: ' + solscanData.error);
  }

  // YouTube
  if (youtubeData && Array.isArray(youtubeData) && youtubeData.length > 0) {
    positives.push('YouTube videos found');
  } else if (youtubeData && youtubeData.error) {
    negatives.push('YouTube: ' + youtubeData.error);
  }

  // AI Analysis
  if (aiSummary && typeof aiSummary === 'string' && aiSummary.length > 0) {
    positives.push('AI summary available');
  } else if (aiSummary && aiSummary.error) {
    negatives.push('AI: ' + aiSummary.error);
  }

  // Fallback if all are empty
  if (positives.length === 0 && negatives.length === 0 && redFlags.length === 0) {
    negatives.push('No key findings available for this project');
  }

  // If all sources failed, return 404
  if (sourcesUsed.length === 0) {
    return res.status(404).json({ error: 'No data found for this project from any source.' });
  }

  // Research report
  const researchReport = {
    projectName: cgData?.name || igdbData?.name || projectName,
    projectType: 'Web3Game', // Placeholder, real logic needed
    riskScore: aiRiskScore || 50, // Placeholder
    investmentGrade: 'C', // Placeholder
    keyFindings: {
      positives,
      negatives,
      redFlags,
    },
    financialData: {
      marketCap: cgData?.market_data?.market_cap?.usd,
      roninTokenInfo,
    },
    teamAnalysis: {},
    technicalAssessment: {},
    communityHealth: {},
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
  };
  res.json(researchReport);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 