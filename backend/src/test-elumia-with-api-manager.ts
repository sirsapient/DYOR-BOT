// Test Elumia with Integrated API Manager
import { conductAIOrchestratedResearch } from './ai-research-orchestrator';
import { universalAPIManager } from './universal-api-manager';

async function testElumiaWithAPIManager() {
  console.log('🧪 Testing Elumia with Integrated API Manager...\n');
  
  try {
    // Get initial API status
    console.log('📊 Initial API Manager Status:');
    const initialStatus = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${initialStatus.totalUsage} requests`);
    console.log(`   Total Cost: $${initialStatus.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${initialStatus.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${initialStatus.overallSuccessRate.toFixed(1)}%`);

    // Test AI Orchestrator with Elumia
    console.log('\n🤖 Testing AI Orchestrator with Elumia:');
    const result = await conductAIOrchestratedResearch(
      'Elumia',
      process.env.ANTHROPIC_API_KEY || '',
      {
        name: 'Elumia',
        aliases: ['Elumia', 'Heroes of Elumia', 'Elumia Heroes', 'Legends of Elumia', 'Elumians']
      }
    );

    console.log('\n📊 AI Orchestrator Results:');
    console.log(`   Success: ${result.success ? 'Yes' : 'No'}`);
    console.log(`   Total Data Points: ${result.totalDataPoints}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Sources Found: ${result.successfulSources}`);

    if (result.findings) {
      console.log('\n🔍 Data Sources Found:');
      Object.entries(result.findings).forEach(([source, data]) => {
        if (data && typeof data === 'object' && 'dataPoints' in data) {
          console.log(`   ${source}: ${(data as any).dataPoints} data points`);
        }
      });
    }

    // Get final API status
    console.log('\n📊 Final API Manager Status:');
    const finalStatus = universalAPIManager.getAPIStatus();
    console.log(`   Total Usage: ${finalStatus.totalUsage} requests`);
    console.log(`   Total Cost: $${finalStatus.totalCost.toFixed(4)}`);
    console.log(`   Average Response Time: ${finalStatus.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Overall Success Rate: ${finalStatus.overallSuccessRate.toFixed(1)}%`);

    // Show usage statistics
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

    // Show API health
    console.log('\n🏥 API Health Status:');
    finalStatus.apis.forEach(api => {
      const health = api.isThrottled || api.successRate < 70 ? '❌ Critical' :
                    api.successRate < 90 || api.averageResponseTime > 5000 ? '⚠️ Warning' : '✅ Healthy';
      console.log(`   ${health} ${api.apiName}: ${api.successRate.toFixed(1)}% success, ${api.averageResponseTime.toFixed(0)}ms avg`);
    });

    if (finalStatus.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      finalStatus.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    console.log('\n✅ Elumia test with API Manager completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testElumiaWithAPIManager();
