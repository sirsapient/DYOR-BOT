// Test API Status and Generate Recommendations
// This file helps identify which API keys are needed

import { 
  checkAPIKeyStatus, 
  generateEnvTemplate, 
  getBlockchainSupportStatus,
  BLOCKCHAIN_API_STATUS 
} from './api-keys-config';

function testAPIStatus() {
  console.log('🔍 API KEY STATUS CHECK');
  console.log('======================\n');

  const status = checkAPIKeyStatus();
  
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
    console.log('  All APIs are configured!');
  }
  
  console.log('\n⚠️ LIMITED APIs:');
  if (status.limited.length > 0) {
    status.limited.forEach(api => console.log(`  - ${api}`));
  } else {
    console.log('  No limited APIs');
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  if (status.recommendations.length > 0) {
    status.recommendations.forEach(rec => console.log(`  - ${rec}`));
  } else {
    console.log('  All recommended APIs are configured!');
  }
}

function testBlockchainSupport() {
  console.log('\n\n🔗 BLOCKCHAIN SUPPORT STATUS');
  console.log('===========================\n');

  const support = getBlockchainSupportStatus();
  
  console.log('✅ FULLY SUPPORTED (All APIs available):');
  support.fullySupported.forEach(chain => {
    const status = BLOCKCHAIN_API_STATUS[chain];
    console.log(`  - ${status.chain}: ${status.notes.join(', ')}`);
  });
  
  console.log('\n⚠️ PARTIALLY SUPPORTED (Limited APIs):');
  support.partiallySupported.forEach(chain => {
    const status = BLOCKCHAIN_API_STATUS[chain];
    console.log(`  - ${status.chain}: ${status.notes.join(', ')}`);
  });
  
  console.log('\n❌ UNSUPPORTED (No APIs available):');
  support.unsupported.forEach(chain => {
    const status = BLOCKCHAIN_API_STATUS[chain];
    console.log(`  - ${status.chain}: ${status.notes.join(', ')}`);
  });
}

function generateEnvFile() {
  console.log('\n\n📝 .ENV TEMPLATE');
  console.log('================\n');
  
  const template = generateEnvTemplate();
  console.log(template);
  
  console.log('\n💡 SAVE THIS AS .env IN YOUR BACKEND DIRECTORY');
  console.log('💡 REPLACE "your_api_key_here" WITH ACTUAL API KEYS');
}

function generatePriorityList() {
  console.log('\n\n🎯 API KEY PRIORITY LIST');
  console.log('=======================\n');
  
  console.log('🔥 HIGH PRIORITY (Essential for core functionality):');
  console.log('  1. Etherscan API Key - For Ethereum, Arbitrum, Optimism');
  console.log('  2. BSCScan API Key - For BNB Smart Chain');
  console.log('  3. PolygonScan API Key - For Polygon');
  console.log('  4. Snowtrace API Key - For Avalanche');
  
  console.log('\n🟡 MEDIUM PRIORITY (Important for comprehensive coverage):');
  console.log('  5. CertiK API Key - For security audit data');
  console.log('  6. OpenSea API Key - For NFT data');
  console.log('  7. Twitter API Key - For sentiment analysis');
  
  console.log('\n🟢 LOW PRIORITY (Nice to have):');
  console.log('  8. Blockfrost API Key - For Cardano');
  console.log('  9. TRON Grid API Key - For TRON');
  console.log('  10. NEAR API Key - For NEAR Protocol');
  
  console.log('\n❌ NO PUBLIC API AVAILABLE:');
  console.log('  - Ronin (Manual research required)');
  console.log('  - Polkadot (Manual research required)');
  console.log('  - Cosmos (Manual research required)');
  console.log('  - Algorand (Manual research required)');
}

// Main test runner
function runAPITests() {
  console.log('🚀 DYOR BOT API STATUS CHECK');
  console.log('============================\n');
  
  testAPIStatus();
  testBlockchainSupport();
  generatePriorityList();
  generateEnvFile();
  
  console.log('\n\n✅ API STATUS CHECK COMPLETE');
  console.log('📋 Review the recommendations above to configure your APIs');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAPITests();
}

export { runAPITests, testAPIStatus, testBlockchainSupport, generateEnvFile, generatePriorityList };


