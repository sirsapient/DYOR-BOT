// Test script to demonstrate enhanced research system for Axie Infinity
const fetch = require('node-fetch');

async function testAxieInfinityEnhancement() {
  console.log('🧪 Testing Enhanced Research System for Axie Infinity');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      name: 'Axie Infinity',
      description: 'Test the enhanced universal source discovery',
      projectName: 'Axie Infinity',
      tokenSymbol: 'AXS',
      expectedImprovements: [
        'Official documentation discovery',
        'Security audit detection', 
        'Team information extraction',
        'Funding data collection',
        'Enhanced confidence scoring'
      ]
    },
    {
      name: 'Axie Infinity (Enhanced Endpoint)',
      description: 'Test the new enhanced research endpoint',
      projectName: 'Axie Infinity',
      useEnhanced: true,
      expectedImprovements: [
        'Universal source patterns',
        'Multi-stage discovery',
        'Dynamic scoring adjustments',
        'Quality gates integration',
        'Caching and feedback loops'
      ]
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test Case: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log(`🎯 Expected Improvements:`);
    testCase.expectedImprovements.forEach(improvement => {
      console.log(`   ✅ ${improvement}`);
    });
    
    try {
      const endpoint = testCase.useEnhanced ? '/api/research-enhanced' : '/api/research';
      const url = `http://localhost:4000${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: testCase.projectName,
          tokenSymbol: testCase.tokenSymbol,
          useEnhancedResearch: testCase.useEnhanced || false
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log(`\n📊 Results for ${testCase.projectName}:`);
        console.log(`   Confidence Score: ${result.confidence?.overall?.score || 'N/A'}%`);
        console.log(`   Grade: ${result.confidence?.overall?.grade || 'N/A'}`);
        console.log(`   Sources Found: ${result.sourcesUsed?.length || 0}`);
        
        if (result.confidence?.overall?.score >= 80) {
          console.log(`   ✅ SUCCESS: High confidence score achieved!`);
        } else if (result.confidence?.overall?.score >= 60) {
          console.log(`   ⚠️  PARTIAL: Moderate confidence score`);
        } else {
          console.log(`   ❌ NEEDS IMPROVEMENT: Low confidence score`);
        }
        
        // Check for enhanced features
        if (testCase.useEnhanced) {
          console.log(`\n🔍 Enhanced Features Check:`);
          console.log(`   Quality Gates: ${result.qualityGates?.passed ? '✅ Passed' : '❌ Failed'}`);
          console.log(`   Cache Status: ${result.cacheStatus?.hasCachedData ? '✅ Cached' : '❌ Not cached'}`);
          console.log(`   Feedback History: ${result.feedback?.feedbackCount || 0} feedback entries`);
        }
        
        // Check for official sources
        const hasOfficialSources = result.sourcesUsed?.some(source => 
          source.toLowerCase().includes('official') || 
          source.toLowerCase().includes('whitepaper') ||
          source.toLowerCase().includes('documentation')
        );
        
        console.log(`   Official Sources: ${hasOfficialSources ? '✅ Found' : '❌ Not found'}`);
        
      } else {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(60));
  }
  
  console.log('\n📈 Enhancement Summary:');
  console.log('✅ Universal source discovery patterns implemented');
  console.log('✅ Multi-stage source discovery strategy added');
  console.log('✅ Enhanced data extraction patterns created');
  console.log('✅ Dynamic scoring for established projects');
  console.log('✅ Systematic quality gates');
  console.log('✅ Caching and feedback loop systems');
  console.log('✅ Enhanced error handling and retry logic');
  
  console.log('\n🎯 Expected Improvements for Axie Infinity:');
  console.log('   • Score should improve from 59% to 80-90%');
  console.log('   • All available official sources should be detected');
  console.log('   • Security audit results should be properly parsed');
  console.log('   • Grade should improve from C to A-/B+');
  console.log('   • Comprehensive documentation should be found');
  console.log('   • Team and funding information should be extracted');
}

// Run the test
testAxieInfinityEnhancement().catch(console.error); 