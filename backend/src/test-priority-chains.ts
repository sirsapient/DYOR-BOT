// Test Priority Chains Status
// Focused on: Ethereum, Solana, Avalanche, Ronin, Polygon, Immutable, Arbitrum

import { 
  checkPriorityAPIKeyStatus, 
  generatePriorityEnvTemplate, 
  getPriorityBlockchainSupportStatus,
  PRIORITY_BLOCKCHAINS,
  PRIORITY_API_KEYS
} from './priority-blockchain-config';

function testPriorityAPIStatus() {
  console.log('🔍 PRIORITY API KEY STATUS');
  console.log('==========================\n');

  const status = checkPriorityAPIKeyStatus();
  
  console.log('✅ ACTIVE APIs:');
  if (status.active.length > 0) {
    status.active.forEach(api => console.log(`  - ${api}`));
  } else {
    console.log('  No active APIs found');
  }
  
  console.log('\n❌ MISSING APIs:');
  if (status.missing.length > 0) {
    status.missing.forEach(api => console.log(`  - ${api}`));
  } else {
    console.log('  All priority APIs are configured!');
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  if (status.recommendations.length > 0) {
    status.recommendations.forEach(rec => console.log(`  - ${rec}`));
  } else {
    console.log('  All recommended APIs are configured!');
  }
}

function testPriorityBlockchainSupport() {
  console.log('\n\n🔗 PRIORITY BLOCKCHAIN SUPPORT STATUS');
  console.log('=====================================\n');

  const support = getPriorityBlockchainSupportStatus();
  
  console.log('✅ FULLY SUPPORTED (All APIs available):');
  support.fullySupported.forEach(chain => {
    const config = PRIORITY_BLOCKCHAINS[chain];
    console.log(`  - ${config.name}: ${config.apiKeyService}`);
  });
  
  console.log('\n⚠️ PARTIALLY SUPPORTED (Limited APIs):');
  support.partiallySupported.forEach(chain => {
    const config = PRIORITY_BLOCKCHAINS[chain];
    console.log(`  - ${config.name}: ${config.apiKeyService}`);
  });
  
  console.log('\n❌ MANUAL ONLY (No APIs available):');
  support.manualOnly.forEach(chain => {
    const config = PRIORITY_BLOCKCHAINS[chain];
    console.log(`  - ${config.name}: Manual research required`);
  });
}

function generatePriorityEnvFile() {
  console.log('\n\n📝 PRIORITY .ENV TEMPLATE');
  console.log('=========================\n');
  
  const template = generatePriorityEnvTemplate();
  console.log(template);
  
  console.log('\n💡 SAVE THIS AS .env IN YOUR BACKEND DIRECTORY');
  console.log('💡 REPLACE "your_api_key_here" WITH ACTUAL API KEYS');
}

function generatePriorityList() {
  console.log('\n\n🎯 PRIORITY CHAIN BREAKDOWN');
  console.log('==========================\n');
  
  console.log('🔥 REQUIRES API KEY:');
  console.log('  1. Ethereum - Etherscan API Key');
  console.log('  2. Avalanche - Snowtrace API Key');
  console.log('  3. Polygon - PolygonScan API Key');
  console.log('  4. Arbitrum - Arbiscan API Key');
  
  console.log('\n🟢 FREE APIs (No Key Required):');
  console.log('  5. Solana - Solscan (Free)');
  console.log('  6. Immutable X - Immutable API (Free)');
  
  console.log('\n🟡 LIMITED API ACCESS:');
  console.log('  7. Ronin - Limited explorer access');
  
  console.log('\n📊 FEATURE SUPPORT BY CHAIN:');
  console.log('  Gaming: All chains support gaming');
  console.log('  NFTs: All chains support NFTs');
  console.log('  DeFi: Ethereum, Solana, Avalanche, Polygon, Arbitrum');
  console.log('  DAO: Ethereum, Solana, Avalanche, Polygon, Arbitrum');
  console.log('  Layer 2: Immutable X, Arbitrum');
}

function showChainDetails() {
  console.log('\n\n📋 DETAILED CHAIN INFORMATION');
  console.log('============================\n');
  
  for (const [chainKey, config] of Object.entries(PRIORITY_BLOCKCHAINS)) {
    console.log(`🔗 ${config.name.toUpperCase()}`);
    console.log(`   Symbol: ${config.symbol}`);
    console.log(`   Chain ID: ${config.chainId}`);
    console.log(`   Explorer: ${config.explorer}`);
    console.log(`   API Service: ${config.apiKeyService}`);
    console.log(`   API Key Required: ${config.apiKeyRequired ? 'Yes' : 'No'}`);
    console.log(`   Status: ${config.status}`);
    console.log(`   Features: ${config.supportedFeatures.join(', ')}`);
    console.log('');
  }
}

function showAPIDetails() {
  console.log('\n\n🔑 API KEY DETAILS');
  console.log('==================\n');
  
  for (const [key, config] of Object.entries(PRIORITY_API_KEYS)) {
    console.log(`🔑 ${config.name.toUpperCase()}`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Rate Limit: ${config.rateLimit}`);
    console.log(`   Status: ${config.status}`);
    console.log(`   Supported Chains: ${config.chains.join(', ')}`);
    console.log('');
  }
}

// Main test runner
function runPriorityChainTests() {
  console.log('🚀 DYOR BOT PRIORITY CHAIN STATUS CHECK');
  console.log('=======================================\n');
  
  testPriorityAPIStatus();
  testPriorityBlockchainSupport();
  generatePriorityList();
  showChainDetails();
  showAPIDetails();
  generatePriorityEnvFile();
  
  console.log('\n\n✅ PRIORITY CHAIN STATUS CHECK COMPLETE');
  console.log('📋 Focus on getting the 4 required API keys for full functionality');
  console.log('🎯 Priority order: Etherscan → Snowtrace → PolygonScan → Arbiscan');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPriorityChainTests();
}

export { 
  runPriorityChainTests, 
  testPriorityAPIStatus, 
  testPriorityBlockchainSupport, 
  generatePriorityEnvFile, 
  generatePriorityList,
  showChainDetails,
  showAPIDetails
};


