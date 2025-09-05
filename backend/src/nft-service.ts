// Enhanced NFT Service with Universal API Manager
// Handles NFT data collection for web3 games with intelligent API coordination

import { universalAPIManager } from './universal-api-manager';

interface NFTCollectionData {
  collectionName: string;
  marketplace: 'opensea' | 'magiceden' | 'other';
  collectionUrl: string;
  floorPrice?: number;
  floorPriceCurrency?: string;
  totalSupply?: number;
  network: 'ethereum' | 'solana' | 'other';
  description?: string;
  imageUrl?: string;
  volume24h?: number;
  volumeTotal?: number;
  owners?: number;
  listed?: number;
  lifetimeValue?: NFTLifetimeValue;
}

interface NFTLifetimeValue {
  totalVolume: number;
  totalSales: number;
  averagePrice: number;
  highestSale: number;
  lowestSale: number;
  priceHistory: PricePoint[];
  volumeHistory: VolumePoint[];
}

interface PricePoint {
  date: string;
  price: number;
  currency: string;
}

interface VolumePoint {
  date: string;
  volume: number;
  sales: number;
}

interface OpenSeaCollectionResponse {
  collection: {
    name: string;
    description: string;
    image_url: string;
    stats: {
      floor_price: number;
      total_supply: number;
      num_owners: number;
      total_volume: number;
      one_day_volume: number;
      one_day_sales: number;
      one_day_average_price: number;
    };
  };
}

interface MagicEdenCollectionResponse {
  name: string;
  description: string;
  image: string;
  floor: number;
  supply: number;
  volume24h: number;
  volumeTotal: number;
  listed: number;
}

export class NFTService {
  private static instance: NFTService;
  private readonly OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
  private readonly MAGIC_EDEN_API_KEY = process.env.MAGIC_EDEN_API_KEY;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  async searchNFTs(projectName: string): Promise<NFTCollectionData[]> {
    const cacheKey = `nft_search_${projectName.toLowerCase()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.timestamp) {
      console.log(`📋 Using cached NFT data for: ${projectName}`);
      return cached.data;
    }

    console.log(`🎨 Enhanced NFT search for: ${projectName}`);
    
    // Get optimal API coordination for NFT search
    const coordination = universalAPIManager.getOptimalAPICoordination('nft', {
      maxCost: 0.01,
      maxLatency: 10000,
      minSuccessRate: 85
    });

    console.log(`📊 Using ${coordination.primaryAPI} for NFT search (confidence: ${(coordination.confidence * 100).toFixed(1)}%)`);
    
    const results: NFTCollectionData[] = [];
    
    try {
      // Try primary API first
      const primaryResults = await this.searchWithAPI(coordination.primaryAPI, projectName);
      results.push(...primaryResults);
      console.log(`✅ Found ${primaryResults.length} results from ${coordination.primaryAPI}`);

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
      
      // Cache results
      this.cache.set(cacheKey, { data: results, timestamp: Date.now() + this.CACHE_DURATION });
      
      console.log(`✅ Found ${results.length} NFT collections for ${projectName}`);
      return results;
      
    } catch (error) {
      console.error(`❌ Error searching NFTs for ${projectName}:`, error);
      return [];
    }
  }

  // Enhanced method to search with Universal API Manager
  private async searchWithAPI(apiName: string, projectName: string): Promise<NFTCollectionData[]> {
    const endpoint = this.getNFTEndpoint(apiName, projectName);
    
    const response = await universalAPIManager.makeAPICall(
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

  // Helper method to get NFT endpoint for different APIs
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

  // Helper method to get NFT headers for different APIs
  private getNFTHeaders(apiName: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'DYOR-BOT/1.0'
    };

    switch (apiName) {
      case 'opensea':
        if (this.OPENSEA_API_KEY) {
          headers['X-API-KEY'] = this.OPENSEA_API_KEY;
        }
        break;
      case 'magiceden':
        if (this.MAGIC_EDEN_API_KEY) {
          headers['Authorization'] = `Bearer ${this.MAGIC_EDEN_API_KEY}`;
        }
        break;
    }

    return headers;
  }

  // Helper method to parse NFT results based on API type
  private parseNFTResults(data: any, apiName: string): NFTCollectionData[] {
    switch (apiName) {
      case 'opensea':
        return this.parseOpenSeaResults(data);
      case 'magiceden':
        return this.parseMagicEdenResults(data);
      default:
        return [];
    }
  }

  // Parse OpenSea API results
  private parseOpenSeaResults(data: any): NFTCollectionData[] {
    if (!data.collections || !Array.isArray(data.collections)) {
      return [];
    }

    const results: NFTCollectionData[] = [];
    
    for (const collection of data.collections.slice(0, 5)) {
      if (collection.name && collection.stats) {
        const slug = collection.slug || collection.name.toLowerCase().replace(/\s+/g, '-');
        
        results.push({
          collectionName: collection.name,
          marketplace: 'opensea',
          collectionUrl: `https://opensea.io/collection/${slug}`,
          floorPrice: collection.stats.floor_price || 0,
          floorPriceCurrency: 'ETH',
          totalSupply: collection.stats.total_supply || null,
          network: 'ethereum',
          description: collection.description || '',
          imageUrl: collection.image_url || '',
          volume24h: collection.stats.one_day_volume || 0,
          volumeTotal: collection.stats.total_volume || 0,
          owners: collection.stats.num_owners || 0,
          listed: collection.stats.num_listings || 0
        });
      }
    }
    
    return results;
  }

  // Parse Magic Eden API results
  private parseMagicEdenResults(data: any): NFTCollectionData[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const results: NFTCollectionData[] = [];
    
    for (const collection of data.slice(0, 5)) {
      if (collection.name) {
        const symbol = collection.symbol || collection.name.toLowerCase().replace(/\s+/g, '');
        
        results.push({
          collectionName: collection.name,
          marketplace: 'magiceden',
          collectionUrl: `https://magiceden.io/collections/${symbol}`,
          floorPrice: collection.floorPrice || 0,
          floorPriceCurrency: 'SOL',
          totalSupply: collection.supply || null,
          network: 'solana',
          description: collection.description || '',
          imageUrl: collection.image || '',
          volume24h: collection.volume24h || 0,
          volumeTotal: collection.volumeTotal || 0,
          owners: collection.owners || 0,
          listed: collection.listedCount || 0
        });
      }
    }
    
    return results;
  }

  private async searchOpenSea(projectName: string): Promise<NFTCollectionData[]> {
    try {
      // OpenSea API v2 endpoint for collection search
      const searchUrl = `https://api.opensea.io/api/v2/collections?search=${encodeURIComponent(projectName)}&limit=5`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (this.OPENSEA_API_KEY) {
        headers['X-API-KEY'] = this.OPENSEA_API_KEY;
      }
      
      const response = await fetch(searchUrl, { headers });
      
      if (!response.ok) {
        console.warn(`⚠️ OpenSea API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      const collections = data.collections || [];
      
      const results: NFTCollectionData[] = [];
      
      for (const collection of collections) {
        try {
          const collectionData = await this.getOpenSeaCollectionData(collection.slug);
          if (collectionData) {
            results.push(collectionData);
          }
        } catch (error) {
          console.warn(`⚠️ Error fetching OpenSea collection ${collection.slug}:`, error);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ OpenSea search error:', error);
      return [];
    }
  }

  private async searchMagicEden(projectName: string): Promise<NFTCollectionData[]> {
    try {
      // Magic Eden API endpoint for collections (with proper pagination)
      const searchUrl = `https://api-mainnet.magiceden.io/v2/collections?offset=0&limit=20`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (this.MAGIC_EDEN_API_KEY) {
        headers['Authorization'] = `Bearer ${this.MAGIC_EDEN_API_KEY}`;
      }
      
      const response = await fetch(searchUrl, { headers });
      
      if (!response.ok) {
        console.warn(`⚠️ Magic Eden API error: ${response.status}`);
        return [];
      }
      
      const collections = await response.json();
      
      // Filter collections by project name (case-insensitive)
      const filteredCollections = collections.filter((collection: any) => 
        collection.name && collection.name.toLowerCase().includes(projectName.toLowerCase())
      );
      
      const results: NFTCollectionData[] = [];
      
      // Limit to top 5 matches
      for (const collection of filteredCollections.slice(0, 5)) {
        try {
          const collectionData = await this.getMagicEdenCollectionData(collection.symbol);
          if (collectionData) {
            results.push(collectionData);
          }
        } catch (error) {
          console.warn(`⚠️ Error fetching Magic Eden collection ${collection.symbol}:`, error);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Magic Eden search error:', error);
      return [];
    }
  }

  private async getOpenSeaCollectionData(slug: string): Promise<NFTCollectionData | null> {
    try {
      const url = `https://api.opensea.io/api/v2/collection/${slug}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (this.OPENSEA_API_KEY) {
        headers['X-API-KEY'] = this.OPENSEA_API_KEY;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return null;
      }
      
      const data: any = await response.json();
      const collection = data.collection;
      const stats = collection.stats;
      
      // Get lifetime value data
      const lifetimeValue = await this.getOpenSeaLifetimeValue(slug);
      
      return {
        collectionName: collection.name,
        marketplace: 'opensea',
        collectionUrl: `https://opensea.io/collection/${slug}`,
        floorPrice: stats.floor_price,
        floorPriceCurrency: 'ETH',
        totalSupply: stats.total_supply,
        network: 'ethereum',
        description: collection.description,
        imageUrl: collection.image_url,
        volume24h: stats.one_day_volume,
        volumeTotal: stats.total_volume,
        owners: stats.num_owners,
        lifetimeValue: lifetimeValue || undefined
      };
      
    } catch (error) {
      console.error(`❌ Error fetching OpenSea collection data for ${slug}:`, error);
      return null;
    }
  }

  private async getMagicEdenCollectionData(symbol: string): Promise<NFTCollectionData | null> {
    try {
      // Get collection info and stats
      const [collectionResponse, statsResponse] = await Promise.all([
        fetch(`https://api-mainnet.magiceden.io/v2/collections/${symbol}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DYOR-BOT/1.0',
            ...(this.MAGIC_EDEN_API_KEY && { 'Authorization': `Bearer ${this.MAGIC_EDEN_API_KEY}` })
          }
        }),
        fetch(`https://api-mainnet.magiceden.io/v2/collections/${symbol}/stats`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DYOR-BOT/1.0',
            ...(this.MAGIC_EDEN_API_KEY && { 'Authorization': `Bearer ${this.MAGIC_EDEN_API_KEY}` })
          }
        })
      ]);
      
      if (!collectionResponse.ok || !statsResponse.ok) {
        return null;
      }
      
      const collectionData = await collectionResponse.json();
      const statsData = await statsResponse.json();
      
      // Get lifetime value data
      const lifetimeValue = await this.getMagicEdenLifetimeValue(symbol);
      
      return {
        collectionName: collectionData.name,
        marketplace: 'magiceden',
        collectionUrl: `https://magiceden.io/collections/${symbol}`,
        floorPrice: statsData.floorPrice,
        floorPriceCurrency: 'SOL',
        totalSupply: collectionData.supply || null,
        network: 'solana',
        description: collectionData.description,
        imageUrl: collectionData.image,
        volume24h: statsData.volume24hr || null,
        volumeTotal: statsData.volumeAll || null,
        listed: statsData.listedCount || null,
        lifetimeValue: lifetimeValue || undefined
      };
      
    } catch (error) {
      console.error(`❌ Error fetching Magic Eden collection data for ${symbol}:`, error);
      return null;
    }
  }

  private async getOpenSeaLifetimeValue(slug: string): Promise<NFTLifetimeValue | null> {
    try {
      // Get sales history for lifetime value calculation
      const url = `https://api.opensea.io/api/v2/events?collection_slug=${slug}&event_type=successful&limit=100`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (this.OPENSEA_API_KEY) {
        headers['X-API-KEY'] = this.OPENSEA_API_KEY;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const sales = data.asset_events || [];
      
      if (sales.length === 0) {
        return null;
      }
      
      // Calculate lifetime value metrics
      const prices = sales.map((sale: any) => parseFloat(sale.payment.amount) / Math.pow(10, sale.payment.decimals));
      const totalVolume = prices.reduce((sum: number, price: number) => sum + price, 0);
      const totalSales = sales.length;
      const averagePrice = totalVolume / totalSales;
      const highestSale = Math.max(...prices);
      const lowestSale = Math.min(...prices);
      
      // Create price and volume history
      const priceHistory: PricePoint[] = sales.slice(-30).map((sale: any) => ({
        date: new Date(sale.event_timestamp).toISOString().split('T')[0],
        price: parseFloat(sale.payment.amount) / Math.pow(10, sale.payment.decimals),
        currency: 'ETH'
      }));
      
      const volumeHistory: VolumePoint[] = sales.slice(-30).map((sale: any) => ({
        date: new Date(sale.event_timestamp).toISOString().split('T')[0],
        volume: parseFloat(sale.payment.amount) / Math.pow(10, sale.payment.decimals),
        sales: 1
      }));
      
      return {
        totalVolume,
        totalSales,
        averagePrice,
        highestSale,
        lowestSale,
        priceHistory,
        volumeHistory
      };
      
    } catch (error) {
      console.error(`❌ Error fetching OpenSea lifetime value for ${slug}:`, error);
      return null;
    }
  }

  private async getMagicEdenLifetimeValue(symbol: string): Promise<NFTLifetimeValue | null> {
    try {
      // Get sales history for lifetime value calculation
      const url = `https://api-mainnet.magiceden.io/v2/collections/${symbol}/activities?offset=0&limit=100`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (this.MAGIC_EDEN_API_KEY) {
        headers['Authorization'] = `Bearer ${this.MAGIC_EDEN_API_KEY}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const sales = data.activities?.filter((activity: any) => activity.type === 'buyNow') || [];
      
      if (sales.length === 0) {
        return null;
      }
      
      // Calculate lifetime value metrics
      const prices = sales.map((sale: any) => sale.price);
      const totalVolume = prices.reduce((sum: number, price: number) => sum + price, 0);
      const totalSales = sales.length;
      const averagePrice = totalVolume / totalSales;
      const highestSale = Math.max(...prices);
      const lowestSale = Math.min(...prices);
      
      // Create price and volume history
      const priceHistory: PricePoint[] = sales.slice(-30).map((sale: any) => ({
        date: new Date(sale.blockTime * 1000).toISOString().split('T')[0],
        price: sale.price,
        currency: 'SOL'
      }));
      
      const volumeHistory: VolumePoint[] = sales.slice(-30).map((sale: any) => ({
        date: new Date(sale.blockTime * 1000).toISOString().split('T')[0],
        volume: sale.price,
        sales: 1
      }));
      
      return {
        totalVolume,
        totalSales,
        averagePrice,
        highestSale,
        lowestSale,
        priceHistory,
        volumeHistory
      };
      
    } catch (error) {
      console.error(`❌ Error fetching Magic Eden lifetime value for ${symbol}:`, error);
      return null;
    }
  }

  // Get the NFT with highest volume or floor price from a collection
  getTopNFT(collections: NFTCollectionData[]): NFTCollectionData | null {
    if (collections.length === 0) return null;
    
    // Sort by volume (if available) or floor price
    const sorted = collections.sort((a, b) => {
      const aValue = a.volumeTotal || a.floorPrice || 0;
      const bValue = b.volumeTotal || b.floorPrice || 0;
      return bValue - aValue;
    });
    
    return sorted[0];
  }
}

export type { NFTCollectionData, NFTLifetimeValue, PricePoint, VolumePoint };
