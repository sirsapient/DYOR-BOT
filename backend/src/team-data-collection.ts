// Team Data Collection Functions
// Implements comprehensive team information gathering for Web3 and gaming projects

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface TeamDataResult {
  studioBackground?: string;
  teamSize?: string;
  keyPeople?: string[];
  linkedInProfiles?: string[];
  companyLocation?: string;
  fundingInfo?: string;
  companyWebsite?: string;
  success: boolean;
  sources: string[];
  error?: string;
}

interface CompanyInfo {
  name: string;
  description?: string;
  founded?: string;
  location?: string;
  size?: string;
  website?: string;
  linkedin?: string;
  funding?: string;
}

export class TeamDataCollectionService {
  private static instance: TeamDataCollectionService;
  private cache: Map<string, { data: TeamDataResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static getInstance(): TeamDataCollectionService {
    if (!TeamDataCollectionService.instance) {
      TeamDataCollectionService.instance = new TeamDataCollectionService();
    }
    return TeamDataCollectionService.instance;
  }

  async collectTeamData(projectName: string, officialWebsite?: string): Promise<TeamDataResult> {
    const cacheKey = `team_data_${projectName.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📋 Using cached team data for: ${projectName}`);
      return cached.data;
    }

    console.log(`👥 Collecting team data for: ${projectName}`);
    
    const result: TeamDataResult = {
      success: false,
      sources: []
    };

    try {
      // Collect team data from multiple sources
      const [companyInfo, linkedInData, websiteData] = await Promise.allSettled([
        this.fetchCompanyInfo(projectName),
        this.fetchLinkedInData(projectName),
        this.fetchWebsiteTeamData(officialWebsite || '', projectName)
      ]);

      // Process company information
      if (companyInfo.status === 'fulfilled' && companyInfo.value) {
        const company = companyInfo.value;
        result.studioBackground = company.description;
        result.teamSize = company.size;
        result.companyLocation = company.location;
        result.companyWebsite = company.website;
        result.fundingInfo = company.funding;
        result.sources.push('Company APIs');
      }

      // Process LinkedIn data
      if (linkedInData.status === 'fulfilled' && linkedInData.value) {
        const linkedIn = linkedInData.value;
        result.keyPeople = linkedIn.keyPeople;
        result.linkedInProfiles = linkedIn.profiles;
        result.sources.push('LinkedIn');
      }

      // Process website data
      if (websiteData.status === 'fulfilled' && websiteData.value) {
        const website = websiteData.value;
        if (!result.studioBackground && website.studioBackground) {
          result.studioBackground = website.studioBackground;
        }
        if (!result.keyPeople && website.keyPeople) {
          result.keyPeople = website.keyPeople;
        }
        if (!result.companyLocation && website.companyLocation) {
          result.companyLocation = website.companyLocation;
        }
        if (!result.teamSize && website.teamSize) {
          result.teamSize = website.teamSize;
        }
        result.sources.push('Website Scraping');
      }

      // Fallback: Add basic team information based on known data
      if (!result.studioBackground) {
        if (projectName.toLowerCase().includes('axie')) {
          result.studioBackground = 'Sky Mavis is a Vietnamese game studio founded in 2018, specializing in blockchain gaming and NFT technology. The company is known for developing Axie Infinity, one of the most successful play-to-earn games.';
          result.teamSize = '100+ employees';
          result.companyLocation = 'Vietnam';
          result.keyPeople = ['Trung Nguyen (CEO)', 'Aleksander Larsen (COO)'];
          result.sources.push('Known Data');
        } else if (projectName.toLowerCase().includes('decentraland')) {
          result.studioBackground = 'Decentraland Foundation is a non-profit organization that supports the development of the Decentraland virtual world platform.';
          result.companyLocation = 'Global';
          result.sources.push('Known Data');
        } else if (projectName.toLowerCase().includes('sandbox')) {
          result.studioBackground = 'The Sandbox is developed by Animoca Brands, a Hong Kong-based company specializing in blockchain gaming and digital entertainment.';
          result.companyLocation = 'Hong Kong';
          result.sources.push('Known Data');
        }
      }

      // Set success if we found any data
      if (result.sources.length > 0) {
        result.success = true;
      }

      // Cache results
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      console.log(`✅ Found team data from ${result.sources.length} sources for: ${projectName}`);
      return result;

    } catch (error) {
      console.error(`❌ Team data collection failed for "${projectName}":`, error);
      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  private async fetchCompanyInfo(projectName: string): Promise<CompanyInfo | null> {
    try {
      console.log(`🏢 Fetching company info for: ${projectName}`);
      
      // Enhanced company website discovery
      const companyWebsite = await this.discoverCompanyWebsite(projectName);
      
      // Try to find company information using search
      const searchQuery = `${projectName} company about us team`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Search API failed: ${response.status}`);
      }

      const data = await response.json() as any;
      
      // Extract company information from search results
      if (data.Abstract) {
        return {
          name: projectName,
          description: data.Abstract,
          website: companyWebsite || data.AbstractURL
        };
      }

      // If no abstract, return basic info with discovered website
      if (companyWebsite) {
        return {
          name: projectName,
          website: companyWebsite
        };
      }

      return null;

    } catch (error) {
      console.log(`⚠️ Company info fetch failed: ${error}`);
      return null;
    }
  }

  private async discoverCompanyWebsite(projectName: string): Promise<string | null> {
    try {
      console.log(`🌐 Discovering company website for: ${projectName}`);
      
      // Clean project name for URL generation
      const cleanName = projectName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
      
      // Common URL patterns to test
      const urlPatterns = [
        `https://${cleanName}.com`,
        `https://www.${cleanName}.com`,
        `https://${cleanName}.org`,
        `https://${cleanName}.io`,
        `https://${cleanName}.app`,
        `https://${cleanName}.xyz`,
        `https://${cleanName}.net`,
        `https://${cleanName}.co`,
        `https://${cleanName}.ai`,
        `https://${cleanName}.game`,
        `https://${cleanName}.games`
      ];

      // Add specific patterns for known projects
      if (projectName.toLowerCase().includes('axie')) {
        urlPatterns.unshift('https://axieinfinity.com', 'https://www.axieinfinity.com');
      } else if (projectName.toLowerCase().includes('decentraland')) {
        urlPatterns.unshift('https://decentraland.org', 'https://www.decentraland.org');
      } else if (projectName.toLowerCase().includes('sandbox')) {
        urlPatterns.unshift('https://sandbox.game', 'https://www.sandbox.game');
      }

      // Test each URL pattern
      for (const url of urlPatterns) {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            // timeout: 5000 // Removed for compatibility
          });

          if (response.ok) {
            console.log(`✅ Found company website: ${url}`);
            return url;
          }
        } catch (error) {
          // URL doesn't exist or is unreachable, continue to next
          continue;
        }
      }

      // If direct URL testing fails, try search-based discovery
      console.log(`🔍 Trying search-based website discovery for: ${projectName}`);
      const searchQuery = `${projectName} official website`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data.AbstractURL && this.isValidCompanyWebsite(data.AbstractURL, projectName)) {
          console.log(`✅ Found company website via search: ${data.AbstractURL}`);
          return data.AbstractURL;
        }
      }

      console.log(`❌ No company website found for: ${projectName}`);
      return null;

    } catch (error) {
      console.log(`⚠️ Company website discovery failed: ${error}`);
      return null;
    }
  }

  private isValidCompanyWebsite(url: string, projectName: string): boolean {
    // Check if URL looks like a valid company website
    const cleanName = projectName.toLowerCase().replace(/\s+/g, '');
    
    return url.startsWith('http') && 
           !url.includes('google.com') &&
           !url.includes('wikipedia.org') &&
           !url.includes('youtube.com') &&
           !url.includes('twitter.com') &&
           !url.includes('facebook.com') &&
           !url.includes('linkedin.com') &&
           !url.includes('reddit.com') &&
           !url.includes('medium.com') &&
           !url.includes('github.com') &&
           (url.includes(cleanName) || url.includes(projectName.toLowerCase()));
  }

  private async fetchLinkedInData(projectName: string): Promise<{ keyPeople: string[]; profiles: string[] } | null> {
    try {
      console.log(`💼 Fetching LinkedIn data for: ${projectName}`);
      
      // Try to find LinkedIn company page
      const searchQuery = `${projectName} LinkedIn company`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn search failed: ${response.status}`);
      }

      const data = await response.json() as any;
      
      // Extract LinkedIn information
      const linkedInUrl = data.AbstractURL?.includes('linkedin.com') ? data.AbstractURL : null;
      
      if (linkedInUrl) {
        return {
          keyPeople: [], // Would need LinkedIn API access for detailed data
          profiles: [linkedInUrl]
        };
      }

      return null;

    } catch (error) {
      console.log(`⚠️ LinkedIn data fetch failed: ${error}`);
      return null;
    }
  }

  private async fetchWebsiteTeamData(websiteUrl: string, projectName: string): Promise<{
    studioBackground?: string;
    keyPeople?: string[];
    companyLocation?: string;
    teamSize?: string;
  } | null> {
    try {
      if (!websiteUrl || websiteUrl === 'Not found') {
        return null;
      }

      console.log(`🌐 Scraping team data from website: ${websiteUrl}`);
      
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        }
      });

      if (!response.ok) {
        throw new Error(`Website fetch failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const result: {
        studioBackground?: string;
        keyPeople?: string[];
        companyLocation?: string;
        teamSize?: string;
      } = {};

      // Extract studio background from about us, company, or team pages
      const aboutSelectors = [
        'p:contains("about"), p:contains("About")',
        '.about p, .company p, .team p',
        '[class*="about"] p, [class*="company"] p, [class*="team"] p',
        'div:contains("About"), div:contains("Company"), div:contains("Team")'
      ];

      for (const selector of aboutSelectors) {
        const text = $(selector).first().text().trim();
        if (text && text.length > 50 && text.length < 500) {
          result.studioBackground = text;
          break;
        }
      }

      // Extract key people from team or about sections
      const teamSelectors = [
        'h1:contains("Team"), h2:contains("Team"), h3:contains("Team")',
        'h1:contains("About"), h2:contains("About"), h3:contains("About")',
        '.team h1, .team h2, .team h3',
        '.about h1, .about h2, .about h3'
      ];

      const keyPeople: string[] = [];
      for (const selector of teamSelectors) {
        $(selector).each((_, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 3 && text.length < 100) {
            // Look for names (capitalized words)
            const nameMatch = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/);
            if (nameMatch) {
              keyPeople.push(nameMatch[0]);
            }
          }
        });
      }

      if (keyPeople.length > 0) {
        result.keyPeople = keyPeople.slice(0, 5); // Limit to 5 key people
      }

      // Extract location information
      const locationSelectors = [
        'p:contains("based"), p:contains("Located"), p:contains("headquarters")',
        '.location, .address, .contact',
        '[class*="location"], [class*="address"], [class*="contact"]'
      ];

      for (const selector of locationSelectors) {
        const text = $(selector).first().text().trim();
        if (text && text.length > 5 && text.length < 100) {
          result.companyLocation = text;
          break;
        }
      }

      // Extract team size information
      const sizeSelectors = [
        'p:contains("employees"), p:contains("team"), p:contains("staff")',
        '.team-size, .employees, .staff',
        '[class*="team"], [class*="employee"], [class*="staff"]'
      ];

      for (const selector of sizeSelectors) {
        const text = $(selector).first().text().trim();
        if (text && text.length > 5 && text.length < 100) {
          const sizeMatch = text.match(/(\d+)\+?\s*(employees|team|staff)/i);
          if (sizeMatch) {
            result.teamSize = `${sizeMatch[1]}+ employees`;
            break;
          }
        }
      }

      return Object.keys(result).length > 0 ? result : null;

    } catch (error) {
      console.log(`⚠️ Website team data fetch failed: ${error}`);
      return null;
    }
  }
}
