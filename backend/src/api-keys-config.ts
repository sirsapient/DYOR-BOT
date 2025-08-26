// API Keys Configuration for DYOR BOT
// This file manages all API keys and provides fallback solutions

export interface APIKeyConfig {
  name: string;
  key: string | null;
  url: string;
  rateLimit: string;
  status: 'active' | 'missing' | 'limited';
  fallback?: string;
}

export interface BlockchainAPIStatus {
  chain: string;
  tokenData: 'available' | 'limited' | 'unavailable';
  transactionHistory: 'available' | 'limited' | 'unavailable';
  contractVerification: 'available' | 'limited' | 'unavailable';
  notes: string[];
}

// API Keys Configuration
export const API_KEYS: { [key: string]: APIKeyConfig } = {
  // High Priority APIs
  etherscan: {
    name: 'Etherscan',
    key: process.env.ETHERSCAN_API_KEY || null,
    url: 'https://etherscan.io/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.ETHERSCAN_API_KEY ? 'active' : 'missing',
    fallback: 'CoinGecko for basic token data'
  },
  
  bscscan: {
    name: 'BSCScan',
    key: process.env.BSCSCAN_API_KEY || null,
    url: 'https://bscscan.com/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.BSCSCAN_API_KEY ? 'active' : 'missing',
    fallback: 'CoinGecko for basic token data'
  },
  
  polygonscan: {
    name: 'PolygonScan',
    key: process.env.POLYGONSCAN_API_KEY || null,
    url: 'https://polygonscan.com/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.POLYGONSCAN_API_KEY ? 'active' : 'missing',
    fallback: 'CoinGecko for basic token data'
  },
  
  snowtrace: {
    name: 'Snowtrace',
    key: process.env.SNOWTRACE_API_KEY || null,
    url: 'https://snowtrace.io/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.SNOWTRACE_API_KEY ? 'active' : 'missing',
    fallback: 'CoinGecko for basic token data'
  },
  
  // Medium Priority APIs
  certik: {
    name: 'CertiK',
    key: process.env.CERTIK_API_KEY || null,
    url: 'https://www.certik.com/developers',
    rateLimit: 'Rate limited',
    status: process.env.CERTIK_API_KEY ? 'active' : 'missing',
    fallback: 'Manual research for audit data'
  },
  
  opensea: {
    name: 'OpenSea',
    key: process.env.OPENSEA_API_KEY || null,
    url: 'https://docs.opensea.io/reference/api-overview',
    rateLimit: 'Rate limited',
    status: process.env.OPENSEA_API_KEY ? 'active' : 'missing',
    fallback: 'Alternative NFT marketplaces'
  },
  
  twitter: {
    name: 'Twitter API',
    key: process.env.TWITTER_BEARER_TOKEN || null,
    url: 'https://developer.twitter.com/',
    rateLimit: 'Rate limited',
    status: process.env.TWITTER_BEARER_TOKEN ? 'active' : 'missing',
    fallback: 'Reddit API for sentiment analysis'
  },
  
  // Lower Priority APIs
  blockfrost: {
    name: 'Blockfrost',
    key: process.env.BLOCKFROST_API_KEY || null,
    url: 'https://blockfrost.io/',
    rateLimit: 'Free tier available',
    status: process.env.BLOCKFROST_API_KEY ? 'active' : 'missing',
    fallback: 'Manual Cardano explorer research'
  },
  
  trongrid: {
    name: 'TRON Grid',
    key: process.env.TRONGRID_API_KEY || null,
    url: 'https://www.trongrid.io/',
    rateLimit: 'Free tier available',
    status: process.env.TRONGRID_API_KEY ? 'active' : 'missing',
    fallback: 'Manual TRON explorer research'
  },
  
  near: {
    name: 'NEAR API',
    key: process.env.NEAR_API_KEY || null,
    url: 'https://docs.near.org/',
    rateLimit: 'Free tier available',
    status: process.env.NEAR_API_KEY ? 'active' : 'missing',
    fallback: 'Manual NEAR explorer research'
  }
};

// Blockchain API Status Assessment
export const BLOCKCHAIN_API_STATUS: { [key: string]: BlockchainAPIStatus } = {
  ethereum: {
    chain: 'Ethereum',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Full API support via Etherscan']
  },
  
  binance: {
    chain: 'BNB Smart Chain',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Full API support via BSCScan']
  },
  
  polygon: {
    chain: 'Polygon',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Full API support via PolygonScan']
  },
  
  solana: {
    chain: 'Solana',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'limited',
    notes: ['Good API support via Solscan', 'Limited contract verification']
  },
  
  avalanche: {
    chain: 'Avalanche',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Full API support via Snowtrace']
  },
  
  arbitrum: {
    chain: 'Arbitrum',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Uses Etherscan API with different endpoints']
  },
  
  optimism: {
    chain: 'Optimism',
    tokenData: 'available',
    transactionHistory: 'available',
    contractVerification: 'available',
    notes: ['Uses Etherscan API with different endpoints']
  },
  
  ronin: {
    chain: 'Ronin',
    tokenData: 'unavailable',
    transactionHistory: 'unavailable',
    contractVerification: 'unavailable',
    notes: ['No public API found', 'Manual research required']
  },
  
  cardano: {
    chain: 'Cardano',
    tokenData: 'limited',
    transactionHistory: 'limited',
    contractVerification: 'unavailable',
    notes: ['Limited API access', 'Blockfrost provides some data']
  },
  
  polkadot: {
    chain: 'Polkadot',
    tokenData: 'unavailable',
    transactionHistory: 'unavailable',
    contractVerification: 'unavailable',
    notes: ['No clear public API', 'Manual research required']
  },
  
  cosmos: {
    chain: 'Cosmos',
    tokenData: 'unavailable',
    transactionHistory: 'unavailable',
    contractVerification: 'unavailable',
    notes: ['Limited public API access', 'Manual research required']
  },
  
  tron: {
    chain: 'TRON',
    tokenData: 'limited',
    transactionHistory: 'limited',
    contractVerification: 'limited',
    notes: ['TRON Grid API available', 'Limited documentation']
  },
  
  near: {
    chain: 'NEAR Protocol',
    tokenData: 'limited',
    transactionHistory: 'limited',
    contractVerification: 'limited',
    notes: ['NEAR API available', 'Limited documentation']
  },
  
  algorand: {
    chain: 'Algorand',
    tokenData: 'unavailable',
    transactionHistory: 'unavailable',
    contractVerification: 'unavailable',
    notes: ['No clear public API', 'Manual research required']
  }
};

// API Key Status Checker
export function checkAPIKeyStatus(): {
  active: string[];
  missing: string[];
  limited: string[];
  recommendations: string[];
} {
  const active: string[] = [];
  const missing: string[] = [];
  const limited: string[] = [];
  const recommendations: string[] = [];

  for (const [key, config] of Object.entries(API_KEYS)) {
    if (config.status === 'active') {
      active.push(config.name);
    } else if (config.status === 'missing') {
      missing.push(config.name);
      recommendations.push(`Get ${config.name} API key from: ${config.url}`);
    } else if (config.status === 'limited') {
      limited.push(config.name);
    }
  }

  return { active, missing, limited, recommendations };
}

// Get API key safely
export function getAPIKey(service: string): string | null {
  const config = API_KEYS[service];
  return config?.key || null;
}

// Check if API is available
export function isAPIAvailable(service: string): boolean {
  const config = API_KEYS[service];
  return config?.status === 'active';
}

// Get fallback for unavailable API
export function getAPIFallback(service: string): string | null {
  const config = API_KEYS[service];
  return config?.fallback || null;
}

// Generate .env template
export function generateEnvTemplate(): string {
  let template = '# API Keys Configuration for DYOR BOT\n\n';
  
  for (const [key, config] of Object.entries(API_KEYS)) {
    template += `# ${config.name} - ${config.url}\n`;
    template += `# Rate limit: ${config.rateLimit}\n`;
    template += `${key.toUpperCase()}_API_KEY=your_api_key_here\n\n`;
  }
  
  return template;
}

// Get blockchain support status
export function getBlockchainSupportStatus(): {
  fullySupported: string[];
  partiallySupported: string[];
  unsupported: string[];
} {
  const fullySupported: string[] = [];
  const partiallySupported: string[] = [];
  const unsupported: string[] = [];

  for (const [chain, status] of Object.entries(BLOCKCHAIN_API_STATUS)) {
    const hasTokenData = status.tokenData === 'available';
    const hasTransactionHistory = status.transactionHistory === 'available';
    const hasContractVerification = status.contractVerification === 'available';

    if (hasTokenData && hasTransactionHistory && hasContractVerification) {
      fullySupported.push(chain);
    } else if (hasTokenData || hasTransactionHistory) {
      partiallySupported.push(chain);
    } else {
      unsupported.push(chain);
    }
  }

  return { fullySupported, partiallySupported, unsupported };
}


