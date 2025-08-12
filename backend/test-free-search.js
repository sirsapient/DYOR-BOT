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
    
    // Test 2: Contract address search for Axie Infinity
    console.log('Test 2: Contract address search for "Axie Infinity"');
    const contractAddress = await freeSearchService.searchForContractAddress('Axie Infinity');
    console.log(`Contract address found: ${contractAddress || 'None'}`);
    console.log('');
    
    // Test 3: Contract address search for a different project
    console.log('Test 3: Contract address search for "Decentraland"');
    const decentralandAddress = await freeSearchService.searchForContractAddress('Decentraland');
    console.log(`Contract address found: ${decentralandAddress || 'None'}`);
    console.log('');
    
    // Test 4: Official sources search for Axie Infinity
    console.log('Test 4: Official sources search for "Axie Infinity"');
    const sources = await freeSearchService.searchForOfficialSources('Axie Infinity');
    console.log('Sources found:');
    Object.entries(sources).forEach(([type, url]) => {
      if (Array.isArray(url)) {
        console.log(`  ${type}: ${url.length > 0 ? url.join(', ') : 'None'}`);
      } else {
        console.log(`  ${type}: ${url || 'None'}`);
      }
    });
    console.log('');
    
    // Test 5: Official sources search for "Decentraland"
    console.log('\nTest 5: Official sources search for "Decentraland"');
    const decentralandSources = await freeSearchService.searchForOfficialSources('Decentraland');
    console.log('Sources found:');
    Object.entries(decentralandSources).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`  ${key}: ${value.join(', ')}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    // Test 6: Official sources search for "The Sandbox"
    console.log('\nTest 6: Official sources search for "The Sandbox"');
    const sandboxSources = await freeSearchService.searchForOfficialSources('The Sandbox');
    console.log('Sources found:');
    Object.entries(sandboxSources).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`  ${key}: ${value.join(', ')}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    // Test 7: Cache statistics
    console.log('Test 7: Cache statistics');
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
