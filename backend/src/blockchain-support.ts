// Blockchain Support System for DYOR BOT
// This file provides comprehensive support for all major blockchain networks

export interface BlockchainConfig {
  name: string;
  chainId: number;
  symbol: string;
  explorer: string;
  rpcUrl: string;
  apiEndpoints: {
    price: string;
    marketCap: string;
    tokenInfo: string;
    transactionHistory: string;
    contractVerification: string;
  };
  supportedFeatures: string[];
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

export interface TokenData {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  marketCap?: number;
  price?: number;
  volume24h?: number;
  holders?: number;
  network: string;
  verified: boolean;
  source: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  blockNumber: number;
  status: 'success' | 'failed';
  network: string;
}

// Major Blockchain Configurations
export const BLOCKCHAIN_CONFIGS: { [key: string]: BlockchainConfig } = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/ethereum',
      tokenInfo: 'https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.etherscan.io/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.etherscan.io/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18
    }
  },
  
  binance: {
    name: 'BNB Smart Chain',
    chainId: 56,
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/binancecoin',
      tokenInfo: 'https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.bscscan.com/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.bscscan.com/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18
    }
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
      tokenInfo: 'https://api.polygonscan.com/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.polygonscan.com/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.polygonscan.com/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18
    }
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
      contractVerification: 'https://public-api.solscan.io/account/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9
    }
  },
  
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/avalanche-2',
      tokenInfo: 'https://api.snowtrace.io/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.snowtrace.io/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.snowtrace.io/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18
    }
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
      tokenInfo: 'https://api.arbiscan.io/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api.arbiscan.io/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api.arbiscan.io/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'ARB',
      name: 'Arbitrum',
      decimals: 18
    }
  },
  
  optimism: {
    name: 'Optimism',
    chainId: 10,
    symbol: 'OP',
    explorer: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=optimism&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/optimism',
      tokenInfo: 'https://api-optimistic.etherscan.io/api?module=token&action=tokeninfo&contractaddress={address}',
      transactionHistory: 'https://api-optimistic.etherscan.io/api?module=account&action=txlist&address={address}',
      contractVerification: 'https://api-optimistic.etherscan.io/api?module=contract&action=getsourcecode&address={address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'dao'],
    nativeToken: {
      symbol: 'OP',
      name: 'Optimism',
      decimals: 18
    }
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
      contractVerification: 'https://explorer.roninchain.com/api/contract/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'gaming'],
    nativeToken: {
      symbol: 'RON',
      name: 'Ronin',
      decimals: 18
    }
  },
  
  cardano: {
    name: 'Cardano',
    chainId: 1,
    symbol: 'ADA',
    explorer: 'https://cardanoscan.io',
    rpcUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/cardano',
      tokenInfo: 'https://cardanoscan.io/api/token/{address}',
      transactionHistory: 'https://cardanoscan.io/api/transactions?address={address}',
      contractVerification: 'https://cardanoscan.io/api/contract/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi'],
    nativeToken: {
      symbol: 'ADA',
      name: 'Cardano',
      decimals: 6
    }
  },
  
  polkadot: {
    name: 'Polkadot',
    chainId: 0,
    symbol: 'DOT',
    explorer: 'https://polkascan.io',
    rpcUrl: 'https://rpc.polkadot.io',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/polkadot',
      tokenInfo: 'https://polkascan.io/api/token/{address}',
      transactionHistory: 'https://polkascan.io/api/transactions?address={address}',
      contractVerification: 'https://polkascan.io/api/contract/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'parachains'],
    nativeToken: {
      symbol: 'DOT',
      name: 'Polkadot',
      decimals: 10
    }
  },
  
  cosmos: {
    name: 'Cosmos',
    chainId: 'cosmoshub-4',
    symbol: 'ATOM',
    explorer: 'https://www.mintscan.io/cosmos',
    rpcUrl: 'https://rpc.cosmos.network:26657',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/cosmos',
      tokenInfo: 'https://www.mintscan.io/cosmos/api/token/{address}',
      transactionHistory: 'https://www.mintscan.io/cosmos/api/transactions?address={address}',
      contractVerification: 'https://www.mintscan.io/cosmos/api/contract/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi', 'ibc'],
    nativeToken: {
      symbol: 'ATOM',
      name: 'Cosmos',
      decimals: 6
    }
  },
  
  tron: {
    name: 'TRON',
    chainId: 1,
    symbol: 'TRX',
    explorer: 'https://tronscan.org',
    rpcUrl: 'https://api.trongrid.io',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/tron',
      tokenInfo: 'https://api.trongrid.io/v1/contracts/{address}',
      transactionHistory: 'https://api.trongrid.io/v1/accounts/{address}/transactions',
      contractVerification: 'https://api.trongrid.io/v1/contracts/{address}/code'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi'],
    nativeToken: {
      symbol: 'TRX',
      name: 'TRON',
      decimals: 6
    }
  },
  
  near: {
    name: 'NEAR Protocol',
    chainId: 'mainnet',
    symbol: 'NEAR',
    explorer: 'https://explorer.near.org',
    rpcUrl: 'https://rpc.mainnet.near.org',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/near',
      tokenInfo: 'https://explorer.near.org/api/token/{address}',
      transactionHistory: 'https://explorer.near.org/api/transactions?account={address}',
      contractVerification: 'https://explorer.near.org/api/contract/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi'],
    nativeToken: {
      symbol: 'NEAR',
      name: 'NEAR Protocol',
      decimals: 24
    }
  },
  
  algorand: {
    name: 'Algorand',
    chainId: 'mainnet-v1.0',
    symbol: 'ALGO',
    explorer: 'https://algoexplorer.io',
    rpcUrl: 'https://mainnet-api.algonode.cloud',
    apiEndpoints: {
      price: 'https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd&include_market_cap=true',
      marketCap: 'https://api.coingecko.com/api/v3/coins/algorand',
      tokenInfo: 'https://algoexplorer.io/api/v1/asset/{address}',
      transactionHistory: 'https://algoexplorer.io/api/v1/account/{address}/transactions',
      contractVerification: 'https://algoexplorer.io/api/v1/application/{address}'
    },
    supportedFeatures: ['smart_contracts', 'tokens', 'nfts', 'defi'],
    nativeToken: {
      symbol: 'ALGO',
      name: 'Algorand',
      decimals: 6
    }
  }
};

// Chain detection utilities
export function detectChainFromAddress(address: string): string | null {
  // Ethereum-style addresses (0x...)
  if (address.startsWith('0x') && address.length === 42) {
    return 'ethereum'; // Could be Ethereum, BSC, Polygon, etc.
  }
  
  // Solana addresses (base58, 32-44 characters)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'solana';
  }
  
  // Cardano addresses (addr1...)
  if (address.startsWith('addr1')) {
    return 'cardano';
  }
  
  // Polkadot addresses (1, 3, 5, 7, 8, 9, A, B, C, D, E, F, G, H, J, K, L, M, N, P, Q, R, S, T, U, V, W, X, Y, Z)
  if (/^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address)) {
    return 'polkadot';
  }
  
  // Cosmos addresses (cosmos1...)
  if (address.startsWith('cosmos1')) {
    return 'cosmos';
  }
  
  // TRON addresses (T...)
  if (address.startsWith('T') && address.length === 34) {
    return 'tron';
  }
  
  // NEAR addresses (account.near)
  if (address.includes('.near')) {
    return 'near';
  }
  
  // Algorand addresses (base32, 58 characters)
  if (/^[A-Z2-7]{58}$/.test(address)) {
    return 'algorand';
  }
  
  return null;
}

export function detectChainFromProjectName(projectName: string): string[] {
  const name = projectName.toLowerCase();
  const detectedChains: string[] = [];
  
  // Ethereum ecosystem
  if (name.includes('ethereum') || name.includes('eth') || name.includes('ether')) {
    detectedChains.push('ethereum');
  }
  
  // BSC ecosystem
  if (name.includes('bsc') || name.includes('binance') || name.includes('bnb')) {
    detectedChains.push('binance');
  }
  
  // Polygon ecosystem
  if (name.includes('polygon') || name.includes('matic')) {
    detectedChains.push('polygon');
  }
  
  // Solana ecosystem
  if (name.includes('solana') || name.includes('sol')) {
    detectedChains.push('solana');
  }
  
  // Avalanche ecosystem
  if (name.includes('avalanche') || name.includes('avax')) {
    detectedChains.push('avalanche');
  }
  
  // Arbitrum ecosystem
  if (name.includes('arbitrum') || name.includes('arb')) {
    detectedChains.push('arbitrum');
  }
  
  // Optimism ecosystem
  if (name.includes('optimism') || name.includes('op')) {
    detectedChains.push('optimism');
  }
  
  // Ronin ecosystem (gaming)
  if (name.includes('ronin') || name.includes('ron')) {
    detectedChains.push('ronin');
  }
  
  // Cardano ecosystem
  if (name.includes('cardano') || name.includes('ada')) {
    detectedChains.push('cardano');
  }
  
  // Polkadot ecosystem
  if (name.includes('polkadot') || name.includes('dot')) {
    detectedChains.push('polkadot');
  }
  
  // Cosmos ecosystem
  if (name.includes('cosmos') || name.includes('atom')) {
    detectedChains.push('cosmos');
  }
  
  // TRON ecosystem
  if (name.includes('tron') || name.includes('trx')) {
    detectedChains.push('tron');
  }
  
  // NEAR ecosystem
  if (name.includes('near')) {
    detectedChains.push('near');
  }
  
  // Algorand ecosystem
  if (name.includes('algorand') || name.includes('algo')) {
    detectedChains.push('algorand');
  }
  
  return detectedChains;
}

// Multi-chain data collection
export async function fetchTokenDataMultiChain(
  contractAddress: string, 
  chainName?: string
): Promise<TokenData | null> {
  try {
    // Auto-detect chain if not provided
    const detectedChain = chainName || detectChainFromAddress(contractAddress);
    if (!detectedChain) {
      console.log(`❌ Could not detect chain for address: ${contractAddress}`);
      return null;
    }
    
    const config = BLOCKCHAIN_CONFIGS[detectedChain];
    if (!config) {
      console.log(`❌ No configuration found for chain: ${detectedChain}`);
      return null;
    }
    
    console.log(`🔍 Fetching token data for ${contractAddress} on ${detectedChain}`);
    
    // Use chain-specific API
    const tokenInfoUrl = config.apiEndpoints.tokenInfo.replace('{address}', contractAddress);
    const response = await fetch(tokenInfoUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      // Parse response based on chain
      const tokenData: TokenData = {
        contractAddress,
        symbol: data.symbol || 'UNKNOWN',
        name: data.name || 'Unknown Token',
        decimals: data.decimals || 18,
        totalSupply: data.totalSupply || '0',
        network: detectedChain,
        verified: data.verified || false,
        source: `${detectedChain} API`
      };
      
      // Try to get market data from CoinGecko
      try {
        const marketResponse = await fetch(config.apiEndpoints.price);
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          const tokenMarketData = marketData[data.symbol?.toLowerCase()];
          if (tokenMarketData) {
            tokenData.price = tokenMarketData.usd;
            tokenData.marketCap = tokenMarketData.usd_market_cap;
            tokenData.volume24h = tokenMarketData.usd_24h_vol;
          }
        }
      } catch (e) {
        console.log(`⚠️ Could not fetch market data: ${(e as Error).message}`);
      }
      
      console.log(`✅ Token data fetched successfully from ${detectedChain}`);
      return tokenData;
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Failed to fetch token data: ${(error as Error).message}`);
    return null;
  }
}

export async function fetchTransactionHistoryMultiChain(
  address: string,
  chainName?: string,
  limit: number = 50
): Promise<TransactionData[]> {
  try {
    const detectedChain = chainName || detectChainFromAddress(address);
    if (!detectedChain) {
      console.log(`❌ Could not detect chain for address: ${address}`);
      return [];
    }
    
    const config = BLOCKCHAIN_CONFIGS[detectedChain];
    if (!config) {
      console.log(`❌ No configuration found for chain: ${detectedChain}`);
      return [];
    }
    
    console.log(`🔍 Fetching transaction history for ${address} on ${detectedChain}`);
    
    const txHistoryUrl = config.apiEndpoints.transactionHistory
      .replace('{address}', address)
      + `&limit=${limit}`;
    
    const response = await fetch(txHistoryUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      // Parse transactions based on chain
      const transactions: TransactionData[] = data.result?.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: tx.gasUsed || '0',
        gasPrice: tx.gasPrice || '0',
        timestamp: parseInt(tx.timeStamp) * 1000,
        blockNumber: parseInt(tx.blockNumber),
        status: tx.isError === '0' ? 'success' : 'failed',
        network: detectedChain
      })) || [];
      
      console.log(`✅ Fetched ${transactions.length} transactions from ${detectedChain}`);
      return transactions;
    }
    
    return [];
  } catch (error) {
    console.log(`❌ Failed to fetch transaction history: ${(error as Error).message}`);
    return [];
  }
}

// Chain-specific data collection functions
export async function fetchEthereumTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'ethereum');
}

export async function fetchBSCTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'binance');
}

export async function fetchPolygonTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'polygon');
}

export async function fetchSolanaTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'solana');
}

export async function fetchAvalancheTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'avalanche');
}

export async function fetchArbitrumTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'arbitrum');
}

export async function fetchOptimismTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'optimism');
}

export async function fetchRoninTokenData(contractAddress: string): Promise<TokenData | null> {
  return fetchTokenDataMultiChain(contractAddress, 'ronin');
}

// Get all supported chains
export function getSupportedChains(): string[] {
  return Object.keys(BLOCKCHAIN_CONFIGS);
}

// Get chain configuration
export function getChainConfig(chainName: string): BlockchainConfig | null {
  return BLOCKCHAIN_CONFIGS[chainName] || null;
}

// Check if a feature is supported on a chain
export function isFeatureSupported(chainName: string, feature: string): boolean {
  const config = BLOCKCHAIN_CONFIGS[chainName];
  return config?.supportedFeatures.includes(feature) || false;
}

// Get all chains that support a specific feature
export function getChainsSupportingFeature(feature: string): string[] {
  return Object.entries(BLOCKCHAIN_CONFIGS)
    .filter(([_, config]) => config.supportedFeatures.includes(feature))
    .map(([chainName, _]) => chainName);
}

