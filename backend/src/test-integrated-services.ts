// Test Integrated Services with Universal API Manager
import { freeSearchService } from './search-service';
import { NFTService } from './nft-service';
import { universalAPIManager } from './universal-api-manager';

async function testIntegratedServices() {
  console.log('🚀 Testing Integrated Services with Universal API Manager...\n');
  
  try {
    // Test 1: Enhanced Search Service
    console.log('🔍 Testing Enhanced Search Service:');
    const searchResults = await freeSearchService.search('Elumia blockchain game', 3);
    console.log(`   ✅ Found ${searchResults.length} search results`);
    searchResults.forEach((result, index) => {
      console.log(`     ${index + 1}. ${result.title}`);
      console.log(`        URL: ${result.link}`);
    });

    // Test 2: Enhanced NFT Service
    console.log('\n🎨 Testing Enhanced NFT Service:');
    const nftService = NFTService.getInstance();
    const nftResults = await nftService.searchNFTs('Elumia');
    console.log(`   ✅ Found ${nftResults.length} NFT collections`);
    nftResults.forEach((nft, index) => {
      console.log(`     ${index + 1}. ${nft.collectionName} (${nft.marketplace})`);
      console.log(`        Network: ${nft.network}, Floor: ${nft.floorPrice} ${nft.floorPriceCurrency}`);
    });

    // Test 3: API Manager Status
    console.log('\n📊 API Manager Status:');
    const status = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${status.totalUsage} requests`);
    console.log(`   Total Cost: $${status.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${status.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${status.overallSuccessRate.toFixed(1)}%`);
    
    if (status.throttledAPIs.length > 0) {
      console.log(`   Throttled APIs: ${status.throttledAPIs.join(', ')}`);
    }

    // Test 4: Usage Statistics
    console.log('\n📈 Usage Statistics:');
    const stats = universalAPIManager.getUsageStatistics();
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Successful: ${stats.successfulRequests}`);
    console.log(`   Failed: ${stats.failedRequests}`);
    console.log(`   Average Response Time: ${stats.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Total Cost: $${stats.totalCost.toFixed(4)}`);
    
    if (Object.keys(stats.requestsByAPI).length > 0) {
      console.log('\n   Requests by API:');
      Object.entries(stats.requestsByAPI).forEach(([api, count]) => {
        console.log(`     ${api}: ${count} requests`);
      });
    }

    // Test 5: API Coordination
    console.log('\n🎯 Testing API Coordination:');
    
    const blockchainPlan = universalAPIManager.getOptimalAPICoordination('blockchain', {
      maxCost: 0.01,
      maxLatency: 5000,
      minSuccessRate: 90
    });
    console.log(`   Blockchain: ${blockchainPlan.primaryAPI} (${(blockchainPlan.confidence * 100).toFixed(1)}% confidence)`);
    
    const nftPlan = universalAPIManager.getOptimalAPICoordination('nft', {
      maxCost: 0.01,
      maxLatency: 10000,
      minSuccessRate: 85
    });
    console.log(`   NFT: ${nftPlan.primaryAPI} (${(nftPlan.confidence * 100).toFixed(1)}% confidence)`);
    
    const searchPlan = universalAPIManager.getOptimalAPICoordination('search', {
      maxCost: 0,
      maxLatency: 5000,
      minSuccessRate: 80
    });
    console.log(`   Search: ${searchPlan.primaryAPI} (${(searchPlan.confidence * 100).toFixed(1)}% confidence)`);

    // Test 6: Rate Limiting Test
    console.log('\n⏱️ Rate Limiting Test:');
    console.log('   Making multiple rapid requests to test rate limiting...');
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        freeSearchService.search(`test query ${i}`, 2)
          .then(results => ({ success: true, count: results.length }))
          .catch(error => ({ success: false, error: (error as Error).message }))
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`   Results: ${successful} successful, ${failed} failed`);
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`     Request ${index + 1}: ✅ ${(result as any).count} results`);
      } else {
        console.log(`     Request ${index + 1}: ❌ ${(result as any).error}`);
      }
    });

    // Test 7: Final Status
    console.log('\n📊 Final API Manager Status:');
    const finalStatus = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${finalStatus.totalUsage} requests`);
    console.log(`   Total Cost: $${finalStatus.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${finalStatus.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${finalStatus.overallSuccessRate.toFixed(1)}%`);

    if (finalStatus.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      finalStatus.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    console.log('\n✅ Integrated services test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testIntegratedServices();
