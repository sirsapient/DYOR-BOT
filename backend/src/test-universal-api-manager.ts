// Test Universal API Manager
import { universalAPIManager } from './universal-api-manager';

async function testUniversalAPIManager() {
  console.log('🚀 Testing Universal API Manager...\n');
  
  try {
    // Test 1: Get API Status
    console.log('📊 Current API Status:');
    const status = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${status.totalUsage} requests`);
    console.log(`   Total Cost: $${status.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${status.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${status.overallSuccessRate.toFixed(1)}%`);
    console.log(`   Throttled APIs: ${status.throttledAPIs.length > 0 ? status.throttledAPIs.join(', ') : 'None'}`);
    
    if (status.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      status.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    // Test 2: Get Optimal API Coordination
    console.log('\n🎯 Testing API Coordination:');
    
    const blockchainPlan = universalAPIManager.getOptimalAPICoordination('blockchain', {
      maxCost: 0.01,
      maxLatency: 5000,
      minSuccessRate: 90
    });
    console.log(`   Blockchain Research: ${blockchainPlan.primaryAPI} (confidence: ${(blockchainPlan.confidence * 100).toFixed(1)}%)`);
    console.log(`   Fallbacks: ${blockchainPlan.fallbackAPIs.join(', ')}`);
    console.log(`   Estimated Cost: $${blockchainPlan.estimatedCost.toFixed(4)}`);
    console.log(`   Estimated Time: ${blockchainPlan.estimatedTime.toFixed(0)}ms`);

    const nftPlan = universalAPIManager.getOptimalAPICoordination('nft', {
      maxCost: 0.005,
      maxLatency: 10000,
      minSuccessRate: 85
    });
    console.log(`   NFT Research: ${nftPlan.primaryAPI} (confidence: ${(nftPlan.confidence * 100).toFixed(1)}%)`);
    console.log(`   Fallbacks: ${nftPlan.fallbackAPIs.join(', ')}`);
    console.log(`   Estimated Cost: $${nftPlan.estimatedCost.toFixed(4)}`);
    console.log(`   Estimated Time: ${nftPlan.estimatedTime.toFixed(0)}ms`);

    const searchPlan = universalAPIManager.getOptimalAPICoordination('search', {
      maxCost: 0,
      maxLatency: 3000,
      minSuccessRate: 80
    });
    console.log(`   Search Research: ${searchPlan.primaryAPI} (confidence: ${(searchPlan.confidence * 100).toFixed(1)}%)`);
    console.log(`   Fallbacks: ${searchPlan.fallbackAPIs.join(', ')}`);
    console.log(`   Estimated Cost: $${searchPlan.estimatedCost.toFixed(4)}`);
    console.log(`   Estimated Time: ${searchPlan.estimatedTime.toFixed(0)}ms`);

    // Test 3: Simulate API Calls
    console.log('\n🔄 Simulating API Calls:');
    
    // Test DuckDuckGo API
    try {
      console.log('   Testing DuckDuckGo API...');
      const response = await universalAPIManager.makeAPICall(
        'duckduckgo',
        '/?q=test&format=json&no_html=1',
        { method: 'GET' },
        'high'
      );
      console.log(`   ✅ DuckDuckGo: ${response.status} (${response.statusText})`);
    } catch (error) {
      console.log(`   ❌ DuckDuckGo: ${(error as Error).message}`);
    }

    // Test CoinGecko API
    try {
      console.log('   Testing CoinGecko API...');
      const response = await universalAPIManager.makeAPICall(
        'coingecko',
        '/ping',
        { method: 'GET' },
        'high'
      );
      console.log(`   ✅ CoinGecko: ${response.status} (${response.statusText})`);
    } catch (error) {
      console.log(`   ❌ CoinGecko: ${(error as Error).message}`);
    }

    // Test 4: Get Usage Statistics
    console.log('\n📈 Usage Statistics (Last 24 hours):');
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

    // Test 5: Rate Limiting Test
    console.log('\n⏱️ Rate Limiting Test:');
    console.log('   Making multiple rapid requests to test rate limiting...');
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        universalAPIManager.makeAPICall(
          'duckduckgo',
          `/?q=test${i}&format=json&no_html=1`,
          { method: 'GET' },
          'medium'
        ).then(response => ({ success: true, status: response.status }))
        .catch(error => ({ success: false, error: (error as Error).message }))
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`   Results: ${successful} successful, ${failed} failed`);
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`     Request ${index + 1}: ✅ ${(result as any).status}`);
      } else {
        console.log(`     Request ${index + 1}: ❌ ${(result as any).error}`);
      }
    });

    // Test 6: Final Status
    console.log('\n📊 Final API Status:');
    const finalStatus = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${finalStatus.totalUsage} requests`);
    console.log(`   Total Cost: $${finalStatus.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${finalStatus.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${finalStatus.overallSuccessRate.toFixed(1)}%`);

    console.log('\n✅ Universal API Manager test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUniversalAPIManager();
