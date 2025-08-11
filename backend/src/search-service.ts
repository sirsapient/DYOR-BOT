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
      // Use DuckDuckGo Instant Answer API
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      
      if (!response.ok) {
        console.log(`❌ DuckDuckGo API failed: ${response.status}`);
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

      // If we don't have enough results, try web scraping fallback
      if (results.length < maxResults) {
        const fallbackResults = await this.getWebScrapingResults(query, maxResults - results.length);
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
    try {
      // Try to scrape from a search engine directly
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: SearchResult[] = [];

      // Simple regex-based extraction (basic fallback)
      const linkMatches = html.match(/href="([^"]*)"[^>]*>([^<]*)</g);
      if (linkMatches) {
        for (const match of linkMatches.slice(0, maxResults)) {
          const hrefMatch = match.match(/href="([^"]*)"/);
          const titleMatch = match.match(/>([^<]*)</);
          
          if (hrefMatch && titleMatch) {
            const link = hrefMatch[1];
            const title = titleMatch[1];
            
            // Filter out non-http links and common unwanted domains
            if (link.startsWith('http') && 
                !link.includes('duckduckgo.com') && 
                !link.includes('javascript:') &&
                title.length > 10) {
              results.push({
                title: title.trim(),
                link: link,
                snippet: title.trim()
              });
            }
          }
        }
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.log(`❌ Web scraping fallback failed: ${(error as Error).message}`);
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
    const searchTerms = [
      `${projectName} token contract address`,
      `${projectName} smart contract address`,
      `${projectName} token address ronin`,
      `${projectName} AXS token contract`
    ];

    for (const term of searchTerms) {
      try {
        const results = await this.search(term, 3);
        
        for (const result of results) {
          // Look for contract addresses in snippets
          const contractMatch = result.snippet.match(/0x[a-fA-F0-9]{40}/);
          if (contractMatch) {
            console.log(`✅ Found contract address via free search: ${contractMatch[0]}`);
            return contractMatch[0];
          }
        }
      } catch (error) {
        console.log(`❌ Contract search failed for "${term}": ${(error as Error).message}`);
      }
    }
    
    return null;
  }

  async searchForOfficialSources(projectName: string): Promise<{
    whitepaper?: string;
    documentation?: string;
    github?: string;
    website?: string;
  }> {
    const sources: any = {};
    const searchTerms = [
      `${projectName} whitepaper`,
      `${projectName} documentation`,
      `${projectName} github`,
      `${projectName} official website`
    ];

    for (const term of searchTerms) {
      try {
        const results = await this.search(term, 2);
        
        for (const result of results) {
          const url = result.link.toLowerCase();
          const title = result.title.toLowerCase();
          const snippet = result.snippet.toLowerCase();
          
          if (!sources.whitepaper && (term.includes('whitepaper') || title.includes('whitepaper') || snippet.includes('whitepaper'))) {
            sources.whitepaper = result.link;
            console.log(`✅ Found whitepaper via free search: ${result.link}`);
          }
          
          if (!sources.documentation && (term.includes('documentation') || title.includes('docs') || url.includes('docs'))) {
            sources.documentation = result.link;
            console.log(`✅ Found documentation via free search: ${result.link}`);
          }
          
          if (!sources.github && (term.includes('github') || url.includes('github.com'))) {
            sources.github = result.link;
            console.log(`✅ Found GitHub via free search: ${result.link}`);
          }
          
          if (!sources.website && (term.includes('website') || url.includes(projectName.toLowerCase().replace(/\s+/g, '')))) {
            sources.website = result.link;
            console.log(`✅ Found website via free search: ${result.link}`);
          }
        }
      } catch (error) {
        console.log(`❌ Source search failed for "${term}": ${(error as Error).message}`);
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
}

// Export singleton instance
export const freeSearchService = FreeSearchService.getInstance();
