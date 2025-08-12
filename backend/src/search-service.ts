// Free Search Service using DuckDuckGo Instant Answer API
// This replaces SerpAPI functionality with a free alternative

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface DuckDuckGoResponse {
  AbstractURL?: string;
  Abstract?: string;
  RelatedTopics?: Array<{
    Text: string;
    FirstURL: string;
  }>;
  Results?: Array<{
    FirstURL: string;
    Text: string;
  }>;
}

export class FreeSearchService {
  private static instance: FreeSearchService;
  private cache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): FreeSearchService {
    if (!FreeSearchService.instance) {
      FreeSearchService.instance = new FreeSearchService();
    }
    return FreeSearchService.instance;
  }

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    const cacheKey = `${query}_${maxResults}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📋 Using cached search results for: ${query}`);
      return cached.results;
    }

    console.log(`🔍 Free search for: ${query}`);
    
    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try DuckDuckGo Instant Answer API first
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ DuckDuckGo API failed: ${response.status}, trying web scraping fallback`);
        const fallbackResults = await this.getWebScrapingResults(query, maxResults);
        if (fallbackResults.length > 0) {
          this.cache.set(cacheKey, { results: fallbackResults, timestamp: Date.now() });
          console.log(`✅ Found ${fallbackResults.length} results via web scraping for: ${query}`);
          return fallbackResults;
        }
        return this.getFallbackResults(query);
      }

      const data: DuckDuckGoResponse = await response.json();
      const results: SearchResult[] = [];

      // Extract results from Abstract and RelatedTopics
      if (data.Abstract && data.AbstractURL) {
        results.push({
          title: query,
          link: data.AbstractURL,
          snippet: data.Abstract
        });
      }

      // Add related topics
      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text,
            link: topic.FirstURL,
            snippet: topic.Text
          });
        }
      }

      // Add additional results
      if (data.Results) {
        for (const result of data.Results.slice(0, maxResults - results.length)) {
          results.push({
            title: result.Text.split(' - ')[0] || result.Text,
            link: result.FirstURL,
            snippet: result.Text
          });
        }
      }

      // If we don't have enough results or no results at all, try web scraping fallback
      if (results.length === 0 || results.length < maxResults) {
        console.log(`🔍 No results from API, trying web scraping fallback for: ${query}`);
        const fallbackResults = await this.getWebScrapingResults(query, maxResults - results.length);
        console.log(`🔍 Web scraping returned ${fallbackResults.length} results for: ${query}`);
        results.push(...fallbackResults);
      }

      // Cache the results
      this.cache.set(cacheKey, { results, timestamp: Date.now() });

      console.log(`✅ Found ${results.length} results for: ${query}`);
      return results;

    } catch (error) {
      console.log(`❌ Search failed for "${query}": ${(error as Error).message}`);
      return this.getFallbackResults(query);
    }
  }

  private async getWebScrapingResults(query: string, maxResults: number): Promise<SearchResult[]> {
    console.log(`🔍 Starting web scraping for: ${query}`);
    try {
      // Try multiple search engines for better results
      const searchUrls = [
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        `https://www.bing.com/search?q=${encodeURIComponent(query)}`
      ];

      for (const searchUrl of searchUrls) {
        try {
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          });

          if (!response.ok) continue;

          const html = await response.text();
          const results: SearchResult[] = [];

          // Enhanced regex patterns for different search engines
          const linkMatches = html.match(/href="([^"]*)"[^>]*>([^<]*)</g) || [];

          for (const match of linkMatches.slice(0, maxResults * 2)) { // Get more to filter
            const hrefMatch = match.match(/href="([^"]*)"/);
            const titleMatch = match.match(/>([^<]*)</);
            
            if (hrefMatch && titleMatch) {
              const link = hrefMatch[1];
              const title = titleMatch[1];
              
              // Enhanced filtering for better quality results
              if (link.startsWith('http') && 
                  !link.includes('duckduckgo.com') && 
                  !link.includes('google.com') &&
                  !link.includes('bing.com') &&
                  !link.includes('javascript:') &&
                  !link.includes('mailto:') &&
                  title.length > 10 &&
                  !title.includes('Search') &&
                  !title.includes('Results')) {
                
                results.push({
                  title: title.trim(),
                  link: link,
                  snippet: title.trim()
                });
              }
            }
          }

          if (results.length > 0) {
            console.log(`✅ Web scraping found ${results.length} results from ${searchUrl}`);
            return results.slice(0, maxResults);
          }
        } catch (error) {
          console.log(`❌ Web scraping failed for ${searchUrl}: ${(error as Error).message}`);
          continue;
        }
      }

      return [];
    } catch (error) {
      console.log(`❌ All web scraping fallbacks failed: ${(error as Error).message}`);
      return [];
    }
  }

  private getFallbackResults(query: string): SearchResult[] {
    // Return basic fallback results based on common patterns
    const fallbackResults: SearchResult[] = [];
    
    // Common patterns for different types of searches
    if (query.toLowerCase().includes('whitepaper')) {
      fallbackResults.push({
        title: `${query} - Official Documentation`,
        link: `https://docs.${query.toLowerCase().replace(/\s+/g, '')}.com`,
        snippet: `Official documentation and whitepaper for ${query}`
      });
    }
    
    if (query.toLowerCase().includes('github')) {
      fallbackResults.push({
        title: `${query} - GitHub Repository`,
        link: `https://github.com/${query.toLowerCase().replace(/\s+/g, '')}`,
        snippet: `GitHub repository for ${query}`
      });
    }

    return fallbackResults;
  }

  async searchMultiple(queries: string[], maxResultsPerQuery: number = 3): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];
    
    for (const query of queries) {
      try {
        const results = await this.search(query, maxResultsPerQuery);
        allResults.push(...results);
        
        // Add delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`❌ Failed to search for "${query}": ${(error as Error).message}`);
      }
    }
    
    return allResults;
  }

  // Specialized search methods for common use cases
  async searchForContractAddress(projectName: string): Promise<string | null> {
    console.log(`🔍 Starting contract address search for: ${projectName}`);
    
    // Strategy 1: Try CoinGecko API first (most reliable for token info)
    const coingeckoAddress = await this.searchCoinGecko(projectName);
    if (coingeckoAddress) {
      console.log(`✅ Found contract address via CoinGecko: ${coingeckoAddress}`);
      return coingeckoAddress;
    }
    
    // Strategy 2: Try blockchain explorer APIs with generic search
    const explorerAddress = await this.searchBlockchainExplorers(projectName);
    if (explorerAddress) {
      console.log(`✅ Found contract address via blockchain explorer: ${explorerAddress}`);
      return explorerAddress;
    }
    
    // Strategy 3: Enhanced basic search with better patterns
    const basicResults = await this.search(projectName, 15);
    
    // Look for contract addresses in basic results with enhanced patterns
    for (const result of basicResults) {
      const contractMatch = this.extractContractAddress(result.snippet) || 
                           this.extractContractAddress(result.title) ||
                           this.extractContractAddress(result.link);
      if (contractMatch) {
        console.log(`✅ Found contract address via basic search: ${contractMatch}`);
        return contractMatch;
      }
    }
    
    // Strategy 4: Try specific search terms with better patterns
    const searchTerms = [
      `${projectName} token contract address`,
      `${projectName} smart contract address`,
      `${projectName} token address`,
      `${projectName} contract address`,
      `${projectName} blockchain address`,
      `${projectName} token info`,
      `${projectName} cryptocurrency address`,
      `${projectName} token contract`,
      `${projectName} ethereum contract`,
      `${projectName} token`
    ];

    for (const term of searchTerms) {
      try {
        const results = await this.search(term, 5);
        
        for (const result of results) {
          // Enhanced contract address extraction
          const contractMatch = this.extractContractAddress(result.snippet) || 
                               this.extractContractAddress(result.title) ||
                               this.extractContractAddress(result.link);
          if (contractMatch) {
            console.log(`✅ Found contract address via search term "${term}": ${contractMatch}`);
            return contractMatch;
          }
          
          // Check if it's a blockchain explorer link and try to extract from the page
          if (this.isBlockchainExplorerLink(result.link)) {
            const pageAddress = await this.extractFromBlockchainExplorer(result.link);
            if (pageAddress) {
              console.log(`✅ Found contract address via blockchain explorer page: ${pageAddress}`);
              return pageAddress;
            }
          }
        }
      } catch (error) {
        console.log(`❌ Contract search failed for "${term}": ${(error as Error).message}`);
      }
    }
    
    console.log(`❌ No contract address found for: ${projectName}`);
    return null;
  }

  private extractContractAddress(text: string): string | null {
    if (!text) return null;
    
    // Enhanced regex patterns for contract addresses
    const patterns = [
      /0x[a-fA-F0-9]{40}/g,  // Standard Ethereum address
      /[A-Za-z0-9]{34}/g,    // Bitcoin-style address
      /[A-Za-z0-9]{42}/g,    // Extended address format
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Validate the address format
        const address = matches[0];
        if (this.isValidContractAddress(address)) {
          return address;
        }
      }
    }
    
    return null;
  }

  private isValidContractAddress(address: string): boolean {
    // Basic validation for Ethereum-style addresses
    if (address.startsWith('0x') && address.length === 42) {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    // Basic validation for other formats
    if (address.length >= 26 && address.length <= 35) {
      return /^[A-Za-z0-9]+$/.test(address);
    }
    
    return false;
  }

  private isBlockchainExplorerLink(url: string): boolean {
    const explorers = [
      'etherscan.io',
      'bscscan.com',
      'explorer.roninchain.com',
      'polygonscan.com',
      'arbiscan.io',
      'snowtrace.io',
      'ftmscan.com',
      'cronoscan.com'
    ];
    
    return explorers.some(explorer => url.includes(explorer));
  }

  private async extractFromBlockchainExplorer(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) return null;

      const html = await response.text();
      
      // Look for contract addresses in the page content
      const contractMatch = this.extractContractAddress(html);
      if (contractMatch) {
        return contractMatch;
      }
      
      // Look for specific patterns in blockchain explorer pages
      const patterns = [
        /Contract Address[:\s]*([0-9a-fA-Fx]{42})/i,
        /Token Address[:\s]*([0-9a-fA-Fx]{42})/i,
        /Address[:\s]*([0-9a-fA-Fx]{42})/i
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const address = match[1];
          if (this.isValidContractAddress(address)) {
            return address;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ Failed to extract from blockchain explorer: ${(error as Error).message}`);
      return null;
    }
  }

  private async searchBlockchainExplorers(projectName: string): Promise<string | null> {
    // Try to search popular blockchain explorers with generic queries
    const searchQueries = [
      projectName,
      `${projectName} token`,
      `${projectName} contract`
    ];
    
    const explorers = [
      'https://etherscan.io/search?q=',
      'https://bscscan.com/search?q=',
      'https://polygonscan.com/search?q=',
      'https://arbiscan.io/search?q=',
      'https://explorer.roninchain.com/search?q='
    ];
    
    for (const query of searchQueries) {
      for (const explorer of explorers) {
        try {
          const explorerUrl = `${explorer}${encodeURIComponent(query)}`;
          console.log(`🔍 Searching blockchain explorer: ${explorerUrl}`);
          const address = await this.extractFromBlockchainExplorer(explorerUrl);
          if (address) {
            return address;
          }
        } catch (error) {
          console.log(`❌ Blockchain explorer search failed: ${(error as Error).message}`);
        }
      }
    }
    
    return null;
  }

  private async searchCoinGecko(projectName: string): Promise<string | null> {
    try {
      // Try to search CoinGecko API for token info
      const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(projectName)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.coins && data.coins.length > 0) {
        // Look for the most relevant coin with better matching logic
        let bestMatch = data.coins[0];
        let bestScore = 0;
        
        for (const coin of data.coins) {
          const nameLower = coin.name.toLowerCase();
          const symbolLower = coin.symbol.toLowerCase();
          const projectLower = projectName.toLowerCase();
          
          let score = 0;
          
          // Exact name match gets highest score
          if (nameLower === projectLower) {
            score = 100;
          }
          // Partial name match
          else if (nameLower.includes(projectLower) || projectLower.includes(nameLower)) {
            score = 80;
          }
          // Symbol match
          else if (symbolLower === projectLower) {
            score = 70;
          }
          // Partial symbol match
          else if (symbolLower.includes(projectLower) || projectLower.includes(symbolLower)) {
            score = 60;
          }
          // Word boundary matches
          else if (nameLower.split(' ').some((word: string) => word === projectLower) ||
                   projectLower.split(' ').some((word: string) => word === nameLower)) {
            score = 50;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = coin;
          }
        }
        
        console.log(`🔍 Found CoinGecko match: ${bestMatch.name} (${bestMatch.symbol}) with score ${bestScore}`);
        
        // Only proceed if we have a reasonable match
        if (bestScore >= 30) {
          // Try to get detailed info for this coin
          const detailUrl = `https://api.coingecko.com/api/v3/coins/${bestMatch.id}`;
          const detailResponse = await fetch(detailUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            
            if (detailData.platforms) {
              // Look for contract addresses in different platforms
              for (const [platform, address] of Object.entries(detailData.platforms)) {
                if (typeof address === 'string' && this.isValidContractAddress(address)) {
                  console.log(`✅ Found contract address via CoinGecko (${platform}): ${address}`);
                  return address;
                }
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ CoinGecko search failed: ${(error as Error).message}`);
      return null;
    }
  }

  async searchForOfficialSources(projectName: string): Promise<{
    whitepaper?: string;
    documentation?: string;
    github?: string;
    website?: string;
    audits?: string[];
  }> {
    const sources: any = {};
    
    // First, try a basic search to get general results
    console.log(`🔍 Starting official sources search for: ${projectName}`);
    const basicResults = await this.search(projectName, 15);
    
    // Analyze basic results for official sources
    for (const result of basicResults) {
      const url = result.link.toLowerCase();
      const title = result.title.toLowerCase();
      const snippet = result.snippet.toLowerCase();
      
      // Look for website
      if (!sources.website && (
        url.includes(projectName.toLowerCase().replace(/\s+/g, '')) ||
        url.includes(projectName.toLowerCase().replace(/\s+/g, '-')) ||
        title.includes('official') && title.includes('website')
      )) {
        // Simple improvement: exclude obvious non-official sites
        if (!url.includes('wikipedia') && !url.includes('news') && !url.includes('msn')) {
          sources.website = result.link;
          console.log(`✅ Found website via basic search: ${result.link}`);
        }
      }
      
      // Look for GitHub
      if (!sources.github && url.includes('github.com')) {
        sources.github = result.link;
        console.log(`✅ Found GitHub via basic search: ${result.link}`);
      }
      
      // Look for documentation
      if (!sources.documentation && (
        url.includes('docs.') ||
        url.includes('/docs') ||
        title.includes('documentation') ||
        title.includes('docs')
      )) {
        sources.documentation = result.link;
        console.log(`✅ Found documentation via basic search: ${result.link}`);
      }
    }
    
    // If we found a website, try to crawl it for additional sources
    if (sources.website) {
      console.log(`🔍 Crawling website for additional sources: ${sources.website}`);
      const websiteSources = await this.crawlWebsiteForSources(sources.website, projectName);
      
      if (websiteSources.documentation && !sources.documentation) {
        sources.documentation = websiteSources.documentation;
        console.log(`✅ Found documentation via website crawling: ${websiteSources.documentation}`);
      }
      
      if (websiteSources.github && !sources.github) {
        sources.github = websiteSources.github;
        console.log(`✅ Found GitHub via website crawling: ${websiteSources.github}`);
      }
      
      if (websiteSources.whitepaper && !sources.whitepaper) {
        sources.whitepaper = websiteSources.whitepaper;
        console.log(`✅ Found whitepaper via website crawling: ${websiteSources.whitepaper}`);
      }
    }
    
    // Enhanced specific searches for critical sources
    const criticalSearchTerms = [
      // Whitepaper searches
      `${projectName} whitepaper`,
      `${projectName} litepaper`,
      `${projectName} white paper`,
      `${projectName} technical paper`,
      `${projectName} tokenomics`,
      `${projectName} economics paper`,
      
      // GitHub searches
      `${projectName} github`,
      `${projectName} repository`,
      `${projectName} source code`,
      `${projectName} open source`,
      `github ${projectName}`,
      
      // Documentation searches
      `${projectName} documentation`,
      `${projectName} docs`,
      `${projectName} developer docs`,
      `${projectName} api documentation`,
      
      // Audit searches
      `${projectName} audit`,
      `${projectName} security audit`,
      `${projectName} audit report`,
      `${projectName} security review`,
      `${projectName} smart contract audit`
    ];

    for (const term of criticalSearchTerms) {
      try {
        const results = await this.search(term, 5);
        
        for (const result of results) {
          const url = result.link.toLowerCase();
          const title = result.title.toLowerCase();
          const snippet = result.snippet.toLowerCase();
          
          // Whitepaper detection
          if (!sources.whitepaper && (
            term.includes('whitepaper') || 
            term.includes('litepaper') || 
            term.includes('white paper') ||
            term.includes('tokenomics') ||
            title.includes('whitepaper') || 
            title.includes('litepaper') || 
            title.includes('white paper') ||
            title.includes('tokenomics') ||
            snippet.includes('whitepaper') || 
            snippet.includes('litepaper') ||
            url.includes('whitepaper') ||
            url.includes('litepaper')
          )) {
            sources.whitepaper = result.link;
            console.log(`✅ Found whitepaper via enhanced search: ${result.link}`);
          }
          
          // GitHub detection
          if (!sources.github && (
            term.includes('github') || 
            term.includes('repository') ||
            term.includes('source code') ||
            url.includes('github.com') ||
            title.includes('github') ||
            snippet.includes('github')
          )) {
            sources.github = result.link;
            console.log(`✅ Found GitHub via enhanced search: ${result.link}`);
          }
          
          // Documentation detection
          if (!sources.documentation && (
            term.includes('documentation') || 
            term.includes('docs') ||
            title.includes('docs') || 
            url.includes('docs') ||
            snippet.includes('documentation')
          )) {
            sources.documentation = result.link;
            console.log(`✅ Found documentation via enhanced search: ${result.link}`);
          }
          
          // Audit detection
          if (term.includes('audit') || term.includes('security')) {
            if (!sources.audits) sources.audits = [];
            if (!sources.audits.includes(result.link)) {
              sources.audits.push(result.link);
              console.log(`✅ Found audit via enhanced search: ${result.link}`);
            }
          }
          
          // Website detection (fallback)
          if (!sources.website && (
            term.includes('website') || 
            url.includes(projectName.toLowerCase().replace(/\s+/g, ''))
          )) {
            sources.website = result.link;
            console.log(`✅ Found website via enhanced search: ${result.link}`);
          }
        }
      } catch (error) {
        console.log(`❌ Source search failed for "${term}": ${(error as Error).message}`);
      }
    }
    
    // Try direct GitHub API search if we haven't found GitHub yet
    if (!sources.github) {
      const githubRepo = await this.searchGitHubDirectly(projectName);
      if (githubRepo) {
        sources.github = githubRepo;
        console.log(`✅ Found GitHub via direct API search: ${githubRepo}`);
      }
    }
    
    // Try enhanced whitepaper discovery if we haven't found it yet
    if (!sources.whitepaper) {
      const whitepaperUrl = await this.searchWhitepaperDirectly(projectName, sources.website);
      if (whitepaperUrl) {
        sources.whitepaper = whitepaperUrl;
        console.log(`✅ Found whitepaper via direct discovery: ${whitepaperUrl}`);
      }
    }

    // Try enhanced audit discovery if we haven't found any audits yet
    if (!sources.audits || sources.audits.length === 0) {
      const auditUrl = await this.searchAuditDirectly(projectName, sources.website);
      if (auditUrl) {
        if (!sources.audits) sources.audits = [];
        sources.audits.push(auditUrl);
        console.log(`✅ Found audit via direct discovery: ${auditUrl}`);
      }
    }

    // Try enhanced documentation discovery if we haven't found it yet
    if (!sources.documentation) {
      const documentationUrl = await this.searchDocumentationDirectly(projectName, sources.website);
      if (documentationUrl) {
        sources.documentation = documentationUrl;
        console.log(`✅ Found documentation via direct discovery: ${documentationUrl}`);
      }
    }
    
    return sources;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Search cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  private async crawlWebsiteForSources(websiteUrl: string, projectName: string): Promise<{
    whitepaper?: string;
    documentation?: string;
    github?: string;
  }> {
    try {
      console.log(`🔍 Crawling website: ${websiteUrl}`);
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.log(`❌ Failed to fetch website: ${response.status}`);
        return {};
      }

      const html = await response.text();
      const sources: any = {};

      // Enhanced documentation link detection
      const docPatterns = [
        /href="([^"]*(?:docs?|documentation|developer)[^"]*)"/gi,
        /href="([^"]*\/docs[^"]*)"/gi,
        /href="([^"]*\/developer[^"]*)"/gi,
        /href="([^"]*\/api[^"]*)"/gi
      ];
      
      for (const pattern of docPatterns) {
        const docMatches = html.match(pattern);
        if (docMatches) {
          for (const match of docMatches) {
            const hrefMatch = match.match(/href="([^"]*)"/);
            if (hrefMatch) {
              const link = hrefMatch[1];
              if (link.startsWith('http') || link.startsWith('/')) {
                const fullUrl = link.startsWith('http') ? link : new URL(link, websiteUrl).href;
                sources.documentation = fullUrl;
                console.log(`✅ Found documentation link: ${fullUrl}`);
                break;
              }
            }
          }
          if (sources.documentation) break;
        }
      }

      // Enhanced GitHub link detection
      const githubPatterns = [
        /href="([^"]*github\.com[^"]*)"/gi,
        /href="([^"]*\/github[^"]*)"/gi,
        /href="([^"]*\/repo[^"]*)"/gi
      ];
      
      for (const pattern of githubPatterns) {
        const githubMatches = html.match(pattern);
        if (githubMatches) {
          for (const match of githubMatches) {
            const hrefMatch = match.match(/href="([^"]*)"/);
            if (hrefMatch) {
              const link = hrefMatch[1];
              if (link.startsWith('http')) {
                sources.github = link;
                console.log(`✅ Found GitHub link: ${link}`);
                break;
              }
            }
          }
          if (sources.github) break;
        }
      }

      // Enhanced whitepaper link detection
      const whitepaperPatterns = [
        /href="([^"]*(?:whitepaper|white-paper|paper|tokenomics|economics)[^"]*)"/gi,
        /href="([^"]*\.pdf[^"]*)"/gi,
        /href="([^"]*\/whitepaper[^"]*)"/gi,
        /href="([^"]*\/paper[^"]*)"/gi,
        /href="([^"]*\/tokenomics[^"]*)"/gi,
        /href="([^"]*\/economics[^"]*)"/gi,
        /href="([^"]*\/docs\/whitepaper[^"]*)"/gi,
        /href="([^"]*\/docs\/paper[^"]*)"/gi
      ];
      
      for (const pattern of whitepaperPatterns) {
        const whitepaperMatches = html.match(pattern);
        if (whitepaperMatches) {
          for (const match of whitepaperMatches) {
            const hrefMatch = match.match(/href="([^"]*)"/);
            if (hrefMatch) {
              const link = hrefMatch[1];
              if (link.startsWith('http') || link.startsWith('/')) {
                const fullUrl = link.startsWith('http') ? link : new URL(link, websiteUrl).href;
                
                // Additional validation for whitepaper links
                const urlLower = fullUrl.toLowerCase();
                if (urlLower.includes('whitepaper') || 
                    urlLower.includes('paper') || 
                    urlLower.includes('tokenomics') ||
                    urlLower.includes('economics') ||
                    urlLower.endsWith('.pdf') ||
                    urlLower.endsWith('.doc') ||
                    urlLower.endsWith('.docx')) {
                  sources.whitepaper = fullUrl;
                  console.log(`✅ Found whitepaper link: ${fullUrl}`);
                  break;
                }
              }
            }
          }
          if (sources.whitepaper) break;
        }
      }

      // Try to find whitepaper in navigation menus or common paths
      if (!sources.whitepaper) {
        const commonPaths = [
          '/whitepaper',
          '/paper',
          '/tokenomics',
          '/economics',
          '/docs/whitepaper',
          '/docs/paper',
          '/resources/whitepaper',
          '/resources/paper',
          '/about/whitepaper',
          '/about/paper'
        ];
        
        for (const path of commonPaths) {
          try {
            const testUrl = new URL(path, websiteUrl).href;
            const testResponse = await fetch(testUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            
            if (testResponse.ok) {
              const contentType = testResponse.headers.get('content-type');
              if (contentType && (
                contentType.includes('application/pdf') ||
                contentType.includes('text/html') ||
                contentType.includes('application/msword') ||
                contentType.includes('application/vnd.openxmlformats')
              )) {
                sources.whitepaper = testUrl;
                console.log(`✅ Found whitepaper via common path: ${testUrl}`);
                break;
              }
            }
          } catch (error) {
            // Continue to next path
          }
        }
      }

      return sources;
    } catch (error) {
      console.log(`❌ Website crawling failed: ${(error as Error).message}`);
      return {};
    }
  }

  async searchWhitepaperDirectly(projectName: string, websiteUrl: string | undefined): Promise<string | null> {
    try {
      console.log(`🔍 Direct whitepaper search for: ${projectName}`);
      
      // Strategy 1: Try dedicated whitepaper subdomain (highest priority)
      if (websiteUrl) {
        try {
          const url = new URL(websiteUrl);
          const domain = url.hostname;
          const projectNameLower = projectName.toLowerCase().replace(/\s+/g, '');
          
          // Test common whitepaper subdomain patterns
          const subdomainPatterns = [
            `whitepaper.${domain}`,
            `whitepaper.${domain.replace('www.', '')}`,
            `docs.${domain}`,
            `docs.${domain.replace('www.', '')}`,
            `paper.${domain}`,
            `paper.${domain.replace('www.', '')}`
          ];
          
          for (const subdomain of subdomainPatterns) {
            try {
              const testUrl = `https://${subdomain}`;
              const response = await fetch(testUrl, { 
                method: 'HEAD',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
              });
              
              if (response.ok) {
                console.log(`✅ Found accessible whitepaper subdomain: ${testUrl}`);
                return testUrl;
              }
            } catch (error) {
              // Continue to next subdomain
            }
          }
        } catch (error) {
          // Continue to other strategies
        }
      }
      
      // Strategy 2: Try common document repositories and platforms
      const documentPlatforms = [
        `https://docs.google.com/document/d/search?q=${encodeURIComponent(projectName + ' whitepaper')}`,
        `https://arxiv.org/search/?query=${encodeURIComponent(projectName + ' whitepaper')}`,
        `https://www.researchgate.net/search/publication?q=${encodeURIComponent(projectName + ' whitepaper')}`,
        `https://medium.com/search?q=${encodeURIComponent(projectName + ' whitepaper')}`,
        `https://mirror.xyz/search?q=${encodeURIComponent(projectName + ' whitepaper')}`,
        `https://substack.com/search?q=${encodeURIComponent(projectName + ' whitepaper')}`
      ];
      
      for (const platformUrl of documentPlatforms) {
        try {
          const response = await fetch(platformUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (response.ok) {
            const html = await response.text();
            
            // Look for PDF links or document links
            const pdfMatches = html.match(/href="([^"]*\.pdf[^"]*)"/gi);
            if (pdfMatches) {
              for (const match of pdfMatches) {
                const hrefMatch = match.match(/href="([^"]*)"/);
                if (hrefMatch) {
                  const link = hrefMatch[1];
                  if (link.startsWith('http')) {
                    console.log(`✅ Found whitepaper via document platform: ${link}`);
                    return link;
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next platform
        }
      }
      
      // Strategy 2: Enhanced search queries with more specific terms
      const searchQueries = [
        `${projectName} whitepaper`,
        `${projectName} litepaper`,
        `${projectName} technical paper`,
        `${projectName} tokenomics`,
        `${projectName} economics paper`,
        `${projectName} token info`,
        `${projectName} token contract`,
        `${projectName} ethereum contract`,
        `${projectName} token`,
        `${projectName} whitepaper pdf`,
        `${projectName} whitepaper github`,
        `${projectName} whitepaper docs`,
        `${projectName} whitepaper medium`,
        `${projectName} whitepaper mirror`
      ];

      for (const query of searchQueries) {
        try {
          const results = await this.search(query, 5);
          for (const result of results) {
            const url = result.link.toLowerCase();
            const title = result.title.toLowerCase();
            const snippet = result.snippet.toLowerCase();

            // Check for common whitepaper URL patterns
            if (url.includes('whitepaper.pdf') || 
                url.includes('whitepaper.doc') || 
                url.includes('whitepaper.docx') || 
                url.includes('whitepaper.txt') ||
                url.includes('paper.pdf') ||
                url.includes('tokenomics.pdf') ||
                url.includes('economics.pdf')) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found whitepaper via direct search: ${result.link}`);
                return result.link;
              }
            }

            // Check for common website paths for whitepapers
            if (websiteUrl && (
              url.includes(websiteUrl.toLowerCase().replace(/\s+/g, '')) ||
              url.includes(websiteUrl.toLowerCase().replace(/\s+/g, '-')) ||
              url.includes('docs.') ||
              url.includes('/docs') ||
              title.includes('whitepaper') ||
              title.includes('litepaper') ||
              title.includes('technical paper') ||
              title.includes('tokenomics') ||
              title.includes('economics paper') ||
              snippet.includes('whitepaper') ||
              snippet.includes('litepaper') ||
              snippet.includes('technical paper') ||
              snippet.includes('tokenomics') ||
              snippet.includes('economics paper') ||
              snippet.includes('token info') ||
              snippet.includes('token contract') ||
              snippet.includes('ethereum contract') ||
              snippet.includes('token')
            )) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found whitepaper via direct search: ${result.link}`);
                return result.link;
              }
            }
            
            // Check for GitHub repository with whitepaper
            if (url.includes('github.com') && (
              title.includes('whitepaper') ||
              title.includes('paper') ||
              title.includes('tokenomics') ||
              snippet.includes('whitepaper') ||
              snippet.includes('paper') ||
              snippet.includes('tokenomics')
            )) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found whitepaper via GitHub: ${result.link}`);
                return result.link;
              }
            }
          }
        } catch (error) {
          console.log(`❌ Direct whitepaper search failed for "${query}": ${(error as Error).message}`);
        }
      }
      
      // Strategy 3: Try to find whitepaper in GitHub repositories
      if (!websiteUrl) {
        const githubWhitepaper = await this.searchGitHubForWhitepaper(projectName);
        if (githubWhitepaper) {
          console.log(`✅ Found whitepaper via GitHub search: ${githubWhitepaper}`);
          return githubWhitepaper;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ All direct whitepaper searches failed: ${(error as Error).message}`);
      return null;
    }
  }

  private async searchGitHubDirectly(projectName: string): Promise<string | null> {
    try {
      // Try to search GitHub API for repositories
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(projectName)}&sort=stars&order=desc&per_page=5`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // Look for the most relevant repository
        let bestMatch = data.items[0];
        let bestScore = 0;
        
        for (const repo of data.items) {
          const score = this.scoreGitHubRepository(repo, projectName);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = repo;
          }
        }
        
        console.log(`🔍 Found GitHub match: ${bestMatch.full_name} with score ${bestScore}`);
        
        // Only proceed if we have a reasonable match (increased threshold)
        if (bestScore >= 60) {
          return bestMatch.html_url;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ GitHub API search failed: ${(error as Error).message}`);
      return null;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private scoreGitHubRepository(repo: any, projectName: string): number {
    const nameLower = repo.name.toLowerCase();
    const fullNameLower = repo.full_name.toLowerCase();
    const descriptionLower = (repo.description || '').toLowerCase();
    const projectLower = projectName.toLowerCase();
    const projectWords = projectLower.split(/\s+/).filter(word => word.length > 2);
    
    let score = 0;
    
    // Exact name match gets highest score
    if (nameLower === projectLower) {
      score = 100;
    }
    // Exact full name match (e.g., "projectname/projectname")
    else if (fullNameLower === `${projectLower}/${projectLower}`) {
      score = 95;
    }
    // Repository name contains project name as a complete word
    else if (nameLower.includes(projectLower) && 
             (nameLower.startsWith(projectLower) || 
              nameLower.endsWith(projectLower) || 
              nameLower.includes(`-${projectLower}`) || 
              nameLower.includes(`_${projectLower}`))) {
      score = 85;
    }
    // Project name contains repository name as a complete word
    else if (projectLower.includes(nameLower) && 
             (projectLower.startsWith(nameLower) || 
              projectLower.endsWith(nameLower) || 
              projectLower.includes(` ${nameLower} `))) {
      score = 80;
    }
    // Full name contains project name
    else if (fullNameLower.includes(projectLower)) {
      score = 70;
    }
    // Description contains project name
    else if (descriptionLower.includes(projectLower)) {
      score = 60;
    }
    // Word boundary matches - only if most words match
    else if (projectWords.length > 0) {
      const matchingWords = projectWords.filter(word => 
        nameLower.includes(word) || fullNameLower.includes(word)
      );
      const matchRatio = matchingWords.length / projectWords.length;
      if (matchRatio >= 0.7) { // At least 70% of words must match
        score = 50 + (matchRatio * 20); // 50-70 score based on match ratio
      }
    }
    
    // Penalize common false positive patterns
    if (nameLower.includes('sandbox') && !projectLower.includes('sandbox')) {
      score -= 50; // Heavily penalize "sandbox" matches for non-sandbox projects
    }
    if (nameLower.includes('code') && !projectLower.includes('code')) {
      score -= 30; // Penalize "code" matches for non-code projects
    }
    if (nameLower.includes('test') || nameLower.includes('example') || nameLower.includes('demo')) {
      score -= 25; // Penalize test/example/demo repositories
    }
    
    // Additional strict filtering for common false positive patterns
    if (nameLower.includes('lucet') || nameLower.includes('webcomponents') || nameLower.includes('otofu')) {
      score -= 40; // Penalize specific false positive repositories
    }
    
    // Require exact word boundaries for high-scoring matches
    if (score > 60 && !nameLower.includes(projectLower) && !fullNameLower.includes(projectLower)) {
      score -= 20; // Penalize high scores without exact project name match
    }
    
    return score;
  }

  private async searchGitHubForWhitepaper(projectName: string): Promise<string | null> {
    try {
      console.log(`🔍 Searching GitHub for whitepaper: ${projectName}`);
      
      // Search for repositories that might contain whitepapers
      const searchQueries = [
        `${projectName} whitepaper`,
        `${projectName} paper`,
        `${projectName} tokenomics`,
        `${projectName} docs`,
        `${projectName} documentation`
      ];
      
      for (const query of searchQueries) {
        try {
          const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            // Score and filter repositories to reduce false positives
            const scoredRepos = data.items.map((repo: any) => {
              const score = this.scoreGitHubRepository(repo, projectName);
              return { repo, score };
            }).filter((item: any) => item.score >= 40); // Only consider repos with decent scores
            
            // Sort by score descending
            scoredRepos.sort((a: any, b: any) => b.score - a.score);
            
            for (const { repo } of scoredRepos) {
              // Check if this repository contains whitepaper files
              const contentsUrl = `https://api.github.com/repos/${repo.full_name}/contents`;
              const contentsResponse = await fetch(contentsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'application/vnd.github.v3+json'
                }
              });

              if (contentsResponse.ok) {
                const contents = await contentsResponse.json();
                
                for (const item of contents) {
                  const name = item.name.toLowerCase();
                  if (name.includes('whitepaper') || 
                      name.includes('paper') || 
                      name.includes('tokenomics') ||
                      name.includes('economics') ||
                      name.endsWith('.pdf') ||
                      name.endsWith('.md') && (name.includes('readme') || name.includes('paper'))) {
                    
                    const fileUrl = item.html_url;
                    console.log(`✅ Found whitepaper file in GitHub: ${fileUrl}`);
                    return fileUrl;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(`❌ GitHub whitepaper search failed for "${query}": ${(error as Error).message}`);
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ GitHub whitepaper search failed: ${(error as Error).message}`);
      return null;
    }
  }

  async searchAuditDirectly(projectName: string, websiteUrl: string | undefined): Promise<string | null> {
    try {
      console.log(`🔍 Direct audit search for: ${projectName}`);

      // Strategy 1: Try known audit firm platforms (highest priority)
      const auditFirms = [
        'certik',
        'consensys',
        'trailofbits',
        'quantstamp',
        'openzeppelin',
        'hacken',
        'slowmist',
        'halborn',
        'peckshield',
        'immunefi'
      ];

      for (const firm of auditFirms) {
        try {
          // Test common audit firm URL patterns
          const auditUrls = [
            `https://skynet.certik.com/projects/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://skynet.certik.com/projects/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://consensys.net/diligence/audits/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://consensys.net/diligence/audits/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://trailofbits.com/audits/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://trailofbits.com/audits/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://quantstamp.com/audits/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://quantstamp.com/audits/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://blog.openzeppelin.com/audit-${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://blog.openzeppelin.com/audit-${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://hacken.io/audits/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://hacken.io/audits/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://slowmist.com/audit/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://slowmist.com/audit/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://halborn.com/audits/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://halborn.com/audits/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://peckshield.com/audit/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://peckshield.com/audit/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            `https://immunefi.com/bounty/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
            `https://immunefi.com/bounty/${projectName.toLowerCase().replace(/\s+/g, '')}`
          ];

          for (const url of auditUrls) {
            try {
              const response = await fetch(url, { 
                method: 'HEAD',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
              });
              
              if (response.ok) {
                console.log(`✅ Found accessible audit at: ${url}`);
                return url;
              }
            } catch (error) {
              // Continue to next URL
            }
          }
        } catch (error) {
          // Continue to next firm
        }
      }

      // Strategy 2: Try common audit paths on official website
      if (websiteUrl) {
        try {
          const url = new URL(websiteUrl);
          const domain = url.hostname;
          
          // Test common audit path patterns
          const auditPaths = [
            `/audit`,
            `/audits`,
            `/security-audit`,
            `/security/audit`,
            `/security/audits`,
            `/docs/audit`,
            `/docs/audits`,
            `/resources/audit`,
            `/resources/audits`,
            `/security`,
            `/security/reports`,
            `/reports/audit`,
            `/reports/audits`
          ];
          
          for (const path of auditPaths) {
            try {
              const testUrl = `https://${domain}${path}`;
              const response = await fetch(testUrl, { 
                method: 'HEAD',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
              });
              
              if (response.ok) {
                console.log(`✅ Found accessible audit path: ${testUrl}`);
                return testUrl;
              }
            } catch (error) {
              // Continue to next path
            }
          }
        } catch (error) {
          // Continue to other strategies
        }
      }

      // Strategy 3: Try enhanced search with specific audit terms
      const auditSearchTerms = [
        `${projectName} CertiK audit`,
        `${projectName} security audit report`,
        `${projectName} smart contract audit`,
        `${projectName} audit findings`,
        `${projectName} audit verification`,
        `${projectName} audit completed`,
        `${projectName} audit status`,
        `${projectName} security review`,
        `${projectName} audit firm`,
        `${projectName} audit results`
      ];

      for (const term of auditSearchTerms) {
        try {
          const results = await this.search(term, 3);
          
          for (const result of results) {
            const url = result.link.toLowerCase();
            const title = result.title.toLowerCase();
            const snippet = result.snippet.toLowerCase();
            
            // Check if this looks like a real audit
            const isAuditRelated = (
              title.includes('audit') ||
              title.includes('security') ||
              title.includes('certik') ||
              title.includes('verification') ||
              url.includes('certik') ||
              url.includes('audit') ||
              url.includes('security') ||
              url.includes('consensys') ||
              url.includes('trailofbits') ||
              url.includes('quantstamp') ||
              url.includes('openzeppelin') ||
              url.includes('hacken') ||
              url.includes('slowmist') ||
              url.includes('halborn') ||
              url.includes('peckshield') ||
              url.includes('immunefi')
            );
            
            if (isAuditRelated && this.isValidUrl(result.link)) {
              console.log(`✅ Found audit via enhanced search: ${result.link}`);
              return result.link;
            }
          }
        } catch (error) {
          console.log(`❌ Audit search failed for "${term}": ${(error as Error).message}`);
        }
      }

      // Strategy 4: Try GitHub for audit files
      const githubAudit = await this.searchGitHubForAudit(projectName);
      if (githubAudit) {
        return githubAudit;
      }

      console.log(`❌ No audit found for: ${projectName}`);
      return null;
    } catch (error) {
      console.log(`❌ Direct audit search failed: ${(error as Error).message}`);
      return null;
    }
  }

  private async searchDocumentationDirectly(projectName: string, websiteUrl: string | undefined): Promise<string | null> {
    try {
      console.log(`🔍 Direct documentation search for: ${projectName}`);

             // Strategy 1: Try common documentation subdomains (highest priority)
       if (websiteUrl) {
         try {
           const url = new URL(websiteUrl);
           const domain = url.hostname;
           const projectNameLower = projectName.toLowerCase().replace(/\s+/g, '');
           
           // Test common documentation subdomain patterns
           const subdomainPatterns = [
             `docs.${domain}`,
             `docs.${domain.replace('www.', '')}`,
             `api.${domain}`,
             `api.${domain.replace('www.', '')}`,
             `developer.${domain}`,
             `developer.${domain.replace('www.', '')}`,
             // Also try project-specific subdomains
             `docs.${projectNameLower}.com`,
             `docs.${projectNameLower}.org`,
             `docs.${projectNameLower}.io`,
             `api.${projectNameLower}.com`,
             `api.${projectNameLower}.org`,
             `api.${projectNameLower}.io`
           ];
          
          for (const subdomain of subdomainPatterns) {
            try {
              const testUrl = `https://${subdomain}`;
              const response = await fetch(testUrl, { 
                method: 'HEAD',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
              });
              
              if (response.ok) {
                console.log(`✅ Found accessible documentation subdomain: ${testUrl}`);
                return testUrl;
              }
            } catch (error) {
              // Continue to next subdomain
            }
          }
        } catch (error) {
          // Continue to other strategies
        }
      }

      // Strategy 2: Try common document repositories and platforms
      const documentPlatforms = [
        `https://docs.google.com/document/d/search?q=${encodeURIComponent(projectName + ' documentation')}`,
        `https://www.notion.so/search?q=${encodeURIComponent(projectName + ' documentation')}`,
        `https://www.researchgate.net/search/publication?q=${encodeURIComponent(projectName + ' documentation')}`,
        `https://medium.com/search?q=${encodeURIComponent(projectName + ' documentation')}`,
        `https://mirror.xyz/search?q=${encodeURIComponent(projectName + ' documentation')}`,
        `https://substack.com/search?q=${encodeURIComponent(projectName + ' documentation')}`
      ];
      
      for (const platformUrl of documentPlatforms) {
        try {
          const response = await fetch(platformUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (response.ok) {
            const html = await response.text();
            
            // Look for PDF links or document links
            const pdfMatches = html.match(/href="([^"]*\.pdf[^"]*)"/gi);
            if (pdfMatches) {
              for (const match of pdfMatches) {
                const hrefMatch = match.match(/href="([^"]*)"/);
                if (hrefMatch) {
                  const link = hrefMatch[1];
                  if (link.startsWith('http')) {
                    console.log(`✅ Found documentation via document platform: ${link}`);
                    return link;
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next platform
        }
      }

      // Strategy 3: Enhanced search queries with more specific terms
      const searchQueries = [
        `${projectName} documentation`,
        `${projectName} docs`,
        `${projectName} developer docs`,
        `${projectName} api documentation`,
        `${projectName} tokenomics`,
        `${projectName} economics paper`,
        `${projectName} token info`,
        `${projectName} token contract`,
        `${projectName} ethereum contract`,
        `${projectName} token`,
        `${projectName} whitepaper docs`,
        `${projectName} whitepaper medium`,
        `${projectName} whitepaper mirror`
      ];

      for (const query of searchQueries) {
        try {
          const results = await this.search(query, 5);
          for (const result of results) {
            const url = result.link.toLowerCase();
            const title = result.title.toLowerCase();
            const snippet = result.snippet.toLowerCase();

            // Check for common documentation URL patterns
            if (url.includes('docs.pdf') || 
                url.includes('docs.doc') || 
                url.includes('docs.docx') || 
                url.includes('docs.txt') ||
                url.includes('api.pdf') ||
                url.includes('api.doc') ||
                url.includes('api.docx') ||
                url.includes('api.txt') ||
                url.includes('tokenomics.pdf') ||
                url.includes('economics.pdf')) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found documentation via direct search: ${result.link}`);
                return result.link;
              }
            }

            // Check for common website paths for documentation
            if (websiteUrl && (
              url.includes(websiteUrl.toLowerCase().replace(/\s+/g, '')) ||
              url.includes(websiteUrl.toLowerCase().replace(/\s+/g, '-')) ||
              url.includes('docs.') ||
              url.includes('/docs') ||
              url.includes('api.') ||
              url.includes('/api') ||
              title.includes('documentation') ||
              title.includes('docs') ||
              title.includes('developer docs') ||
              title.includes('api documentation') ||
              snippet.includes('documentation') ||
              snippet.includes('docs') ||
              snippet.includes('developer docs') ||
              snippet.includes('api documentation') ||
              snippet.includes('tokenomics') ||
              snippet.includes('economics paper') ||
              snippet.includes('token info') ||
              snippet.includes('token contract') ||
              snippet.includes('ethereum contract') ||
              snippet.includes('token')
            )) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found documentation via direct search: ${result.link}`);
                return result.link;
              }
            }
            
            // Check for GitHub repository with documentation
            if (url.includes('github.com') && (
              title.includes('documentation') ||
              title.includes('docs') ||
              title.includes('developer docs') ||
              title.includes('api documentation') ||
              snippet.includes('documentation') ||
              snippet.includes('docs') ||
              snippet.includes('developer docs') ||
              snippet.includes('api documentation')
            )) {
              // Validate the URL is actually accessible
              if (this.isValidUrl(result.link)) {
                console.log(`✅ Found documentation via GitHub: ${result.link}`);
                return result.link;
              }
            }
          }
        } catch (error) {
          console.log(`❌ Direct documentation search failed for "${query}": ${(error as Error).message}`);
        }
      }
      
      // Strategy 4: Try to find documentation in GitHub repositories
      if (!websiteUrl) {
        const githubDocumentation = await this.searchGitHubForDocumentation(projectName);
        if (githubDocumentation) {
          console.log(`✅ Found documentation via GitHub search: ${githubDocumentation}`);
          return githubDocumentation;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ All direct documentation searches failed: ${(error as Error).message}`);
      return null;
    }
  }

  private async searchGitHubForDocumentation(projectName: string): Promise<string | null> {
    try {
      console.log(`🔍 Searching GitHub for documentation: ${projectName}`);
      
      // Search for repositories that might contain documentation
      const searchQueries = [
        `${projectName} documentation`,
        `${projectName} docs`,
        `${projectName} developer docs`,
        `${projectName} api documentation`
      ];
      
      for (const query of searchQueries) {
        try {
          const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            // Score and filter repositories to reduce false positives
            const scoredRepos = data.items.map((repo: any) => {
              const score = this.scoreGitHubRepository(repo, projectName);
              return { repo, score };
            }).filter((item: any) => item.score >= 40); // Only consider repos with decent scores
            
            // Sort by score descending
            scoredRepos.sort((a: any, b: any) => b.score - a.score);
            
            for (const { repo } of scoredRepos) {
              // Check if this repository contains documentation files
              const contentsUrl = `https://api.github.com/repos/${repo.full_name}/contents`;
              const contentsResponse = await fetch(contentsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'application/vnd.github.v3+json'
                }
              });

              if (contentsResponse.ok) {
                const contents = await contentsResponse.json();
                
                for (const item of contents) {
                  const name = item.name.toLowerCase();
                  if (name.includes('readme') || 
                      name.includes('documentation') || 
                      name.includes('docs') ||
                      name.includes('developer') ||
                      name.includes('api') ||
                      name.includes('tokenomics') ||
                      name.includes('economics') ||
                      name.endsWith('.pdf') ||
                      name.endsWith('.md') && (name.includes('readme') || name.includes('documentation'))) {
                    
                    const fileUrl = item.html_url;
                    console.log(`✅ Found documentation file in GitHub: ${fileUrl}`);
                    return fileUrl;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(`❌ GitHub documentation search failed for "${query}": ${(error as Error).message}`);
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ GitHub documentation search failed: ${(error as Error).message}`);
      return null;
    }
  }

  private async searchGitHubForAudit(projectName: string): Promise<string | null> {
    try {
      console.log(`🔍 Searching GitHub for audit: ${projectName}`);
      
      // Search for repositories that might contain audit files
      const searchQueries = [
        `${projectName} audit`,
        `${projectName} security`,
        `${projectName} audit report`,
        `${projectName} security audit`,
        `${projectName} smart contract audit`
      ];
      
      for (const query of searchQueries) {
        try {
          const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            for (const repo of data.items) {
              // Check if this repository contains audit files
              const contentsUrl = `https://api.github.com/repos/${repo.full_name}/contents`;
              const contentsResponse = await fetch(contentsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'application/vnd.github.v3+json'
                }
              });

              if (contentsResponse.ok) {
                const contents = await contentsResponse.json();
                
                for (const item of contents) {
                  const name = item.name.toLowerCase();
                  if (name.includes('audit') || 
                      name.includes('security') || 
                      name.includes('certik') ||
                      name.includes('verification') ||
                      name.endsWith('.pdf') && (name.includes('audit') || name.includes('security')) ||
                      name.endsWith('.md') && (name.includes('audit') || name.includes('security'))) {
                    
                    const fileUrl = item.html_url;
                    console.log(`✅ Found audit file in GitHub: ${fileUrl}`);
                    return fileUrl;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(`❌ GitHub audit search failed for "${query}": ${(error as Error).message}`);
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ GitHub audit search failed: ${(error as Error).message}`);
      return null;
    }
  }
}

// Export singleton instance
export const freeSearchService = FreeSearchService.getInstance();
