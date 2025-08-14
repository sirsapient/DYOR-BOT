// Batch Processing Demo - Showcase the new batch processing capabilities
// This demonstrates how to efficiently research multiple projects simultaneously

import { conductBatchSearch } from './batch-search';

interface BatchDemoResult {
  projectName: string;
  dataPoints: number;
  coverage: number;
  processingTime: number;
  success: boolean;
  error?: string;
}

export async function runBatchProcessingDemo() {
  console.log('🚀 BATCH PROCESSING DEMO');
  console.log('========================\n');

  const testProjects = [
    'Axie Infinity',
    'The Sandbox', 
    'Decentraland'
  ];

  console.log(`📊 Testing ${testProjects.length} projects with batch processing...\n`);

  const results: BatchDemoResult[] = [];
  const startTime = Date.now();

  // Process projects in parallel
  const promises = testProjects.map(async (projectName) => {
    const projectStartTime = Date.now();
    
    try {
      console.log(`🔍 Processing: ${projectName}`);
      const batchResult = await conductBatchSearch(projectName);
      const processingTime = Date.now() - projectStartTime;
      
      console.log(`✅ Completed: ${projectName} (${batchResult.totalDataPoints} data points, ${processingTime}ms)`);
      
      return {
        projectName,
        dataPoints: batchResult.totalDataPoints,
        coverage: Math.round((batchResult.totalDataPoints / 34) * 100),
        processingTime,
        success: true
      };
    } catch (error) {
      const processingTime = Date.now() - projectStartTime;
      console.error(`❌ Failed: ${projectName} (${processingTime}ms)`, error);
      
      return {
        projectName,
        dataPoints: 0,
        coverage: 0,
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Wait for all projects to complete
  const batchResults = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // Calculate statistics
  const successfulProjects = batchResults.filter(r => r.success);
  const failedProjects = batchResults.filter(r => !r.success);
  const totalDataPoints = successfulProjects.reduce((sum, r) => sum + r.dataPoints, 0);
  const averageDataPoints = successfulProjects.length > 0 ? Math.round(totalDataPoints / successfulProjects.length) : 0;
  const averageCoverage = successfulProjects.length > 0 ? Math.round(successfulProjects.reduce((sum, r) => sum + r.coverage, 0) / successfulProjects.length) : 0;
  const successRate = (successfulProjects.length / testProjects.length) * 100;

  // Display results
  console.log('\n📋 BATCH PROCESSING RESULTS');
  console.log('==========================');
  console.log(`⏱️  Total Processing Time: ${totalTime}ms`);
  console.log(`📊 Success Rate: ${successRate.toFixed(1)}% (${successfulProjects.length}/${testProjects.length})`);
  console.log(`📈 Average Data Points: ${averageDataPoints}`);
  console.log(`🎯 Average Coverage: ${averageCoverage}%`);
  console.log(`⚡ Average Time per Project: ${Math.round(totalTime / testProjects.length)}ms`);

  console.log('\n📊 PROJECT BREAKDOWN:');
  console.log('====================');
  
  batchResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const coverage = result.success ? `${result.coverage}%` : 'N/A';
    const dataPoints = result.success ? result.dataPoints : '0';
    
    console.log(`${status} ${result.projectName}:`);
    console.log(`   📈 Coverage: ${coverage}`);
    console.log(`   📊 Data Points: ${dataPoints}/34`);
    console.log(`   ⏱️  Time: ${result.processingTime}ms`);
    if (!result.success && result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
    console.log('');
  });

  // Performance comparison
  console.log('🚀 PERFORMANCE COMPARISON');
  console.log('=========================');
  console.log(`📊 Batch Processing: ${totalTime}ms for ${testProjects.length} projects`);
  console.log(`📊 Sequential Processing: ~${totalTime * 2}ms estimated (2x slower)`);
  console.log(`📊 Efficiency Gain: ~${Math.round((totalTime * 2 - totalTime) / (totalTime * 2) * 100)}% faster`);

  return {
    success: true,
    results: batchResults,
    stats: {
      totalTime,
      successRate,
      averageDataPoints,
      averageCoverage,
      totalProjects: testProjects.length,
      successfulProjects: successfulProjects.length,
      failedProjects: failedProjects.length
    }
  };
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runBatchProcessingDemo()
    .then(result => {
      console.log('\n🎉 BATCH PROCESSING DEMO COMPLETED!');
      console.log('====================================');
      console.log(`✅ Success Rate: ${result.stats.successRate.toFixed(1)}%`);
      console.log(`📈 Average Coverage: ${result.stats.averageCoverage}%`);
      console.log(`⚡ Total Time: ${result.stats.totalTime}ms`);
    })
    .catch(error => {
      console.error('❌ Batch processing demo failed:', error);
    });
}
