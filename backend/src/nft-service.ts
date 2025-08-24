// NFT Service for OpenSea and Magic Eden APIs
// Handles NFT data collection for web3 games

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

    console.log(`🔍 Searching NFTs for: ${projectName}`);
    
    const results: NFTCollectionData[] = [];
    
    try {
      // Search OpenSea (Ethereum)
      const openseaResults = await this.searchOpenSea(projectName);
      results.push(...openseaResults);
      
      // Search Magic Eden (Solana)
      const magicEdenResults = await this.searchMagicEden(projectName);
      results.push(...magicEdenResults);
      
      // Cache results
      this.cache.set(cacheKey, { data: results, timestamp: Date.now() + this.CACHE_DURATION });
      
      console.log(`✅ Found ${results.length} NFT collections for ${projectName}`);
      return results;
      
    } catch (error) {
      console.error(`❌ Error searching NFTs for ${projectName}:`, error);
      return [];
    }
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
      // Magic Eden API endpoint for collection search
      const searchUrl = `https://api-mainnet.magiceden.io/v2/collections?search=${encodeURIComponent(projectName)}&limit=5`;
      
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
      
      const results: NFTCollectionData[] = [];
      
      for (const collection of collections) {
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
      const url = `https://api-mainnet.magiceden.io/v2/collections/${symbol}/stats`;
      
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
      
      const data: MagicEdenCollectionResponse = await response.json();
      
      // Get lifetime value data
      const lifetimeValue = await this.getMagicEdenLifetimeValue(symbol);
      
      return {
        collectionName: data.name,
        marketplace: 'magiceden',
        collectionUrl: `https://magiceden.io/collections/${symbol}`,
        floorPrice: data.floor,
        floorPriceCurrency: 'SOL',
        totalSupply: data.supply,
        network: 'solana',
        description: data.description,
        imageUrl: data.image,
        volume24h: data.volume24h,
        volumeTotal: data.volumeTotal,
        listed: data.listed,
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
