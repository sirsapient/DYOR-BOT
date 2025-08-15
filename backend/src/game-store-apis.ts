// Game Store API Integration for Steam, Epic, and GOG
// This service provides game information from major gaming platforms

interface GameStoreResult {
  platform: 'Steam' | 'Epic' | 'GOG' | 'Itch.io';
  gameId?: string;
  title: string;
  description?: string;
  genre?: string[];
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  price?: string;
  rating?: string;
  platforms?: string[];
  features?: string[];
  downloadUrl?: string;
  imageUrl?: string;
  tags?: string[];
  playerCount?: string;
  languages?: string[];
}

interface SteamAppDetails {
  success: boolean;
  data?: {
    name: string;
    detailed_description: string;
    short_description: string;
    categories: Array<{ description: string }>;
    genres: Array<{ description: string }>;
    release_date: { date: string };
    developers: string[];
    publishers: string[];
    platforms: { windows: boolean; mac: boolean; linux: boolean };
    metacritic?: { score: number };
    price_overview?: { final_formatted: string };
    header_image: string;
    screenshots: Array<{ path_thumbnail: string }>;
    movies: Array<{ thumbnail: string }>;
    background: string;
    recommendations: { total: number };
    achievements: { total: number };
    dlc: number[];
    legal_notice: string;
    drm_notice: string;
    ext_user_account_notice: string;
    fullgame: { appid: string; name: string };
    supported_languages: string;
    website: string;
    pc_requirements: { minimum: string; recommended: string };
    mac_requirements: { minimum: string; recommended: string };
    linux_requirements: { minimum: string; recommended: string };
  };
}

export class GameStoreAPIService {
  private static instance: GameStoreAPIService;
  private cache: Map<string, { results: GameStoreResult[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static getInstance(): GameStoreAPIService {
    if (!GameStoreAPIService.instance) {
      GameStoreAPIService.instance = new GameStoreAPIService();
    }
    return GameStoreAPIService.instance;
  }

  async searchGame(gameName: string): Promise<GameStoreResult[]> {
    const cacheKey = `game_search_${gameName.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📋 Using cached game store results for: ${gameName}`);
      return cached.results;
    }

    console.log(`🎮 Searching game stores for: ${gameName}`);
    
    const results: GameStoreResult[] = [];
    
    try {
      // Search all platforms in parallel
      const [steamResults, epicResults, gogResults, itchResults] = await Promise.allSettled([
        this.searchSteam(gameName),
        this.searchEpic(gameName),
        this.searchGOG(gameName),
        this.searchItchIO(gameName)
      ]);

      // Add successful results
      if (steamResults.status === 'fulfilled') {
        results.push(...steamResults.value);
      }
      if (epicResults.status === 'fulfilled') {
        results.push(...epicResults.value);
      }
      if (gogResults.status === 'fulfilled') {
        results.push(...gogResults.value);
      }
      if (itchResults.status === 'fulfilled') {
        results.push(...itchResults.value);
      }

      // Cache results
      this.cache.set(cacheKey, { results, timestamp: Date.now() });
      
      console.log(`✅ Found ${results.length} game store results for: ${gameName}`);
      return results;

    } catch (error) {
      console.error(`❌ Game store search failed for "${gameName}":`, error);
      return [];
    }
  }

  private async searchSteam(gameName: string): Promise<GameStoreResult[]> {
    try {
      console.log(`🔍 Searching Steam for: ${gameName}`);
      
      // First, search for the game to get app ID
      const searchUrl = `https://store.steampowered.com/api/storesearch?term=${encodeURIComponent(gameName)}&l=english&cc=US`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!searchResponse.ok) {
        console.log(`❌ Steam search failed: ${searchResponse.status}`);
        return [];
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        console.log(`❌ No Steam results found for: ${gameName}`);
        return [];
      }

      const results: GameStoreResult[] = [];
      
      // Get details for top 3 matches
      for (const item of searchData.items.slice(0, 3)) {
        try {
          const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${item.id}&cc=US`;
          
          const detailsResponse = await fetch(detailsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            }
          });

          if (!detailsResponse.ok) continue;

          const detailsData: { [key: string]: SteamAppDetails } = await detailsResponse.json();
          const appDetails = detailsData[item.id.toString()];

          if (!appDetails.success || !appDetails.data) continue;

          const data = appDetails.data;
          
          results.push({
            platform: 'Steam',
            gameId: item.id.toString(),
            title: data.name,
            description: data.short_description || data.detailed_description?.substring(0, 500),
            genre: data.genres?.map(g => g.description) || [],
            releaseDate: data.release_date?.date,
            developer: data.developers?.join(', '),
            publisher: data.publishers?.join(', '),
            price: data.price_overview?.final_formatted,
            rating: data.metacritic?.score?.toString(),
            platforms: this.getPlatforms(data.platforms),
            features: data.categories?.map(c => c.description) || [],
            downloadUrl: `https://store.steampowered.com/app/${item.id}`,
            imageUrl: data.header_image,
            tags: data.categories?.map(c => c.description) || [],
            playerCount: data.recommendations?.total?.toString(),
            languages: data.supported_languages?.split(', ') || []
          });

          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.log(`❌ Failed to get Steam details for ${item.id}:`, error);
        }
      }

      console.log(`✅ Found ${results.length} Steam results for: ${gameName}`);
      return results;

    } catch (error) {
      console.error(`❌ Steam search failed for "${gameName}":`, error);
      return [];
    }
  }

  private async searchEpic(gameName: string): Promise<GameStoreResult[]> {
    try {
      console.log(`🔍 Searching Epic Games Store for: ${gameName}`);
      
      // Epic Games Store search API
      const searchUrl = `https://store-site-backend-static.ak.epicgames.com/graphql`;
      
      const query = `
        query searchStoreQuery($category: String, $count: Int, $country: String, $keywords: String, $locale: String!, $sortBy: String, $sortDir: String, $withPriceType: String) {
          Catalog {
            searchStore(category: $category, count: $count, country: $country, keywords: $keywords, locale: $locale, sortBy: $sortBy, sortDir: $sortDir, withPriceType: $withPriceType) {
              elements {
                title
                id
                description
                keyImages {
                  url
                  type
                }
                seller {
                  name
                }
                productSlug
                urlSlug
                price(country: $country) {
                  totalPrice {
                    discountPrice
                    originalPrice
                    voucherDiscount
                    discount
                    currencyCode
                    currencyInfo {
                      decimals
                    }
                  }
                }
                tags {
                  id
                }
                catalogNs {
                  mappings(pageType: "productHome") {
                    page
                    catalog
                  }
                }
                offerMappings {
                  pageType
                  pageId
                }
                categories {
                  path
                }
                rating {
                  average
                  count
                }
                price(country: $country) {
                  totalPrice {
                    discountPrice
                    originalPrice
                    voucherDiscount
                    discount
                    currencyCode
                    currencyInfo {
                      decimals
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        category: "games/edition/base|bundles/games|editors",
        count: 5,
        country: "US",
        keywords: gameName,
        locale: "en-US",
        sortBy: "relevancy",
        sortDir: "DESC",
        withPriceType: "BASE|DISCOUNTED"
      };

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        console.log(`❌ Epic search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.data?.Catalog?.searchStore?.elements) {
        console.log(`❌ No Epic results found for: ${gameName}`);
        return [];
      }

      const results: GameStoreResult[] = data.data.Catalog.searchStore.elements.map((element: any) => ({
        platform: 'Epic',
        gameId: element.id,
        title: element.title,
        description: element.description,
        genre: element.categories?.map((c: any) => c.path) || [],
        developer: element.seller?.name,
        publisher: element.seller?.name,
        price: element.price?.totalPrice?.discountPrice ? 
          `$${(element.price.totalPrice.discountPrice / 100).toFixed(2)}` : 
          element.price?.totalPrice?.originalPrice ? 
          `$${(element.price.totalPrice.originalPrice / 100).toFixed(2)}` : undefined,
        rating: element.rating?.average?.toString(),
        platforms: ['PC'], // Epic is PC-only
        features: element.tags?.map((t: any) => t.id) || [],
        downloadUrl: `https://store.epicgames.com/p/${element.productSlug || element.urlSlug}`,
        imageUrl: element.keyImages?.find((img: any) => img.type === 'OfferImageWide')?.url,
        tags: element.tags?.map((t: any) => t.id) || [],
        playerCount: element.rating?.count?.toString()
      }));

      console.log(`✅ Found ${results.length} Epic results for: ${gameName}`);
      return results;

    } catch (error) {
      console.error(`❌ Epic search failed for "${gameName}":`, error);
      return [];
    }
  }

  private async searchGOG(gameName: string): Promise<GameStoreResult[]> {
    try {
      console.log(`🔍 Searching GOG for: ${gameName}`);
      
      // GOG search API
      const searchUrl = `https://www.gog.com/games/ajax/filtered?mediaType=game&search=${encodeURIComponent(gameName)}&sort=popularity`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        console.log(`❌ GOG search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.products || data.products.length === 0) {
        console.log(`❌ No GOG results found for: ${gameName}`);
        return [];
      }

      const results: GameStoreResult[] = data.products.slice(0, 3).map((product: any) => ({
        platform: 'GOG',
        gameId: product.id.toString(),
        title: product.title,
        description: product.summary,
        genre: product.genres || [],
        releaseDate: product.releaseDate,
        developer: product.developer,
        publisher: product.publisher,
        price: product.price?.amount ? `$${product.price.amount}` : undefined,
        rating: product.rating?.toString(),
        platforms: product.operatingSystems || [],
        features: product.features || [],
        downloadUrl: `https://www.gog.com/game/${product.slug}`,
        imageUrl: product.image,
        tags: product.tags || [],
        playerCount: product.rating?.toString(),
        languages: product.languages || []
      }));

      console.log(`✅ Found ${results.length} GOG results for: ${gameName}`);
      return results;

    } catch (error) {
      console.error(`❌ GOG search failed for "${gameName}":`, error);
      return [];
    }
  }

  private async searchItchIO(gameName: string): Promise<GameStoreResult[]> {
    try {
      console.log(`🔍 Searching Itch.io for: ${gameName}`);
      
      // Itch.io search API
      const searchUrl = `https://itch.io/api/1/search/games?query=${encodeURIComponent(gameName)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ Itch.io search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.games || data.games.length === 0) {
        console.log(`❌ No Itch.io results found for: ${gameName}`);
        return [];
      }

      const results: GameStoreResult[] = data.games.slice(0, 3).map((game: any) => ({
        platform: 'Itch.io',
        gameId: game.id.toString(),
        title: game.title,
        description: game.short_text,
        genre: game.genres || [],
        releaseDate: game.published_at,
        developer: game.user?.name,
        publisher: game.user?.name,
        price: game.price ? `$${game.price}` : 'Free',
        rating: game.rating?.toString(),
        platforms: game.platforms || [],
        features: game.tags || [],
        downloadUrl: game.url,
        imageUrl: game.cover_url,
        tags: game.tags || [],
        playerCount: game.rating?.toString(),
        languages: game.languages || []
      }));

      console.log(`✅ Found ${results.length} Itch.io results for: ${gameName}`);
      return results;

    } catch (error) {
      console.error(`❌ Itch.io search failed for "${gameName}":`, error);
      return [];
    }
  }

  private getPlatforms(platforms: any): string[] {
    const platformList: string[] = [];
    if (platforms.windows) platformList.push('Windows');
    if (platforms.mac) platformList.push('macOS');
    if (platforms.linux) platformList.push('Linux');
    return platformList;
  }

  // Web3 Game Fallback: Get game description from official website
  async getWeb3GameDescription(gameName: string, officialWebsite?: string): Promise<string | null> {
    console.log(`🌐 Attempting Web3 game description fallback for: ${gameName}`);
    
    try {
      // Try to get description from official website
      if (officialWebsite) {
        const description = await this.scrapeGameDescriptionFromWebsite(officialWebsite, gameName);
        if (description) {
          console.log(`✅ Found Web3 game description from official website`);
          return description;
        }
      }

      // Try common Web3 game website patterns
      const commonPatterns = [
        `https://${gameName.toLowerCase().replace(/\s+/g, '')}.com`,
        `https://${gameName.toLowerCase().replace(/\s+/g, '')}.io`,
        `https://${gameName.toLowerCase().replace(/\s+/g, '')}.game`,
        `https://www.${gameName.toLowerCase().replace(/\s+/g, '')}.com`,
        `https://www.${gameName.toLowerCase().replace(/\s+/g, '')}.io`,
        `https://www.${gameName.toLowerCase().replace(/\s+/g, '')}.game`
      ];

      for (const url of commonPatterns) {
        try {
          const description = await this.scrapeGameDescriptionFromWebsite(url, gameName);
          if (description) {
            console.log(`✅ Found Web3 game description from: ${url}`);
            return description;
          }
        } catch (error) {
          // Continue to next pattern
        }
      }

      console.log(`⚠️ No Web3 game description found for: ${gameName}`);
      return null;
    } catch (error) {
      console.log(`❌ Web3 game description fallback failed: ${error}`);
      return null;
    }
  }

  private async scrapeGameDescriptionFromWebsite(url: string, gameName: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      
      // Look for common description patterns
      const descriptionPatterns = [
        /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
        /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
        /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/p>/i,
        /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<section[^>]*class="[^"]*about[^"]*"[^>]*>([^<]+)<\/section>/i,
        /<div[^>]*class="[^"]*about[^"]*"[^>]*>([^<]+)<\/div>/i
      ];

      for (const pattern of descriptionPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const description = match[1].trim();
          if (description.length > 50 && description.length < 1000) {
            return description;
          }
        }
      }

      // Look for game-specific content
      const gameContentPatterns = [
        new RegExp(`${gameName}[^<]{50,500}`, 'i'),
        /play[^<]{50,500}/i,
        /game[^<]{50,500}/i,
        /experience[^<]{50,500}/i
      ];

      for (const pattern of gameContentPatterns) {
        const match = html.match(pattern);
        if (match && match[0]) {
          const content = match[0].trim();
          if (content.length > 100 && content.length < 1000) {
            return content;
          }
        }
      }

      return null;
    } catch (error) {
      console.log(`[ERROR] Failed to scrape description from ${url}: ${error}`);
      return null;
    }
  }

  // Helper method to extract game information for the main research system
  extractGameInfo(gameStoreResults: GameStoreResult[]): {
    gameGenre?: string;
    gameDescription?: string;
    platformAvailability?: string;
    gameFeatures?: string;
    downloadLinks?: string[];
    gameRating?: string;
    gamePrice?: string;
    gameDeveloper?: string;
    gamePublisher?: string;
    gameReleaseDate?: string;
  } {
    if (gameStoreResults.length === 0) {
      return {};
    }

    // Combine information from all platforms
    const allGenres = new Set<string>();
    const allFeatures = new Set<string>();
    const allPlatforms = new Set<string>();
    const downloadLinks: string[] = [];
    let bestDescription = '';
    let bestRating = '';
    let bestPrice = '';
    let bestDeveloper = '';
    let bestPublisher = '';
    let bestReleaseDate = '';

    for (const result of gameStoreResults) {
      // Collect genres
      if (result.genre) {
        result.genre.forEach(g => allGenres.add(g));
      }

      // Collect features
      if (result.features) {
        result.features.forEach(f => allFeatures.add(f));
      }

      // Collect platforms
      if (result.platforms) {
        result.platforms.forEach(p => allPlatforms.add(p));
      }

      // Collect download links
      if (result.downloadUrl) {
        downloadLinks.push(`${result.platform}: ${result.downloadUrl}`);
      }

      // Get best description (longest)
      if (result.description && result.description.length > bestDescription.length) {
        bestDescription = result.description;
      }

      // Get best rating (highest)
      if (result.rating && (!bestRating || parseFloat(result.rating) > parseFloat(bestRating))) {
        bestRating = result.rating;
      }

      // Get best price (lowest non-zero)
      if (result.price && result.price !== 'Free') {
        if (!bestPrice || result.price === 'Free' || parseFloat(result.price.replace('$', '')) < parseFloat(bestPrice.replace('$', ''))) {
          bestPrice = result.price;
        }
      } else if (result.price === 'Free' && !bestPrice) {
        bestPrice = 'Free';
      }

      // Get developer/publisher info
      if (result.developer && !bestDeveloper) {
        bestDeveloper = result.developer;
      }
      if (result.publisher && !bestPublisher) {
        bestPublisher = result.publisher;
      }

      // Get release date
      if (result.releaseDate && !bestReleaseDate) {
        bestReleaseDate = result.releaseDate;
      }
    }

    return {
      gameGenre: Array.from(allGenres).join(', '),
      gameDescription: bestDescription,
      platformAvailability: Array.from(allPlatforms).join(', '),
      gameFeatures: Array.from(allFeatures).join(', '),
      downloadLinks,
      gameRating: bestRating,
      gamePrice: bestPrice,
      gameDeveloper: bestDeveloper,
      gamePublisher: bestPublisher,
      gameReleaseDate: bestReleaseDate
    };
  }
}
