// Test Environment Variables Loading
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 ENVIRONMENT VARIABLES TEST');
console.log('=============================\n');

console.log('✅ LOADED API KEYS:');
console.log(`Etherscan API Key: ${process.env.ETHERSCAN_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`Snowtrace API Key: ${process.env.SNOWTRACE_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`Anthropic API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`IGDB Client ID: ${process.env.IGDB_CLIENT_ID ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`YouTube API Key: ${process.env.YOUTUBE_API_KEY ? '✅ FOUND' : '❌ MISSING'}`);

console.log('\n📋 DETAILED VALUES:');
console.log(`Etherscan: ${process.env.ETHERSCAN_API_KEY || 'NOT SET'}`);
console.log(`Snowtrace: ${process.env.SNOWTRACE_API_KEY || 'NOT SET'}`);
console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'SET (hidden)' : 'NOT SET'}`);
console.log(`IGDB Client ID: ${process.env.IGDB_CLIENT_ID || 'NOT SET'}`);
console.log(`YouTube: ${process.env.YOUTUBE_API_KEY ? 'SET (hidden)' : 'NOT SET'}`);

console.log('\n🎯 PRIORITY CHAIN STATUS:');
console.log(`Ethereum: ${process.env.ETHERSCAN_API_KEY ? '✅ READY' : '❌ NEEDS API KEY'}`);
console.log(`Avalanche: ${process.env.SNOWTRACE_API_KEY ? '✅ READY' : '❌ NEEDS API KEY'}`);
console.log(`Solana: ✅ READY (Free API)`);
console.log(`Immutable X: ✅ READY (Free API)`);
console.log(`Polygon: ❌ NEEDS API KEY`);
console.log(`Arbitrum: ${process.env.ETHERSCAN_API_KEY ? '✅ READY (Uses Etherscan)' : '❌ NEEDS API KEY'}`);
console.log(`Ronin: ⚠️ LIMITED (Manual research may be needed)`);

console.log('\n📊 SUMMARY:');
const readyChains = [];
const needsKeys = [];

if (process.env.ETHERSCAN_API_KEY) {
  readyChains.push('Ethereum', 'Arbitrum');
} else {
  needsKeys.push('Etherscan (for Ethereum & Arbitrum)');
}

if (process.env.SNOWTRACE_API_KEY) {
  readyChains.push('Avalanche');
} else {
  needsKeys.push('Snowtrace (for Avalanche)');
}

readyChains.push('Solana', 'Immutable X');
needsKeys.push('PolygonScan (for Polygon)');

console.log(`✅ READY CHAINS: ${readyChains.join(', ')}`);
console.log(`❌ NEED API KEYS: ${needsKeys.join(', ')}`);
console.log(`⚠️ LIMITED: Ronin`);


