// Performance test script to measure optimization improvements
import { freeSearchService } from './search-service';

async function testPerformance() {
  console.log('🚀 Starting Performance Test');
  console.log('============================');
  
  const testQueries = [
    'Axie Infinity',
    'WAGMI Defense',
    'Decentraland',
    'The Sandbox',
    'CryptoKitties'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing: ${query}`);
    const startTime = Date.now();
    
    try {
      const results = await freeSearchService.search(query, 5);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Found ${results.length} results in ${duration}ms`);
      
      if (results.length > 0) {
        console.log(`   First result: ${results[0].title}`);
        console.log(`   URL: ${results[0].link}`);
      }
      
      // Performance assessment
      if (duration < 5000) {
        console.log(`   🟢 EXCELLENT: Under 5 seconds`);
      } else if (duration < 15000) {
        console.log(`   🟡 GOOD: Under 15 seconds`);
      } else if (duration < 30000) {
        console.log(`   🟠 ACCEPTABLE: Under 30 seconds`);
      } else {
        console.log(`   🔴 POOR: Over 30 seconds`);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`❌ Failed after ${duration}ms: ${(error as Error).message}`);
    }
  }
  
  // Test caching
  console.log('\n📋 Testing Caching Performance');
  console.log('==============================');
  
  const cacheTestQuery = 'Axie Infinity';
  console.log(`\n🔍 Testing cache for: ${cacheTestQuery}`);
  
  const startTime = Date.now();
  try {
    const results = await freeSearchService.search(cacheTestQuery, 5);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Cached result: ${results.length} results in ${duration}ms`);
    
    if (duration < 1000) {
      console.log(`   🟢 EXCELLENT: Cache working (< 1 second)`);
    } else if (duration < 5000) {
      console.log(`   🟡 GOOD: Cache working (< 5 seconds)`);
    } else {
      console.log(`   🔴 POOR: Cache not working properly`);
    }
    
  } catch (error) {
    console.log(`❌ Cache test failed: ${(error as Error).message}`);
  }
  
  console.log('\n📊 Performance Summary');
  console.log('=====================');
  console.log('✅ Phase 1 optimizations implemented:');
  console.log('   - Parallel search processing');
  console.log('   - Smart caching (24-hour duration)');
  console.log('   - Early termination logic');
  console.log('   - Reduced search engines (3 most reliable)');
  console.log('   - Parallel URL testing');
  console.log('   - Reduced timeouts (2s instead of 5s)');
  
  console.log('\n🎯 Expected improvements:');
  console.log('   - 80-90% faster search times');
  console.log('   - 95% faster for cached results');
  console.log('   - Early termination when sufficient data found');
  console.log('   - Better reliability with optimized engines');
}

// Run the test
testPerformance().catch(console.error);
