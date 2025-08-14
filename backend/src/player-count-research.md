# Player Count Data Research - Web2 Games

## 🎯 **Objective**
Find reliable APIs and data sources to get real-time player count and lobby status for Web2 games.

## 📊 **Available Data Sources**

### **1. Steam Player Count APIs**

#### **Steam Web API (Unofficial)**
- **Endpoint**: `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid={appid}`
- **Example**: `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=730` (CS:GO)
- **Response**: `{"response":{"player_count":123456,"result":1}}`
- **Limitations**: 
  - Requires Steam App ID (not always easy to find)
  - Rate limited
  - No historical data
  - Only current players, not lobby status

#### **Steam Charts API**
- **Endpoint**: `https://steamcharts.com/api/v1/apps/{appid}/players`
- **Features**: Historical data, peak players, average players
- **Limitations**: Not real-time, 15-minute delay

#### **SteamDB API**
- **Endpoint**: `https://steamdb.info/api/GetGraph/?type=concurrent&appid={appid}`
- **Features**: Real-time concurrent players
- **Limitations**: Rate limited, requires app ID

### **2. Epic Games Store**
- **Status**: ❌ No public API for player counts
- **Alternative**: Web scraping Epic store pages (limited data)

### **3. Battle.net/Blizzard Games**
- **Status**: ❌ No public API
- **Alternative**: Community websites like WoW Census

### **4. Riot Games (League of Legends, Valorant)**
- **Status**: ❌ No public player count API
- **Alternative**: Third-party sites like op.gg

### **5. EA Games (Apex Legends, FIFA)**
- **Status**: ❌ No public API
- **Alternative**: Community trackers

### **6. Third-Party Aggregators**

#### **SteamSpy**
- **API**: Limited, requires registration
- **Data**: Ownership estimates, not real-time players

#### **Steam Charts**
- **Web Scraping**: Possible but rate limited
- **Data**: Historical trends, not real-time

#### **PCGamesN Player Count Tracker**
- **Status**: Web scraping required
- **Coverage**: Multiple platforms

## 🔧 **Implementation Strategy**

### **Phase 1: Steam Integration (High Priority)**
```typescript
interface SteamPlayerData {
  appId: string;
  currentPlayers: number;
  peak24h: number;
  timestamp: Date;
  gameName: string;
}

async function getSteamPlayerCount(appId: string): Promise<SteamPlayerData> {
  // Use Steam Web API
  const response = await fetch(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
  const data = await response.json();
  
  return {
    appId,
    currentPlayers: data.response.player_count,
    peak24h: 0, // Would need additional API call
    timestamp: new Date(),
    gameName: '' // Would need additional API call
  };
}
```

### **Phase 2: Game ID Discovery**
```typescript
interface GameIDMapping {
  gameName: string;
  steamAppId?: string;
  epicProductId?: string;
  gogProductId?: string;
}

// Common game mappings
const GAME_ID_MAPPINGS: GameIDMapping[] = [
  { gameName: "Counter-Strike 2", steamAppId: "730" },
  { gameName: "Dota 2", steamAppId: "570" },
  { gameName: "PUBG: BATTLEGROUNDS", steamAppId: "578080" },
  { gameName: "Team Fortress 2", steamAppId: "440" },
  { gameName: "Grand Theft Auto V", steamAppId: "271590" },
  { gameName: "Rust", steamAppId: "252490" },
  { gameName: "ARK: Survival Evolved", steamAppId: "346110" },
  { gameName: "Fallout 4", steamAppId: "377160" },
  { gameName: "The Witcher 3: Wild Hunt", steamAppId: "292030" },
  { gameName: "Red Dead Redemption 2", steamAppId: "1174180" }
];
```

### **Phase 3: Web Scraping Fallbacks**
```typescript
async function scrapePlayerCount(gameName: string): Promise<number | null> {
  // Try Steam Charts
  // Try PCGamesN
  // Try other community sites
  return null;
}
```

## 🚀 **Recommended Implementation**

### **1. Steam API Integration (Immediate)**
- ✅ **Feasible**: Steam Web API is reliable
- ✅ **Data Quality**: Real-time, accurate
- ✅ **Coverage**: Most popular PC games
- ⚠️ **Limitation**: Requires Steam App ID mapping

### **2. Game ID Database (High Priority)**
- Create comprehensive mapping of game names to Steam App IDs
- Include popular games from our test cases
- Allow manual additions

### **3. Fallback Scraping (Medium Priority)**
- Steam Charts scraping for historical data
- Community site scraping for additional games
- Rate limiting and error handling

### **4. Lobby Status (Future)**
- Most games don't provide public lobby APIs
- Would require game-specific implementations
- High complexity, low return

## 📈 **Expected Results**

### **Coverage Estimate**
- **Steam Games**: ~80% of popular PC games
- **Other Platforms**: ~20% via scraping
- **Overall**: ~60% of Web2 games we might research

### **Data Quality**
- **Real-time**: ✅ Steam API
- **Historical**: ✅ Steam Charts
- **Lobby Status**: ❌ Not available

### **Implementation Time**
- **Phase 1**: 2-3 hours (Steam API + basic mappings)
- **Phase 2**: 1-2 hours (expand game mappings)
- **Phase 3**: 4-6 hours (scraping fallbacks)

## 🎯 **Recommendation**

**Implement Phase 1 immediately** - Steam API integration with a curated list of popular game mappings. This will provide real-time player counts for the majority of PC games we're likely to research.

**Benefits:**
- High impact for Web2 game research
- Reliable, real-time data
- Relatively simple implementation
- Covers most popular games

**Next Steps:**
1. Create Steam API integration
2. Build game name to App ID mapping
3. Test with popular games
4. Add to our data point testing framework
