const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDataDebug() {
  try {
    console.log('🔍 Testing data structure that gets passed to mapDataToFindings...');
    
    // Simulate the data that would be passed to mapDataToFindings
    const testData = {
      cgData: { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
      igdbData: { name: 'Test Game', summary: 'A test game' },
      steamData: { name: 'Test Steam Game' },
      discordData: null,
      etherscanData: null,
      studioAssessment: null,
      securitySummary: null,
      twitterSummary: null,
      redditSummary: null,
      telegramSummary: null
    };
    
    console.log('Test data structure:');
    console.log('- cgData:', testData.cgData);
    console.log('- igdbData:', testData.igdbData);
    console.log('- steamData:', testData.steamData);
    
    // Test the mapDataToFindings function logic
    console.log('\n🔍 Testing mapDataToFindings logic...');
    
    // Test CoinGecko condition
    console.log('cgData && !cgData.error:', testData.cgData && !testData.cgData.error);
    
    // Test IGDB condition
    console.log('igdbData && !igdbData.error:', testData.igdbData && !testData.igdbData.error);
    
    // Test Steam condition
    console.log('steamData && !steamData.error:', testData.steamData && !testData.steamData.error);
    
    // Now test with error data
    console.log('\n🔍 Testing with error data...');
    const errorData = {
      cgData: { error: 'Some error' },
      igdbData: { error: 'Another error' },
      steamData: { error: 'Steam error' },
      discordData: null,
      etherscanData: null,
      studioAssessment: null,
      securitySummary: null,
      twitterSummary: null,
      redditSummary: null,
      telegramSummary: null
    };
    
    console.log('Error data conditions:');
    console.log('cgData && !cgData.error:', errorData.cgData && !errorData.cgData.error);
    console.log('igdbData && !igdbData.error:', errorData.igdbData && !errorData.igdbData.error);
    console.log('steamData && !steamData.error:', errorData.steamData && !errorData.steamData.error);
    
    // Test with null data
    console.log('\n🔍 Testing with null data...');
    const nullData = {
      cgData: null,
      igdbData: null,
      steamData: null,
      discordData: null,
      etherscanData: null,
      studioAssessment: null,
      securitySummary: null,
      twitterSummary: null,
      redditSummary: null,
      telegramSummary: null
    };
    
    console.log('Null data conditions:');
    console.log('cgData && !cgData.error:', nullData.cgData && !nullData.cgData.error);
    console.log('igdbData && !igdbData.error:', nullData.igdbData && !nullData.igdbData.error);
    console.log('steamData && !steamData.error:', nullData.steamData && !nullData.steamData.error);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDataDebug(); 