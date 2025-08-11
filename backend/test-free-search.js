// Test script for the free search service
const { freeSearchService } = require('./dist/search-service');

async function testFreeSearch() {
  console.log('🧪 Testing Free Search Service...\n');
  
  try {
    // Test 1: Basic search
    console.log('Test 1: Basic search for "Axie Infinity"');
    const results = await freeSearchService.search('Axie Infinity', 3);
    console.log(`Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title}`);
      console.log(`     URL: ${result.link}`);
      console.log(`     Snippet: ${result.snippet.substring(0, 100)}...`);
    });
    console.log('');
    
    // Test 2: Contract address search
    console.log('Test 2: Contract address search for "Axie Infinity"');
    const contractAddress = await freeSearchService.searchForContractAddress('Axie Infinity');
    console.log(`Contract address found: ${contractAddress || 'None'}`);
    console.log('');
    
    // Test 3: Official sources search
    console.log('Test 3: Official sources search for "Axie Infinity"');
    const sources = await freeSearchService.searchForOfficialSources('Axie Infinity');
    console.log('Sources found:');
    Object.entries(sources).forEach(([type, url]) => {
      console.log(`  ${type}: ${url || 'None'}`);
    });
    console.log('');
    
    // Test 4: Cache stats
    console.log('Test 4: Cache statistics');
    const cacheStats = freeSearchService.getCacheStats();
    console.log(`Cache size: ${cacheStats.size}`);
    console.log(`Cache entries: ${cacheStats.entries.length}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFreeSearch();
