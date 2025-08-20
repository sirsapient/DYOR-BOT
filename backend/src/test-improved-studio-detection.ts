// Test script to test improved studio detection with WAGMI Defense
import { FreeSearchService } from './search-service';

async function testImprovedStudioDetection() {
  console.log('🎮 Testing improved studio detection with WAGMI Defense...');
  
  const searchService = FreeSearchService.getInstance();
  
  // Test the studio search term generation
  console.log('\n🔍 Testing studio search term generation...');
  const projectName = 'WAGMI Defense';
  
  // Access the private method for testing (we'll test it indirectly through the gaming search)
  console.log(`\n📝 Project: ${projectName}`);
  console.log('🎯 Expected studio terms: WAGMI Games, WAGMI Studio, WAGMI Dev, etc.');
  
  // Test the specialized gaming project search with improved studio detection
  console.log('\n🔍 Testing specialized gaming project search with studio detection...');
  const gamingResults = await searchService.searchForGamingProject(projectName);
  
  console.log(`\n✅ Gaming search with studio detection found ${gamingResults.length} results:`);
  gamingResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   URL: ${result.link}`);
    if (result.snippet && result.snippet.length > 30) {
      console.log(`   Snippet: ${result.snippet.substring(0, 80)}...`);
    }
    console.log('');
  });
  
  // Test specific studio searches that should work
  console.log('\n🔍 Testing specific studio searches...');
  const specificStudioSearches = [
    'WAGMI Games',
    'WAGMI Studio',
    'WAGMI Dev',
    'WAGMI Interactive',
    'WAGMI Entertainment',
    'WAGMI Labs',
    'WAGMI DAO',
    'WAGMI Protocol'
  ];
  
  for (const searchTerm of specificStudioSearches.slice(0, 4)) { // Test first 4 to avoid rate limiting
    console.log(`\n🔍 Testing: "${searchTerm}"`);
    try {
      const results = await searchService.search(searchTerm, 3);
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     URL: ${result.link}`);
        if (result.snippet && result.snippet.length > 30) {
          console.log(`     Snippet: ${result.snippet.substring(0, 60)}...`);
        }
      });
    } catch (error) {
      console.log(`❌ Search failed: ${(error as Error).message}`);
    }
    
    // Add delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test the official sources search which should now include studio information
  console.log('\n🔍 Testing official sources search with studio detection...');
  try {
    const officialSources = await searchService.searchForOfficialSources(projectName);
    console.log('\n✅ Official sources found:');
    Object.entries(officialSources).forEach(([source, url]) => {
      if (url) {
        console.log(`  ${source}: ${url}`);
      }
    });
  } catch (error) {
    console.log(`❌ Official sources search failed: ${(error as Error).message}`);
  }
  
  console.log('\n🎮 Improved studio detection test completed!');
}

// Run the test
testImprovedStudioDetection().catch(console.error);

