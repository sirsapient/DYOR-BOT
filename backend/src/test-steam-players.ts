// Test Steam Player Count Service
// Verify that our Steam player count integration works correctly

import { steamPlayerCountService } from './steam-player-count';

async function testSteamPlayerCount() {
  console.log('🎮 TESTING STEAM PLAYER COUNT SERVICE');
  console.log('=====================================\n');

  const testGames = [
    'Counter-Strike 2',
    'Dota 2',
    'PUBG: BATTLEGROUNDS',
    'Team Fortress 2',
    'Rust',
    'ARK: Survival Evolved',
    'Rocket League',
    'Rainbow Six Siege',
    'Valheim',
    'Baldur\'s Gate 3'
  ];

  console.log(`📊 Testing ${testGames.length} popular Steam games...\n`);

  const results = [];
  const startTime = Date.now();

  for (const gameName of testGames) {
    try {
      console.log(`🔍 Testing: ${gameName}`);
      const playerData = await steamPlayerCountService.getPlayerCount(gameName);
      
      const result = {
        gameName,
        success: playerData.success,
        currentPlayers: playerData.currentPlayers,
        appId: playerData.appId,
        error: playerData.error
      };
      
      results.push(result);
      
      if (playerData.success) {
        console.log(`✅ ${gameName}: ${playerData.currentPlayers.toLocaleString()} players (App ID: ${playerData.appId})`);
      } else {
        console.log(`❌ ${gameName}: ${playerData.error}`);
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error testing ${gameName}:`, error);
      results.push({
        gameName,
        success: false,
        currentPlayers: 0,
        appId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const totalTime = Date.now() - startTime;
  const successfulTests = results.filter(r => r.success).length;
  const totalPlayers = results.filter(r => r.success).reduce((sum, r) => sum + r.currentPlayers, 0);

  console.log('\n📋 TEST RESULTS');
  console.log('===============');
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`✅ Successful Tests: ${successfulTests}/${testGames.length} (${(successfulTests/testGames.length*100).toFixed(1)}%)`);
  console.log(`👥 Total Players: ${totalPlayers.toLocaleString()}`);
  console.log(`📊 Average Players per Game: ${Math.round(totalPlayers/successfulTests).toLocaleString()}`);

  console.log('\n📊 DETAILED RESULTS:');
  console.log('===================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const players = result.success ? result.currentPlayers.toLocaleString() : 'N/A';
    const appId = result.appId || 'N/A';
    
    console.log(`${status} ${result.gameName}:`);
    console.log(`   👥 Players: ${players}`);
    console.log(`   🆔 App ID: ${appId}`);
    if (!result.success && result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
    console.log('');
  });

  // Test game search functionality
  console.log('🔍 TESTING GAME SEARCH:');
  console.log('=======================');
  
  const searchQueries = ['counter', 'dota', 'rust', 'ark', 'rocket'];
  
  for (const query of searchQueries) {
    const searchResults = steamPlayerCountService.searchGames(query);
    console.log(`Search "${query}": ${searchResults.length} games found`);
    searchResults.slice(0, 3).forEach(game => {
      console.log(`  - ${game.gameName} (${game.steamAppId})`);
    });
    console.log('');
  }

  return {
    success: true,
    results,
    stats: {
      totalTime,
      successfulTests,
      totalPlayers,
      averagePlayers: Math.round(totalPlayers/successfulTests)
    }
  };
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSteamPlayerCount()
    .then(result => {
      console.log('\n🎉 STEAM PLAYER COUNT TEST COMPLETED!');
      console.log('=====================================');
      console.log(`✅ Success Rate: ${(result.stats.successfulTests/10*100).toFixed(1)}%`);
      console.log(`👥 Total Players: ${result.stats.totalPlayers.toLocaleString()}`);
      console.log(`📊 Average Players: ${result.stats.averagePlayers.toLocaleString()}`);
      console.log(`⏱️  Total Time: ${result.stats.totalTime}ms`);
    })
    .catch(error => {
      console.error('❌ Steam player count test failed:', error);
    });
}
