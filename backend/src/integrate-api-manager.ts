// Integration Guide: Universal API Manager with Existing Services
// This shows how to integrate the Universal API Manager with our current API usage

import { universalAPIManager } from './universal-api-manager';
import { freeSearchService } from './search-service';
import { NFTService } from './nft-service';

// Example 1: Enhanced Search Service with API Manager
export class EnhancedSearchService {
  private apiManager = universalAPIManager;

  async search(query: string, maxResults: number = 5): Promise<any[]> {
    console.log(`🔍 Enhanced search for: ${query}`);
    
    // Get optimal API coordination for search
    const coordination = this.apiManager.getOptimalAPICoordination('search', {
      maxCost: 0,
      maxLatency: 5000,
      minSuccessRate: 80
    });

    console.log(`📊 Using ${coordination.primaryAPI} for search (confidence: ${(coordination.confidence * 100).toFixed(1)}%)`);

    try {
      // Try primary API first
      const response = await this.apiManager.makeAPICall(
        coordination.primaryAPI,
        this.getSearchEndpoint(coordination.primaryAPI, query),
        { method: 'GET' },
        'high'
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseSearchResults(data, coordination.primaryAPI);
      } else {
        throw new Error(`Primary API failed: ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ Primary API failed, trying fallbacks: ${(error as Error).message}`);
      
      // Try fallback APIs
      for (const fallbackAPI of coordination.fallbackAPIs) {
        try {
          console.log(`🔄 Trying fallback: ${fallbackAPI}`);
          const response = await this.apiManager.makeAPICall(
            fallbackAPI,
            this.getSearchEndpoint(fallbackAPI, query),
            { method: 'GET' },
            'medium'
          );

          if (response.ok) {
            const data = await response.json();
            return this.parseSearchResults(data, fallbackAPI);
          }
        } catch (fallbackError) {
          console.log(`❌ Fallback ${fallbackAPI} failed: ${(fallbackError as Error).message}`);
        }
      }

      // All APIs failed, return empty results
      console.log('❌ All search APIs failed');
      return [];
    }
  }

  private getSearchEndpoint(apiName: string, query: string): string {
    switch (apiName) {
      case 'duckduckgo':
        return `/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
      case 'searx':
        return `/?q=${encodeURIComponent(query)}&format=json`;
      case 'brave':
        return `/?q=${encodeURIComponent(query)}&format=json`;
      default:
        return `/?q=${encodeURIComponent(query)}`;
    }
  }

  private parseSearchResults(data: any, apiName: string): any[] {
    // Parse results based on API type
    switch (apiName) {
      case 'duckduckgo':
        return this.parseDuckDuckGoResults(data);
      case 'searx':
        return this.parseSearXResults(data);
      case 'brave':
        return this.parseBraveResults(data);
      default:
        return [];
    }
  }

  private parseDuckDuckGoResults(data: any): any[] {
    const results: any[] = [];
    
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Abstract,
        link: data.AbstractURL,
        snippet: data.Abstract
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.Text,
          link: topic.FirstURL,
          snippet: topic.Text
        });
      }
    }

    return results;
  }

  private parseSearXResults(data: any): any[] {
    // Implement SearX result parsing
    return [];
  }

  private parseBraveResults(data: any): any[] {
    // Implement Brave result parsing
    return [];
  }
}

// Example 2: Enhanced NFT Service with API Manager
export class EnhancedNFTService {
  private apiManager = universalAPIManager;

  async searchNFTs(projectName: string): Promise<any[]> {
    console.log(`🎨 Enhanced NFT search for: ${projectName}`);
    
    // Get optimal API coordination for NFT search
    const coordination = this.apiManager.getOptimalAPICoordination('nft', {
      maxCost: 0.01,
      maxLatency: 10000,
      minSuccessRate: 85
    });

    console.log(`📊 Using ${coordination.primaryAPI} for NFT search (confidence: ${(coordination.confidence * 100).toFixed(1)}%)`);

    const results: any[] = [];

    try {
      // Try primary API
      const primaryResults = await this.searchWithAPI(coordination.primaryAPI, projectName);
      results.push(...primaryResults);
      console.log(`✅ Found ${primaryResults.length} results from ${coordination.primaryAPI}`);

    } catch (error) {
      console.log(`❌ Primary NFT API failed: ${(error as Error).message}`);
    }

    // Try fallback APIs if we don't have enough results
    if (results.length < 3) {
      for (const fallbackAPI of coordination.fallbackAPIs) {
        try {
          console.log(`🔄 Trying NFT fallback: ${fallbackAPI}`);
          const fallbackResults = await this.searchWithAPI(fallbackAPI, projectName);
          results.push(...fallbackResults);
          console.log(`✅ Found ${fallbackResults.length} additional results from ${fallbackAPI}`);

          if (results.length >= 5) break; // Stop if we have enough results
        } catch (fallbackError) {
          console.log(`❌ NFT fallback ${fallbackAPI} failed: ${(fallbackError as Error).message}`);
        }
      }
    }

    return results;
  }

  private async searchWithAPI(apiName: string, projectName: string): Promise<any[]> {
    const endpoint = this.getNFTEndpoint(apiName, projectName);
    
    const response = await this.apiManager.makeAPICall(
      apiName,
      endpoint,
      { 
        method: 'GET',
        headers: this.getNFTHeaders(apiName)
      },
      'high'
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return this.parseNFTResults(data, apiName);
  }

  private getNFTEndpoint(apiName: string, projectName: string): string {
    switch (apiName) {
      case 'opensea':
        return `/collections?search=${encodeURIComponent(projectName)}&limit=5`;
      case 'magiceden':
        return `/collections?offset=0&limit=20`;
      default:
        return `/search?q=${encodeURIComponent(projectName)}`;
    }
  }

  private getNFTHeaders(apiName: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'DYOR-BOT/1.0'
    };

    switch (apiName) {
      case 'opensea':
        if (process.env.OPENSEA_API_KEY) {
          headers['X-API-KEY'] = process.env.OPENSEA_API_KEY;
        }
        break;
      case 'magiceden':
        if (process.env.MAGIC_EDEN_API_KEY) {
          headers['Authorization'] = `Bearer ${process.env.MAGIC_EDEN_API_KEY}`;
        }
        break;
    }

    return headers;
  }

  private parseNFTResults(data: any, apiName: string): any[] {
    switch (apiName) {
      case 'opensea':
        return this.parseOpenSeaResults(data);
      case 'magiceden':
        return this.parseMagicEdenResults(data);
      default:
        return [];
    }
  }

  private parseOpenSeaResults(data: any): any[] {
    if (!data.collections) return [];
    
    return data.collections.map((collection: any) => ({
      collectionName: collection.name,
      marketplace: 'opensea',
      collectionUrl: `https://opensea.io/collection/${collection.slug}`,
      floorPrice: collection.stats?.floor_price || 0,
      listedCount: collection.stats?.num_listings || 0,
      network: 'ETHEREUM'
    }));
  }

  private parseMagicEdenResults(data: any): any[] {
    if (!Array.isArray(data)) return [];
    
    return data.map((collection: any) => ({
      collectionName: collection.name,
      marketplace: 'magiceden',
      collectionUrl: `https://magiceden.io/collections/${collection.symbol}`,
      floorPrice: collection.floorPrice || 0,
      listedCount: collection.listedCount || 0,
      network: 'SOLANA'
    }));
  }
}

// Example 3: Enhanced Blockchain Service with API Manager
export class EnhancedBlockchainService {
  private apiManager = universalAPIManager;

  async getTokenData(contractAddress: string, chain: string = 'ethereum'): Promise<any> {
    console.log(`⛓️ Enhanced blockchain data for: ${contractAddress} on ${chain}`);
    
    // Get optimal API coordination for blockchain data
    const coordination = this.apiManager.getOptimalAPICoordination('blockchain', {
      maxCost: 0.01,
      maxLatency: 5000,
      minSuccessRate: 90
    });

    console.log(`📊 Using ${coordination.primaryAPI} for blockchain data (confidence: ${(coordination.confidence * 100).toFixed(1)}%)`);

    try {
      const response = await this.apiManager.makeAPICall(
        coordination.primaryAPI,
        this.getBlockchainEndpoint(coordination.primaryAPI, contractAddress, chain),
        { method: 'GET' },
        'high'
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseBlockchainResults(data, coordination.primaryAPI);
      } else {
        throw new Error(`Blockchain API failed: ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ Primary blockchain API failed: ${(error as Error).message}`);
      
      // Try fallback APIs
      for (const fallbackAPI of coordination.fallbackAPIs) {
        try {
          console.log(`🔄 Trying blockchain fallback: ${fallbackAPI}`);
          const response = await this.apiManager.makeAPICall(
            fallbackAPI,
            this.getBlockchainEndpoint(fallbackAPI, contractAddress, chain),
            { method: 'GET' },
            'medium'
          );

          if (response.ok) {
            const data = await response.json();
            return this.parseBlockchainResults(data, fallbackAPI);
          }
        } catch (fallbackError) {
          console.log(`❌ Blockchain fallback ${fallbackAPI} failed: ${(fallbackError as Error).message}`);
        }
      }

      throw new Error('All blockchain APIs failed');
    }
  }

  private getBlockchainEndpoint(apiName: string, contractAddress: string, chain: string): string {
    const apiKey = this.getAPIKey(apiName);
    
    switch (apiName) {
      case 'etherscan':
        return `?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${apiKey}`;
      case 'bscscan':
        return `?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${apiKey}`;
      case 'polygonscan':
        return `?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${apiKey}`;
      case 'snowtrace':
        return `?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${apiKey}`;
      default:
        return `?address=${contractAddress}`;
    }
  }

  private getAPIKey(apiName: string): string {
    switch (apiName) {
      case 'etherscan':
        return process.env.ETHERSCAN_API_KEY || '';
      case 'bscscan':
        return process.env.BSCSCAN_API_KEY || '';
      case 'polygonscan':
        return process.env.POLYGONSCAN_API_KEY || '';
      case 'snowtrace':
        return process.env.SNOWTRACE_API_KEY || '';
      default:
        return '';
    }
  }

  private parseBlockchainResults(data: any, apiName: string): any {
    switch (apiName) {
      case 'etherscan':
      case 'bscscan':
      case 'polygonscan':
      case 'snowtrace':
        return this.parseExplorerResults(data);
      default:
        return data;
    }
  }

  private parseExplorerResults(data: any): any {
    if (data.status === '1' && data.result && data.result.length > 0) {
      const token = data.result[0];
      return {
        name: token.tokenName,
        symbol: token.symbol,
        decimals: parseInt(token.divisor),
        totalSupply: token.totalSupply,
        contractAddress: token.contractAddress
      };
    }
    return null;
  }
}

// Example 4: API Manager Dashboard
export class APIManagerDashboard {
  private apiManager = universalAPIManager;

  getDashboardData(): {
    status: any;
    recommendations: string[];
    usageStats: any;
    apiHealth: { [apiName: string]: 'healthy' | 'warning' | 'critical' };
  } {
    const status = this.apiManager.getAPIStatus();
    const usageStats = this.apiManager.getUsageStatistics();
    
    // Determine API health
    const apiHealth: { [apiName: string]: 'healthy' | 'warning' | 'critical' } = {};
    
    status.apis.forEach(api => {
      if (api.isThrottled || api.successRate < 70) {
        apiHealth[api.apiName] = 'critical';
      } else if (api.successRate < 90 || api.averageResponseTime > 5000) {
        apiHealth[api.apiName] = 'warning';
      } else {
        apiHealth[api.apiName] = 'healthy';
      }
    });

    return {
      status,
      recommendations: status.recommendations,
      usageStats,
      apiHealth
    };
  }

  printDashboard(): void {
    const dashboard = this.getDashboardData();
    
    console.log('\n📊 API Manager Dashboard');
    console.log('='.repeat(50));
    
    console.log('\n🔍 API Health Status:');
    Object.entries(dashboard.apiHealth).forEach(([api, health]) => {
      const icon = health === 'healthy' ? '✅' : health === 'warning' ? '⚠️' : '❌';
      console.log(`   ${icon} ${api}: ${health.toUpperCase()}`);
    });
    
    console.log('\n📈 Usage Statistics:');
    console.log(`   Total Requests: ${dashboard.usageStats.totalRequests}`);
    console.log(`   Success Rate: ${((dashboard.usageStats.successfulRequests / dashboard.usageStats.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   Average Response Time: ${dashboard.usageStats.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Total Cost: $${dashboard.usageStats.totalCost.toFixed(4)}`);
    
    if (dashboard.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      dashboard.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Export enhanced services
export const enhancedSearchService = new EnhancedSearchService();
export const enhancedNFTService = new EnhancedNFTService();
export const enhancedBlockchainService = new EnhancedBlockchainService();
export const apiManagerDashboard = new APIManagerDashboard();
