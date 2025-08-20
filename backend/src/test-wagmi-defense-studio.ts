// Test script to debug WAGMI Defense studio detection
import { FreeSearchService } from './search-service';

async function testWagmiDefenseStudioDetection() {
  console.log('🎮 Testing WAGMI Defense studio detection...');
  
  const searchService = FreeSearchService.getInstance();
  
  // Test the specialized gaming project search
  console.log('\n🔍 Testing specialized gaming project search...');
  const gamingResults = await searchService.searchForGamingProject('WAGMI Defense');
  
  console.log(`\n✅ Gaming search found ${gamingResults.length} results:`);
  gamingResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   URL: ${result.link}`);
    console.log(`   Snippet: ${result.snippet}`);
    console.log('');
  });
  
  // Test specific studio-related searches
  console.log('\n🔍 Testing specific studio searches...');
  const studioSearchTerms = [
    'WAGMI Defense studio',
    'WAGMI Defense developer',
    'WAGMI Defense created by',
    'WAGMI Defense developed by',
    'WAGMI Defense team',
    'WAGMI Defense company',
    'WAGMI Games',
    'WAGMI Games studio',
    'WAGMI Games developer'
  ];
  
  for (const term of studioSearchTerms) {
    console.log(`\n🔍 Testing: "${term}"`);
    try {
      const results = await searchService.search(term, 3);
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     URL: ${result.link}`);
      });
    } catch (error) {
      console.log(`❌ Search failed: ${(error as Error).message}`);
    }
    
    // Add delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test direct URL patterns for studio detection
  console.log('\n🔍 Testing studio URL patterns...');
  const studioUrlPatterns = [
    'https://wagmigames.com',
    'https://www.wagmigames.com',
    'https://wagmigames.io',
    'https://wagmigames.xyz',
    'https://wagmidefensegames.com',
    'https://wagmidefensestudio.com',
    'https://wagmidefensedev.com'
  ];
  
  for (const url of studioUrlPatterns) {
    console.log(`\n🔍 Testing URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`✅ URL accessible: ${url}`);
      } else {
        console.log(`❌ URL not accessible: ${url} (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ URL test failed: ${url} - ${(error as Error).message}`);
    }
  }
  
  console.log('\n🎮 Studio detection test completed!');
}

// Run the test
testWagmiDefenseStudioDetection().catch(console.error);

