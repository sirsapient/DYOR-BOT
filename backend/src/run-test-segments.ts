// Test Segment Runner
// Easy way to run different test segments without timeout issues

import { 
  runQuickTest,
  runDefiTest,
  runNftTest,
  runWeb3GamesTest,
  MultiEcosystemTestRunner,
  TEST_PROJECTS
} from './test-multi-ecosystem-research';

async function showTestOptions() {
  console.log('🎯 DYOR BOT RESEARCH TEST SEGMENTS');
  console.log('===================================\n');
  
  console.log('Available test segments:');
  console.log('');
  console.log('1. ⚡ QUICK TEST (Recommended)');
  console.log('   • Tests 1-2 projects from each ecosystem');
  console.log('   • Total: ~14 projects across 7 ecosystems');
  console.log('   • Duration: ~5-10 minutes');
  console.log('   • Perfect for initial validation');
  console.log('');
  
  console.log('2. 🏦 DEFI ECOSYSTEM');
  console.log('   • Tests 5 DeFi protocols (Uniswap, Aave, Trader Joe, Raydium, GMX)');
  console.log('   • Focus: TVL, APY, Audits, Risk Assessment');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('3. 🎨 NFT ECOSYSTEM');
  console.log('   • Tests 5 NFT collections (BAYC, Doodles, Okay Bears, Azuki, Moonbirds)');
  console.log('   • Focus: Floor Price, Volume, Rarity, Community');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('4. 🎮 WEB3 GAMES ECOSYSTEM');
  console.log('   • Tests 5 Web3 games (Axie, Sandbox, Decentraland, Illuvium, Gods Unchained)');
  console.log('   • Focus: Player Count, Token Price, NFT Collections, Team Info');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('5. 🤖 AI ECOSYSTEM');
  console.log('   • Tests 5 AI projects (Fetch.ai, Ocean Protocol, SingularityNET, Bittensor, Render)');
  console.log('   • Focus: Model Performance, API Pricing, Team Expertise');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('6. 🪙 MEMECOIN ECOSYSTEM');
  console.log('   • Tests 5 meme coins (Dogecoin, Shiba Inu, Pepe, Bonk, Floki)');
  console.log('   • Focus: Community Sentiment, Viral Potential, Tokenomics');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('7. 🔗 INFRASTRUCTURE ECOSYSTEM');
  console.log('   • Tests 5 infrastructure projects (Polygon, Arbitrum, Optimism, Cosmos, Polkadot)');
  console.log('   • Focus: Network Metrics, Security, Scalability');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('8. 🏛️ DAO ECOSYSTEM');
  console.log('   • Tests 5 DAOs (Uniswap DAO, Aave DAO, MakerDAO, Compound DAO, ENS DAO)');
  console.log('   • Focus: Governance, Proposals, Treasury, Community');
  console.log('   • Duration: ~3-5 minutes');
  console.log('');
  
  console.log('9. 📊 CUSTOM ECOSYSTEMS');
  console.log('   • Choose specific ecosystems to test');
  console.log('   • Flexible configuration');
  console.log('');
  
  console.log('10. 📋 SHOW PROJECT DETAILS');
  console.log('    • View all test projects and their expected data');
  console.log('');
  
  console.log('11. 🚀 FULL TEST (Use with caution)');
  console.log('    • Tests all 35 projects across 7 ecosystems');
  console.log('    • Duration: ~20-30 minutes');
  console.log('    • May cause timeout issues');
  console.log('');
}

async function runCustomEcosystems() {
  const testRunner = new MultiEcosystemTestRunner(process.env.ANTHROPIC_API_KEY || '');
  const availableEcosystems = testRunner.getAvailableEcosystems();
  
  console.log('\n🔧 CUSTOM ECOSYSTEM SELECTION');
  console.log('=============================\n');
  
  console.log('Available ecosystems:');
  availableEcosystems.forEach((ecosystem, index) => {
    const projects = testRunner.getProjectsForEcosystem(ecosystem);
    console.log(`${index + 1}. ${ecosystem.toUpperCase()} (${projects.length} projects)`);
  });
  
  console.log('\nEnter ecosystem names separated by commas (e.g., "defi,nft"):');
  console.log('Or press Enter to go back to main menu');
  
  // For now, we'll use a simple approach - you can modify this based on your needs
  console.log('\nExample commands:');
  console.log('  npx ts-node src/run-test-segments.ts custom defi,nft');
  console.log('  npx ts-node src/run-test-segments.ts custom web3_games,dao');
}

async function showProjectDetails() {
  console.log('\n📋 TEST PROJECT DETAILS');
  console.log('=======================\n');
  
  for (const [ecosystem, projects] of Object.entries(TEST_PROJECTS)) {
    console.log(`🏷️ ${ecosystem.toUpperCase()} ECOSYSTEM`);
    console.log('─'.repeat(ecosystem.length + 10));
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   Description: ${project.description}`);
      console.log(`   Chain: ${project.chain}`);
      console.log(`   Priority: ${project.priority}`);
      console.log(`   Expected Data: ${project.expectedData.join(', ')}`);
      console.log('');
    });
  }
}

async function runAiTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['ai'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'ai-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['ai']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ AI ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 AI projects!');
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
  }
}

async function runMemecoinTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['memecoin'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'memecoin-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['memecoin']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ MEMECOIN ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 Memecoin projects!');
    
  } catch (error) {
    console.error('❌ Memecoin test failed:', error);
  }
}

async function runInfrastructureTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['infrastructure'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'infrastructure-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['infrastructure']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ INFRASTRUCTURE ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 Infrastructure projects!');
    
  } catch (error) {
    console.error('❌ Infrastructure test failed:', error);
  }
}

async function runDaoTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['dao'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'dao-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['dao']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ DAO ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 DAO projects!');
    
  } catch (error) {
    console.error('❌ DAO test failed:', error);
  }
}

async function runFullTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  console.log('⚠️ WARNING: This will test all 35 projects and may take 20-30 minutes');
  console.log('This could cause timeout issues in the conversation');
  console.log('Consider running individual ecosystem tests instead');
  console.log('');
  
  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    delayBetweenTests: 2000,
    delayBetweenEcosystems: 5000,
    saveResults: true,
    resultsFile: 'full-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.runComprehensiveTest();
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ FULL TEST COMPLETE');
    console.log('🎯 Research bot tested across all 35 projects in 7 ecosystems!');
    
  } catch (error) {
    console.error('❌ Full test failed:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'help':
    case 'options':
      await showTestOptions();
      break;
      
    case 'quick':
      console.log('🚀 Starting Quick Test...');
      await runQuickTest();
      break;
      
    case 'defi':
      console.log('🏦 Starting DeFi Ecosystem Test...');
      await runDefiTest();
      break;
      
    case 'nft':
      console.log('🎨 Starting NFT Ecosystem Test...');
      await runNftTest();
      break;
      
    case 'web3games':
      console.log('🎮 Starting Web3 Games Ecosystem Test...');
      await runWeb3GamesTest();
      break;
      
    case 'ai':
      console.log('🤖 Starting AI Ecosystem Test...');
      await runAiTest();
      break;
      
    case 'memecoin':
      console.log('🪙 Starting Memecoin Ecosystem Test...');
      await runMemecoinTest();
      break;
      
    case 'infrastructure':
      console.log('🔗 Starting Infrastructure Ecosystem Test...');
      await runInfrastructureTest();
      break;
      
    case 'dao':
      console.log('🏛️ Starting DAO Ecosystem Test...');
      await runDaoTest();
      break;
      
    case 'custom':
      const ecosystems = args[1]?.split(',') || [];
      if (ecosystems.length > 0) {
        console.log(`🔧 Starting Custom Test for: ${ecosystems.join(', ')}`);
        const testRunner = new MultiEcosystemTestRunner(process.env.ANTHROPIC_API_KEY || '');
        const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(ecosystems);
        testRunner.displayResults(results, summaries, overallSummary);
      } else {
        await runCustomEcosystems();
      }
      break;
      
    case 'projects':
    case 'details':
      await showProjectDetails();
      break;
      
    case 'full':
    case 'all':
      console.log('🚀 Starting Full Test (all 35 projects)...');
      await runFullTest();
      break;
      
    default:
      console.log('❌ Unknown command:', command);
      console.log('\nUsage: npx ts-node src/run-test-segments.ts [command]');
      console.log('\nRun "npx ts-node src/run-test-segments.ts help" to see all options');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  showTestOptions,
  runQuickTest,
  runDefiTest,
  runNftTest,
  runWeb3GamesTest,
  runAiTest,
  runMemecoinTest,
  runInfrastructureTest,
  runDaoTest,
  runFullTest,
  showProjectDetails
};
