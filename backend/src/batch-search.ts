// Batch Search System - Single AI Call for All Data Points
// This is much more efficient than the current multi-call orchestration approach

import Anthropic from '@anthropic-ai/sdk';
import { GameStoreAPIService } from './game-store-apis';
import { TeamDataCollectionService } from './team-data-collection';
import { steamPlayerCountService } from './steam-player-count';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BatchSearchResult {
  projectName: string;
  projectType: 'Web3Game' | 'TraditionalGame' | 'Publisher' | 'Platform';
  
  // Basic Project Information
  officialWebsite?: string;
  projectDescription?: string;
  launchDate?: string;
  studioCompany?: string;
  platforms?: string[];
  
  // Financial Data
  marketCap?: string;
  tokenPrice?: string;
  tokenSymbol?: string;
  contractAddress?: string;
  totalSupply?: string;
  circulatingSupply?: string;
  volume24h?: string;
  blockchainNetwork?: string;
  
  // Team Information
  studioBackground?: string;
  teamSize?: string;
  keyPeople?: string[];
  linkedInProfiles?: string[];
  companyLocation?: string;
  fundingInfo?: string;
  companyWebsite?: string;
  
  // Technical Information
  githubRepository?: string;
  technologyStack?: string;
  smartContracts?: string[];
  securityAudits?: string[];
  documentation?: string;
  apiDocumentation?: string;
  developmentActivity?: string;
  
  // Community & Social
  twitterHandle?: string;
  twitterFollowers?: string;
  discordServer?: string;
  discordMembers?: string;
  redditCommunity?: string;
  redditMembers?: string;
  telegramChannel?: string;
  youtubeChannel?: string;
  communitySentiment?: string;
  
  // Game/Product Information
  gameGenre?: string;
  gameDescription?: string;
  downloadLinks?: string[];
  platformAvailability?: string[];
  userReviews?: string;
  playerCount?: string;
  gameFeatures?: string[];
  screenshotsVideos?: string[];
  
  // News & Media
  recentNews?: string[];
  pressCoverage?: string[];
  partnerships?: string[];
  updates?: string[];
  roadmap?: string;
  
  // Confidence and Quality
  confidence: number;
  dataQuality: 'high' | 'medium' | 'low';
  sourcesFound: number;
  totalDataPoints: number;
}

export async function conductBatchSearch(projectName: string): Promise<BatchSearchResult> {
  console.log(`🚀 Starting batch search for: ${projectName}`);
  
  // First, try to get game store data to enhance the AI search
  let gameStoreData = null;
  try {
          console.log(`[INFO] Fetching game store data for enhanced search...`);
    const gameStoreService = GameStoreAPIService.getInstance();
    const gameStoreResults = await gameStoreService.searchGame(projectName);
    
    if (gameStoreResults.length > 0) {
      gameStoreData = gameStoreService.extractGameInfo(gameStoreResults);
      console.log(`[SUCCESS] Found game store data: ${gameStoreResults.length} results from ${gameStoreResults.map(r => r.platform).join(', ')}`);
      console.log(`[INFO] Game description: ${gameStoreData.gameDescription || 'Not found'}`);
      console.log(`[INFO] Platform availability: ${gameStoreData.platformAvailability || 'Not found'}`);
      } else {
    console.log(`[WARNING] No game store data found for: ${projectName}`);
  }
} catch (error) {
  console.log(`[WARNING] Game store data fetch failed: ${error}`);
}

// For Web3 games, try to get game description from official website
if (!gameStoreData || !gameStoreData.gameDescription) {
  try {
    console.log(`[INFO] Trying to get game description from official website for: ${projectName}`);
    
    // This will be enhanced with website scraping in the AI search
    // For now, we'll let the AI search handle it
  } catch (error) {
    console.log(`[WARNING] Website game description fetch failed: ${error}`);
  }
}

  // Team data will be collected after we get the official website from AI search
  let teamData: any = null;
  
  // Community data will be collected to enhance AI results
  let redditData: any = null;
  let discordData: any = null;
  let twitterData: any = null;
  
  // Collect community data to enhance AI search
  try {
    console.log(`[INFO] Collecting community data for: ${projectName}`);
    
    // Try to find Reddit community
    const redditVariations = [
      projectName.toLowerCase().replace(/\s+/g, ''),
      projectName.toLowerCase().replace(/\s+/g, '') + 'game',
      projectName.toLowerCase().replace(/\s+/g, '') + 'gaming',
      projectName.toLowerCase().replace(/\s+/g, '') + 'crypto',
      projectName.toLowerCase().replace(/\s+/g, '') + 'token'
    ];
    
    for (const variation of redditVariations) {
      try {
        const response = await fetch(`https://www.reddit.com/r/${variation}/about.json`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.subscribers) {
            redditData = {
              subreddit: variation,
              subscribers: data.data.subscribers,
              title: data.data.title,
              description: data.data.public_description,
              url: `https://reddit.com/r/${variation}`,
              success: true
            };
            console.log(`[SUCCESS] Found Reddit community: r/${variation} with ${data.data.subscribers.toLocaleString()} members`);
            break;
          }
        }
      } catch (error) {
        // Continue to next variation
        continue;
      }
    }
    
    if (!redditData) {
      console.log(`[WARNING] No Reddit community found for: ${projectName}`);
    }
  } catch (error) {
    console.log(`[WARNING] Community data collection failed: ${error}`);
  }
  
  // Enhance the prompt with game store data if available
  let enhancedPrompt = `You are a comprehensive research assistant for analyzing Web3 and gaming projects.`;
  
  if (gameStoreData) {
    enhancedPrompt += `\n\n**ENHANCED GAME STORE DATA AVAILABLE:**
    - Game Genre: ${gameStoreData.gameGenre || 'Not found'}
    - Game Description: ${gameStoreData.gameDescription || 'Not found'}
    - Platform Availability: ${gameStoreData.platformAvailability || 'Not found'}
    - Game Features: ${gameStoreData.gameFeatures || 'Not found'}
    - Download Links: ${gameStoreData.downloadLinks?.join(', ') || 'Not found'}
    - Game Rating: ${gameStoreData.gameRating || 'Not found'}
    - Game Price: ${gameStoreData.gamePrice || 'Not found'}
    - Developer: ${gameStoreData.gameDeveloper || 'Not found'}
    - Publisher: ${gameStoreData.gamePublisher || 'Not found'}
    - Release Date: ${gameStoreData.gameReleaseDate || 'Not found'}
    
    Please use this verified game store data in your research and supplement it with additional information.`;
  }

  if (teamData && teamData.success) {
    enhancedPrompt += `\n\n**ENHANCED TEAM DATA AVAILABLE:**
    - Studio Background: ${teamData.studioBackground || 'Not found'}
    - Team Size: ${teamData.teamSize || 'Not found'}
  }

  if (redditData && redditData.success) {
    enhancedPrompt += `\n\n**ENHANCED COMMUNITY DATA AVAILABLE:**
    - Reddit Community: r/${redditData.subreddit} (${redditData.subscribers.toLocaleString()} members)
    - Reddit Title: ${redditData.title || 'Not found'}
    - Reddit Description: ${redditData.description || 'Not found'}
    - Reddit URL: ${redditData.url || 'Not found'}
    
    Please use this verified Reddit data in your research and supplement it with additional information.`;
  }

  if (teamData && teamData.success) {
    enhancedPrompt += `\n\n**ENHANCED TEAM DATA AVAILABLE:**
    - Key People: ${teamData.keyPeople?.join(', ') || 'Not found'}
    - Company Location: ${teamData.companyLocation || 'Not found'}
    - Funding Info: ${teamData.fundingInfo || 'Not found'}
    - Company Website: ${teamData.companyWebsite || 'Not found'}
    - LinkedIn Profiles: ${teamData.linkedInProfiles?.join(', ') || 'Not found'}
    
    Please use this verified team data in your research and supplement it with additional information.`;
  }
  
  enhancedPrompt += `
  
  I need you to research "${projectName}" and provide ALL the following information in a single comprehensive search. 
  Please search the web thoroughly and provide as much detail as possible for each category.
  
  **RESEARCH REQUIREMENTS:**
  - Search for official websites, documentation, whitepapers, social media, and news sources
  - Look for financial data, team information, technical details, and community metrics
  - Find game/product information, download links, and platform availability
  - Gather recent news, partnerships, and development updates
  
  **RESPONSE FORMAT:**
  Please respond with a JSON object containing all the following fields. If you cannot find information for a field, use null.
  
  {
    "projectName": "${projectName}",
    "projectType": "Web3Game|TraditionalGame|Publisher|Platform",
    "officialWebsite": "URL",
    "projectDescription": "Brief description",
    "launchDate": "Date",
    "studioCompany": "Company name",
    "platforms": ["PC", "Mobile", "Web"],
    "marketCap": "Market cap value",
    "tokenPrice": "Current price",
    "tokenSymbol": "Token symbol",
    "contractAddress": "Contract address",
    "totalSupply": "Total supply",
    "circulatingSupply": "Circulating supply", 
    "volume24h": "24h volume",
    "blockchainNetwork": "Network name",
    "studioBackground": "Company background",
    "teamSize": "Number of employees",
    "keyPeople": ["Name 1", "Name 2"],
    "linkedInProfiles": ["LinkedIn URL 1", "LinkedIn URL 2"],
    "companyLocation": "Location",
    "fundingInfo": "Funding details",
    "companyWebsite": "Company website",
    "githubRepository": "GitHub URL",
    "technologyStack": "Technologies used",
    "smartContracts": ["Contract 1", "Contract 2"],
    "securityAudits": ["Audit 1", "Audit 2"],
    "documentation": "Documentation URL",
    "apiDocumentation": "API docs URL",
    "developmentActivity": "Recent activity",
    "twitterHandle": "@handle",
    "twitterFollowers": "Follower count",
    "discordServer": "Discord invite",
    "discordMembers": "Member count",
    "redditCommunity": "r/community",
    "redditMembers": "Member count",
    "telegramChannel": "Telegram link",
    "youtubeChannel": "YouTube URL",
    "communitySentiment": "Sentiment analysis",
    "gameGenre": "Game genre",
    "gameDescription": "Game description",
    "downloadLinks": ["Link 1", "Link 2"],
    "platformAvailability": ["Steam", "Epic", "Mobile"],
    "userReviews": "Review summary",
    "playerCount": "Player count",
    "gameFeatures": ["Feature 1", "Feature 2"],
    "screenshotsVideos": ["Media URL 1", "Media URL 2"],
    "recentNews": ["News 1", "News 2"],
    "pressCoverage": ["Coverage 1", "Coverage 2"],
    "partnerships": ["Partnership 1", "Partnership 2"],
    "updates": ["Update 1", "Update 2"],
    "roadmap": "Roadmap URL",
    "confidence": 85,
    "dataQuality": "high|medium|low",
    "sourcesFound": 15,
    "totalDataPoints": 52
  }
  
  **IMPORTANT:**
  - Only include information you can verify from reliable sources
  - For financial data, provide current values
  - For social media, include actual follower/member counts
  - For download links, provide direct URLs where possible
  - Set confidence based on data completeness (0-100)
  - Set dataQuality based on source reliability
  - Count actual sources found and data points collected
  
  Please conduct a thorough search and provide the most comprehensive analysis possible.`;

    const prompt = enhancedPrompt;

  try {
    console.log('🔍 Conducting comprehensive batch search...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      system: 'You are a professional research assistant specializing in Web3 and gaming project analysis. Provide accurate, comprehensive data from reliable sources.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log('[SUCCESS] Batch search completed');
    
    // Parse the JSON response
    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]) as BatchSearchResult;
    
    // Now collect team data (always try, with or without official website)
    try {
      console.log(`[INFO] Fetching team data for: ${projectName}`);
      const teamService = TeamDataCollectionService.getInstance();
      teamData = await teamService.collectTeamData(projectName, result.officialWebsite);
      
      if (teamData.success) {
        console.log(`[SUCCESS] Found team data from ${teamData.sources.length} sources`);
        console.log(`[INFO] Company website found: ${teamData.companyWebsite || 'Not found'}`);
      } else {
        console.log(`[WARNING] No team data found for: ${projectName}`);
      }
    } catch (error) {
      console.log(`[WARNING] Team data fetch failed: ${error}`);
    }
    
    // Merge game store data with AI results for better accuracy
    if (gameStoreData) {
      console.log(`[INFO] Merging game store data with AI results...`);
      
      // Enhance game-related fields with verified game store data
      if (gameStoreData.gameGenre && !result.gameGenre) {
        result.gameGenre = gameStoreData.gameGenre;
      }
      if (gameStoreData.gameDescription && !result.gameDescription) {
        result.gameDescription = gameStoreData.gameDescription;
      }
      if (gameStoreData.platformAvailability && !result.platformAvailability) {
        result.platformAvailability = gameStoreData.platformAvailability.split(', ');
      }
      if (gameStoreData.gameFeatures && !result.gameFeatures) {
        result.gameFeatures = gameStoreData.gameFeatures.split(', ');
      }
      if (gameStoreData.downloadLinks && !result.downloadLinks) {
        result.downloadLinks = gameStoreData.downloadLinks;
      }
      if (gameStoreData.gameRating && !result.userReviews) {
        result.userReviews = `Rating: ${gameStoreData.gameRating}`;
      }
      if (gameStoreData.gamePrice && !result.playerCount) {
        result.playerCount = `Price: ${gameStoreData.gamePrice}`;
      }
      if (gameStoreData.gameDeveloper && !result.studioCompany) {
        result.studioCompany = gameStoreData.gameDeveloper;
      }
      if (gameStoreData.gamePublisher && !result.studioBackground) {
        result.studioBackground = `Publisher: ${gameStoreData.gamePublisher}`;
      }
      if (gameStoreData.gameReleaseDate && !result.launchDate) {
        result.launchDate = gameStoreData.gameReleaseDate;
      }
      
      // Increase confidence and data points due to verified game store data
      result.confidence = Math.min(100, result.confidence + 10);
      result.totalDataPoints += gameStoreData.downloadLinks?.length || 0;
      result.sourcesFound += 1; // Game store APIs count as additional sources
      
      console.log(`[SUCCESS] Enhanced result with game store data`);
    }

    // Steam Player Count Integration: Get real-time player count for Steam games
    try {
      console.log(`[INFO] Fetching Steam player count for: ${projectName}`);
      const steamPlayerData = await steamPlayerCountService.getPlayerCount(projectName);
      
      if (steamPlayerData.success && steamPlayerData.currentPlayers > 0) {
        console.log(`[INFO] Merging Steam player count with AI results...`);
        
        // Update player count with real Steam data
        result.playerCount = `${steamPlayerData.currentPlayers.toLocaleString()} current players (Steam)`;
        
        // Increase confidence and data points due to verified Steam data
        result.confidence = Math.min(100, result.confidence + 3);
        result.totalDataPoints += 1;
        result.sourcesFound += 1; // Steam API counts as additional source
        
        console.log(`[SUCCESS] Enhanced result with Steam player count: ${steamPlayerData.currentPlayers.toLocaleString()} players`);
      } else if (steamPlayerData.error) {
        console.log(`[WARNING] Steam player count not available: ${steamPlayerData.error}`);
      } else {
        console.log(`[WARNING] No Steam player count found for: ${projectName}`);
      }
    } catch (error) {
      console.log(`[ERROR] Steam player count fetch failed: ${error}`);
    }

    // Web3 Game Description Fallback: If no game description found, try official website
    if (!result.gameDescription) {
      try {
        console.log(`[INFO] Attempting Web3 game description fallback for: ${projectName}`);
        const gameStoreService = GameStoreAPIService.getInstance();
        const web3Description = await gameStoreService.getWeb3GameDescription(projectName, result.officialWebsite);
        
        if (web3Description) {
          result.gameDescription = web3Description;
          result.confidence = Math.min(100, result.confidence + 2);
          result.totalDataPoints += 1;
          result.sourcesFound += 1;
          console.log(`[SUCCESS] Found Web3 game description: ${web3Description.substring(0, 100)}...`);
        } else {
          console.log(`[WARNING] No Web3 game description found for: ${projectName}`);
        }
      } catch (error) {
        console.log(`[ERROR] Web3 game description fallback failed: ${error}`);
      }
    }

    // Merge team data with AI results for better accuracy
    if (teamData && teamData.success) {
      console.log(`[INFO] Merging team data with AI results...`);

      // Enhance team-related fields with verified team data
      if (teamData.studioBackground && !result.studioBackground) {
        result.studioBackground = teamData.studioBackground;
      }
      if (teamData.teamSize && !result.teamSize) {
        result.teamSize = teamData.teamSize;
      }
      if (teamData.keyPeople && !result.keyPeople) {
        result.keyPeople = teamData.keyPeople;
      }
      if (teamData.companyLocation && !result.companyLocation) {
        result.companyLocation = teamData.companyLocation;
      }
      if (teamData.fundingInfo && !result.fundingInfo) {
        result.fundingInfo = teamData.fundingInfo;
      }
      if (teamData.companyWebsite && !result.companyWebsite) {
        result.companyWebsite = teamData.companyWebsite;
      }
      if (teamData.linkedInProfiles && !result.linkedInProfiles) {
        result.linkedInProfiles = teamData.linkedInProfiles;
      }

      // Increase confidence and data points due to verified team data
      result.confidence = Math.min(100, result.confidence + 5);
      result.totalDataPoints += teamData.sources.length;
      result.sourcesFound += teamData.sources.length; // Team data sources count as additional sources

      console.log(`[SUCCESS] Enhanced result with team data`);
    }

    // Merge community data with AI results for better accuracy
    if (redditData && redditData.success) {
      console.log(`[INFO] Merging community data with AI results...`);

      // Enhance community-related fields with verified Reddit data
      if (redditData.subreddit && !result.redditCommunity) {
        result.redditCommunity = `r/${redditData.subreddit}`;
      }
      if (redditData.subscribers && !result.redditMembers) {
        result.redditMembers = redditData.subscribers.toString();
      }
      if (redditData.url && !result.redditCommunity) {
        result.redditCommunity = redditData.url;
      }

      // Increase confidence and data points due to verified community data
      result.confidence = Math.min(100, result.confidence + 3);
      result.totalDataPoints += 1;
      result.sourcesFound += 1; // Reddit API counts as additional source

      console.log(`[SUCCESS] Enhanced result with community data`);
    }
    
    console.log(`[INFO] Found ${result.totalDataPoints} data points with ${result.sourcesFound} sources`);
    return result;
      }
    }
    
    throw new Error('Failed to parse JSON response from AI');
    
  } catch (error) {
    console.error('❌ Batch search failed:', error);
    throw error;
  }
}

// Helper function to convert batch search result to our standard format
export function convertBatchResultToStandardFormat(batchResult: BatchSearchResult) {
  return {
    projectName: batchResult.projectName,
    projectType: batchResult.projectType,
    keyFindings: {
      positives: [],
      negatives: [],
      redFlags: []
    },
    financialData: {
      marketCap: batchResult.marketCap,
      tokenPrice: batchResult.tokenPrice,
      tokenSymbol: batchResult.tokenSymbol,
      contractAddress: batchResult.contractAddress,
      totalSupply: batchResult.totalSupply,
      circulatingSupply: batchResult.circulatingSupply,
      volume24h: batchResult.volume24h,
      blockchainNetwork: batchResult.blockchainNetwork
    },
    teamAnalysis: {
      studioBackground: batchResult.studioBackground,
      teamSize: batchResult.teamSize,
      keyPeople: batchResult.keyPeople,
      linkedInProfiles: batchResult.linkedInProfiles,
      companyLocation: batchResult.companyLocation,
      fundingInfo: batchResult.fundingInfo,
      companyWebsite: batchResult.companyWebsite
    },
    technicalAssessment: {
      githubRepository: batchResult.githubRepository,
      technologyStack: batchResult.technologyStack,
      smartContracts: batchResult.smartContracts,
      securityAudits: batchResult.securityAudits,
      documentation: batchResult.documentation,
      apiDocumentation: batchResult.apiDocumentation,
      developmentActivity: batchResult.developmentActivity
    },
    communityHealth: {
      twitterHandle: batchResult.twitterHandle,
      twitterFollowers: batchResult.twitterFollowers,
      discordServer: batchResult.discordServer,
      discordMembers: batchResult.discordMembers,
      redditCommunity: batchResult.redditCommunity,
      redditMembers: batchResult.redditMembers,
      telegramChannel: batchResult.telegramChannel,
      youtubeChannel: batchResult.youtubeChannel,
      communitySentiment: batchResult.communitySentiment
    },
    confidence: {
      totalScore: batchResult.confidence,
      grade: batchResult.confidence >= 80 ? 'A' : batchResult.confidence >= 60 ? 'B' : 'C',
      confidence: batchResult.confidence,
      passesThreshold: batchResult.confidence >= 70,
      gatesPassed: Math.floor(batchResult.confidence / 10),
      gatesFailed: 10 - Math.floor(batchResult.confidence / 10),
      breakdown: {
        dataCompleteness: batchResult.confidence,
        sourceReliability: batchResult.dataQuality === 'high' ? 90 : batchResult.dataQuality === 'medium' ? 70 : 50,
        dataFreshness: 80,
        coverage: batchResult.confidence
      }
    },
    discoveredUrls: {
      officialWebsite: batchResult.officialWebsite,
      githubRepository: batchResult.githubRepository,
      documentation: batchResult.documentation,
      discordServer: batchResult.discordServer,
      twitterHandle: batchResult.twitterHandle,
      redditCommunity: batchResult.redditCommunity
    },
    totalDataPoints: batchResult.totalDataPoints,
    gameData: {
      genre: batchResult.gameGenre,
      description: batchResult.gameDescription,
      downloadLinks: batchResult.downloadLinks?.map(link => ({
        platform: 'Website',
        url: link,
        icon: '🌐'
      })) || [],
      platformAvailability: batchResult.platformAvailability,
      userReviews: batchResult.userReviews,
      playerCount: batchResult.playerCount,
      features: batchResult.gameFeatures,
      screenshotsVideos: batchResult.screenshotsVideos
    }
  };
}
