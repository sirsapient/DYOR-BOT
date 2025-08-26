// Priority Blockchain Configuration for DYOR BOT
// Focused on: Ethereum, Solana, Avalanche, Ronin, Polygon, Immutable, Arbitrum

export interface PriorityBlockchainConfig {
  name: string;
  chainId: number | string;
  symbol: string;
  explorer: string;
  rpcUrl: string;
  apiEndpoints: {
    price: string;
    marketCap: string;
    tokenInfo: string;
    transactionHistory: string;
    contractVerification: string;
    nftData?: string;
    [key: string]: string | undefined; // Allow additional properties
  };
  supportedFeatures: string[];
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
  };
  apiKeyRequired: boolean;
  apiKeyService?: string;
  apiKeyUrl?: string;
  status: 'active' | 'limited' | 'inactive';
  notes?: string[];
}

// Priority Blockchain Configurations
export const PRIORITY_BLOCKCHAINS: { [key: string]: PriorityBlockchainConfig } = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/ethereum',
      tokenInfo: 'https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress={address}&apikey={apiKey}',
      transactionHistory: 'https://api.etherscan.io/api?module=account&action=txlist&address={address}&apikey={apiKey}',
      contractVerification: 'https://api.etherscan.io/api?module=contract&action=getsourcecode&address={address}&apikey={apiKey}',
      nftData: 'https://api.etherscan.io/api?module=account&action=tokennfttx&address={address}&apikey={apiKey}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao', 'gaming'],
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18
    },
    apiKeyRequired: true,
    apiKeyService: 'Etherscan',
    apiKeyUrl: 'https://etherscan.io/apis',
    status: 'active'
  },
  
  solana: {
    name: 'Solana',
    chainId: 101,
    symbol: 'SOL',
    explorer: 'https://solscan.io',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/solana',
      tokenInfo: 'https://public-api.solscan.io/token/meta?tokenAddress={address}',
      transactionHistory: 'https://public-api.solscan.io/account/transactions?account={address}',
      contractVerification: 'https://public-api.solscan.io/account/{address}',
      nftData: 'https://public-api.solscan.io/account/nft?account={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao', 'gaming'],
    nativeToken: {
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9
    },
    apiKeyRequired: false,
    apiKeyService: 'Solscan (Free)',
    apiKeyUrl: 'https://public-api.solscan.io/',
    status: 'active'
  },
  
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    symbol: 'AVAX',
    explorer: 'https://explorer.avax.network',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/avalanche-2',
      tokenInfo: 'https://api.snowtrace.io/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.snowtrace.io/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.snowtrace.io/api?module=contract&action=getsourcecode&address={address}',
      defiProtocols: 'https://api.llama.fi/protocols?chain=Avalanche',
      tokenList: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&platform=avalanche',
      bridgeData: 'https://bridge.avax.network/api/v1/',
      rpcEndpoint: 'https://api.avax.network/ext/bc/C/rpc'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao', 'gaming'],
    nativeToken: {
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18
    },
    apiKeyRequired: false,
    apiKeyService: 'Free APIs (CoinGecko, DeFiLlama, RPC)',
    apiKeyUrl: 'N/A',
    status: 'active',
    notes: ['Using free alternatives for 70-80% data coverage', 'Snowtrace API available for advanced features']
  },
  
  ronin: {
    name: 'Ronin',
    chainId: 2020,
    symbol: 'RON',
    explorer: 'https://explorer.roninchain.com',
    rpcUrl: 'https://api.roninchain.com/rpc',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=ronin&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/ronin',
      tokenInfo: 'https://explorer.roninchain.com/api/token/{address}',
      transactionHistory: 'https://explorer.roninchain.com/api/transactions?address={address}',
      contractVerification: 'https://explorer.roninchain.com/api/contract/{address}',
      nftData: 'https://explorer.roninchain.com/api/nft?address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'gaming'],
    nativeToken: {
      symbol: 'RON',
      name: 'Ronin',
      decimals: 18
    },
    apiKeyRequired: false,
    apiKeyService: 'Ronin Explorer (Free)',
    apiKeyUrl: 'https://explorer.roninchain.com/',
    status: 'limited'
  },
  
  polygon: {
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/matic-network',
      tokenInfo: 'https://api.polygonscan.com/api?module=token&action=tokeninfo&contractaddress={address}&apikey={apiKey}',
      transactionHistory: 'https://api.polygonscan.com/api?module=account&action=txlist&address={address}&apikey={apiKey}',
      contractVerification: 'https://api.polygonscan.com/api?module=contract&action=getsourcecode&address={address}&apikey={apiKey}',
      nftData: 'https://api.polygonscan.com/api?module=account&action=tokennfttx&address={address}&apikey={apiKey}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao', 'gaming'],
    nativeToken: {
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18
    },
    apiKeyRequired: true,
    apiKeyService: 'PolygonScan',
    apiKeyUrl: 'https://polygonscan.com/apis',
    status: 'active'
  },
  
  immutable: {
    name: 'Immutable X',
    chainId: 'immutable',
    symbol: 'IMX',
    explorer: 'https://immutascan.io',
    rpcUrl: 'https://rpc.immutable.com',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=immutable&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/immutable',
      tokenInfo: 'https://api.immutascan.io/v1/tokens/{address}',
      transactionHistory: 'https://api.immutascan.io/v1/transactions?address={address}',
      contractVerification: 'https://api.immutascan.io/v1/contracts/{address}',
      nftData: 'https://api.immutascan.io/v1/nfts?address={address}'
    },
    supportedFeatures: ['nfts', 'gaming', 'layer2'],
    nativeToken: {
      symbol: 'IMX',
      name: 'Immutable X',
      decimals: 18
    },
    apiKeyRequired: false,
    apiKeyService: 'Immutable API (Free)',
    apiKeyUrl: 'https://docs.immutable.com/',
    status: 'active'
  },
  
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    symbol: 'ARB',
    explorer: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=arbitrum&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/arbitrum',
      tokenInfo: 'https://api.arbiscan.io/api?module=token&action=tokeninfo&contractaddress={address}&apikey={apiKey}',
      transactionHistory: 'https://api.arbiscan.io/api?module=account&action=txlist&address={address}&apikey={apiKey}',
      contractVerification: 'https://api.arbiscan.io/api?module=contract&action=getsourcecode&address={address}&apikey={apiKey}',
      nftData: 'https://api.arbiscan.io/api?module=account&action=tokennfttx&address={address}&apikey={apiKey}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao', 'gaming', 'layer2'],
    nativeToken: {
      symbol: 'ARB',
      name: 'Arbitrum',
      decimals: 18
    },
    apiKeyRequired: true,
    apiKeyService: 'Arbiscan',
    apiKeyUrl: 'https://arbiscan.io/apis',
    status: 'active'
  }
};

// Priority API Keys Configuration
export const PRIORITY_API_KEYS = {
  etherscan: {
    name: 'Etherscan',
    key: process.env.ETHERSCAN_API_KEY || null,
    url: 'https://etherscan.io/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.ETHERSCAN_API_KEY ? 'active' : 'missing',
    chains: ['ethereum', 'arbitrum']
  },
  
  snowtrace: {
    name: 'Snowtrace (Optional)',
    key: process.env.SNOWTRACE_API_KEY || null,
    url: 'https://snowtrace.io/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.SNOWTRACE_API_KEY ? 'active' : 'optional',
    chains: ['avalanche'],
    notes: ['Optional - using free alternatives for 70-80% coverage', 'Provides advanced features like detailed transaction history']
  },
  
  polygonscan: {
    name: 'PolygonScan',
    key: process.env.POLYGONSCAN_API_KEY || null,
    url: 'https://polygonscan.com/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.POLYGONSCAN_API_KEY ? 'active' : 'missing',
    chains: ['polygon']
  },
  
  arbiscan: {
    name: 'Arbiscan',
    key: process.env.ARBISCAN_API_KEY || null,
    url: 'https://arbiscan.io/apis',
    rateLimit: '5 calls/sec (free)',
    status: process.env.ARBISCAN_API_KEY ? 'active' : 'missing',
    chains: ['arbitrum']
  }
};

// Chain detection for priority chains
export function detectPriorityChainFromAddress(address: string): string | null {
  // Ethereum-style addresses (0x...)
  if (address.startsWith('0x') && address.length === 42) {
    // Could be Ethereum, Polygon, Arbitrum, Avalanche, Immutable
    // We'll need additional context or try multiple chains
    return 'ethereum'; // Default to Ethereum
  }
  
  // Solana addresses (base58, 32-44 characters)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'solana';
  }
  
  // Ronin addresses (ronin:...)
  if (address.startsWith('ronin:')) {
    return 'ronin';
  }
  
  return null;
}

// Get priority chain configuration
export function getPriorityChainConfig(chainName: string): PriorityBlockchainConfig | null {
  return PRIORITY_BLOCKCHAINS[chainName] || null;
}

// Get all priority chains
export function getPriorityChains(): string[] {
  return Object.keys(PRIORITY_BLOCKCHAINS);
}

// Check if a feature is supported on a priority chain
export function isPriorityFeatureSupported(chainName: string, feature: string): boolean {
  const config = PRIORITY_BLOCKCHAINS[chainName];
  return config?.supportedFeatures.includes(feature) || false;
}

// Get priority chains that support a specific feature
export function getPriorityChainsSupportingFeature(feature: string): string[] {
  return Object.entries(PRIORITY_BLOCKCHAINS)
    .filter(([_, config]) => config.supportedFeatures.includes(feature))
    .map(([chainName, _]) => chainName);
}

// Generate priority .env template
export function generatePriorityEnvTemplate(): string {
  let template = '# Priority API Keys Configuration for DYOR BOT\n';
  template += '# Focused on: Ethereum, Solana, Avalanche, Ronin, Polygon, Immutable, Arbitrum\n\n';
  
  for (const [key, config] of Object.entries(PRIORITY_API_KEYS)) {
    template += `# ${config.name} - ${config.url}\n`;
    template += `# Rate limit: ${config.rateLimit}\n`;
    template += `# Chains: ${config.chains.join(', ')}\n`;
    template += `${key.toUpperCase()}_API_KEY=your_api_key_here\n\n`;
  }
  
  return template;
}

// Check priority API key status
export function checkPriorityAPIKeyStatus(): {
  active: string[];
  missing: string[];
  recommendations: string[];
} {
  const active: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];

  for (const [key, config] of Object.entries(PRIORITY_API_KEYS)) {
    if (config.status === 'active') {
      active.push(config.name);
    } else {
      missing.push(config.name);
      recommendations.push(`Get ${config.name} API key from: ${config.url}`);
    }
  }

  return { active, missing, recommendations };
}

// Get priority blockchain support status
export function getPriorityBlockchainSupportStatus(): {
  fullySupported: string[];
  partiallySupported: string[];
  manualOnly: string[];
} {
  const fullySupported: string[] = [];
  const partiallySupported: string[] = [];
  const manualOnly: string[] = [];

  for (const [chain, config] of Object.entries(PRIORITY_BLOCKCHAINS)) {
    if (config.status === 'active') {
      fullySupported.push(chain);
    } else if (config.status === 'limited') {
      partiallySupported.push(chain);
    } else {
      manualOnly.push(chain);
    }
  }

  return { fullySupported, partiallySupported, manualOnly };
}
