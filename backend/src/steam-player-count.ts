// Steam Player Count Service
// Provides real-time player count data for Steam games

interface SteamPlayerData {
  appId: string;
  currentPlayers: number;
  peak24h?: number;
  timestamp: Date;
  gameName: string;
  success: boolean;
  error?: string;
}

interface GameIDMapping {
  gameName: string;
  steamAppId: string;
  aliases?: string[];
}

// Comprehensive mapping of popular games to Steam App IDs
const STEAM_GAME_MAPPINGS: GameIDMapping[] = [
  // Most Popular Games
  { gameName: "Counter-Strike 2", steamAppId: "730", aliases: ["CS2", "CS:GO", "Counter-Strike: Global Offensive"] },
  { gameName: "Dota 2", steamAppId: "570", aliases: ["DOTA 2"] },
  { gameName: "PUBG: BATTLEGROUNDS", steamAppId: "578080", aliases: ["PUBG", "PlayerUnknown's Battlegrounds"] },
  { gameName: "Team Fortress 2", steamAppId: "440", aliases: ["TF2"] },
  { gameName: "Grand Theft Auto V", steamAppId: "271590", aliases: ["GTA V", "GTA 5"] },
  { gameName: "Rust", steamAppId: "252490" },
  { gameName: "ARK: Survival Evolved", steamAppId: "346110", aliases: ["ARK"] },
  { gameName: "Fallout 4", steamAppId: "377160" },
  { gameName: "The Witcher 3: Wild Hunt", steamAppId: "292030", aliases: ["The Witcher 3"] },
  { gameName: "Red Dead Redemption 2", steamAppId: "1174180", aliases: ["RDR2"] },
  
  // Popular Multiplayer Games
  { gameName: "Rocket League", steamAppId: "252950" },
  { gameName: "Rainbow Six Siege", steamAppId: "359550", aliases: ["R6 Siege", "R6"] },
  { gameName: "Destiny 2", steamAppId: "1085660" },
  { gameName: "Warframe", steamAppId: "230410" },
  { gameName: "Path of Exile", steamAppId: "238960", aliases: ["PoE"] },
  { gameName: "War Thunder", steamAppId: "236390" },
  { gameName: "World of Tanks", steamAppId: "1407200" },
  { gameName: "World of Warships", steamAppId: "552990" },
  { gameName: "Escape from Tarkov", steamAppId: "311210" },
  { gameName: "Dead by Daylight", steamAppId: "381210", aliases: ["DbD"] },
  
  // Battle Royale Games
  { gameName: "Apex Legends", steamAppId: "1172470" },
  { gameName: "Fortnite", steamAppId: "1172470" }, // Note: Fortnite is Epic exclusive
  { gameName: "Call of Duty: Warzone", steamAppId: "1985810" },
  
  // Strategy Games
  { gameName: "Civilization VI", steamAppId: "289070", aliases: ["Civ 6", "Civilization 6"] },
  { gameName: "Europa Universalis IV", steamAppId: "236850", aliases: ["EU4"] },
  { gameName: "Crusader Kings III", steamAppId: "1158310", aliases: ["CK3"] },
  { gameName: "Stellaris", steamAppId: "281990" },
  { gameName: "Hearts of Iron IV", steamAppId: "394360", aliases: ["HOI4"] },
  
  // Simulation Games
  { gameName: "Euro Truck Simulator 2", steamAppId: "227300", aliases: ["ETS2"] },
  { gameName: "American Truck Simulator", steamAppId: "270880", aliases: ["ATS"] },
  { gameName: "Farming Simulator 22", steamAppId: "1248130", aliases: ["FS22"] },
  { gameName: "Microsoft Flight Simulator", steamAppId: "1250410", aliases: ["MSFS"] },
  
  // Indie Games
  { gameName: "Among Us", steamAppId: "945360" },
  { gameName: "Phasmophobia", steamAppId: "739630" },
  { gameName: "Valheim", steamAppId: "892970" },
  { gameName: "Hades", steamAppId: "1145360" },
  { gameName: "Stardew Valley", steamAppId: "413150" },
  
  // Classic Games
  { gameName: "Terraria", steamAppId: "105600" },
  { gameName: "Minecraft", steamAppId: "322330" }, // Java Edition
  { gameName: "Portal 2", steamAppId: "620" },
  { gameName: "Half-Life 2", steamAppId: "220" },
  { gameName: "Left 4 Dead 2", steamAppId: "550" },
  
  // Recent Popular Games
  { gameName: "Baldur's Gate 3", steamAppId: "1086940", aliases: ["BG3"] },
  { gameName: "Cyberpunk 2077", steamAppId: "1091500" },
  { gameName: "Elden Ring", steamAppId: "1245620" },
  { gameName: "Hogwarts Legacy", steamAppId: "990080" },
  { gameName: "Starfield", steamAppId: "1716740" }
];

export class SteamPlayerCountService {
  private static instance: SteamPlayerCountService;
  private cache: Map<string, { data: SteamPlayerData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (Steam data updates frequently)

  static getInstance(): SteamPlayerCountService {
    if (!SteamPlayerCountService.instance) {
      SteamPlayerCountService.instance = new SteamPlayerCountService();
    }
    return SteamPlayerCountService.instance;
  }

  /**
   * Find Steam App ID for a game name
   */
  findSteamAppId(gameName: string): string | null {
    const normalizedName = gameName.toLowerCase().trim();
    
    // Direct match
    const directMatch = STEAM_GAME_MAPPINGS.find(mapping => 
      mapping.gameName.toLowerCase() === normalizedName
    );
    if (directMatch) return directMatch.steamAppId;
    
    // Alias match
    const aliasMatch = STEAM_GAME_MAPPINGS.find(mapping => 
      mapping.aliases?.some(alias => alias.toLowerCase() === normalizedName)
    );
    if (aliasMatch) return aliasMatch.steamAppId;
    
    // Partial match (for games with similar names)
    const partialMatch = STEAM_GAME_MAPPINGS.find(mapping => 
      mapping.gameName.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(mapping.gameName.toLowerCase()) ||
      mapping.aliases?.some(alias => 
        alias.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(alias.toLowerCase())
      )
    );
    if (partialMatch) return partialMatch.steamAppId;
    
    return null;
  }

  /**
   * Get current player count for a Steam game
   */
  async getPlayerCount(gameName: string): Promise<SteamPlayerData> {
    const appId = this.findSteamAppId(gameName);
    
    if (!appId) {
      return {
        appId: '',
        currentPlayers: 0,
        timestamp: new Date(),
        gameName,
        success: false,
        error: `Steam App ID not found for game: ${gameName}`
      };
    }

    // Check cache first
    const cacheKey = `steam_players_${appId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📋 Using cached Steam player count for: ${gameName} (${appId})`);
      return cached.data;
    }

    try {
      console.log(`🎮 Fetching Steam player count for: ${gameName} (${appId})`);
      
      const response = await fetch(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.response.result !== 1) {
        throw new Error(`Steam API error: ${data.response.result}`);
      }
      
      const playerData: SteamPlayerData = {
        appId,
        currentPlayers: data.response.player_count,
        timestamp: new Date(),
        gameName,
        success: true
      };
      
      // Cache the result
      this.cache.set(cacheKey, { data: playerData, timestamp: Date.now() });
      
      console.log(`✅ Steam player count for ${gameName}: ${data.response.player_count.toLocaleString()} players`);
      
      return playerData;
      
    } catch (error) {
      console.error(`❌ Failed to get Steam player count for ${gameName}:`, error);
      
      const errorData: SteamPlayerData = {
        appId,
        currentPlayers: 0,
        timestamp: new Date(),
        gameName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      return errorData;
    }
  }

  /**
   * Get player count for multiple games
   */
  async getMultiplePlayerCounts(gameNames: string[]): Promise<SteamPlayerData[]> {
    console.log(`🎮 Fetching Steam player counts for ${gameNames.length} games...`);
    
    const promises = gameNames.map(gameName => this.getPlayerCount(gameName));
    const results = await Promise.allSettled(promises);
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        appId: '',
        currentPlayers: 0,
        timestamp: new Date(),
        gameName: 'Unknown',
        success: false,
        error: result.reason?.message || 'Unknown error'
      }
    );
  }

  /**
   * Get all available game mappings
   */
  getAvailableGames(): GameIDMapping[] {
    return [...STEAM_GAME_MAPPINGS];
  }

  /**
   * Search for games by name (fuzzy search)
   */
  searchGames(query: string): GameIDMapping[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return STEAM_GAME_MAPPINGS.filter(mapping => 
      mapping.gameName.toLowerCase().includes(normalizedQuery) ||
      mapping.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))
    );
  }
}

// Export singleton instance
export const steamPlayerCountService = SteamPlayerCountService.getInstance();
