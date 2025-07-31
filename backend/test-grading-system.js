// Test script to verify the grading system is working
const fetch = require('node-fetch');

async function testGradingSystem() {
  try {
    console.log('Testing DYOR BOT Grading System...\n');
    
    // Test with a known project
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'Axie Infinity'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response Received');
    console.log(`Project: ${data.projectName}`);
    console.log(`Type: ${data.projectType}`);
    
    // Check if confidence metrics are present
    if (data.confidence) {
      console.log('\n🎯 GRADING SYSTEM WORKING!');
      console.log(`Overall Score: ${data.confidence.overall.score}%`);
      console.log(`Grade: ${data.confidence.overall.grade}`);
      console.log(`Confidence Level: ${data.confidence.overall.level}`);
      console.log(`Description: ${data.confidence.overall.description}`);
      
      console.log('\n📊 Breakdown:');
      console.log(`- Data Completeness: ${data.confidence.breakdown.dataCompleteness.score}%`);
      console.log(`- Source Reliability: ${data.confidence.breakdown.sourceReliability.score}%`);
      console.log(`- Data Freshness: ${data.confidence.breakdown.dataFreshness.score}%`);
      
      console.log('\n💡 User Guidance:');
      console.log(`- Trust Level: ${data.confidence.userGuidance.trustLevel}`);
      console.log(`- Use Case: ${data.confidence.userGuidance.useCase}`);
      
      if (data.confidence.userGuidance.warnings.length > 0) {
        console.log(`- Warnings: ${data.confidence.userGuidance.warnings.join(', ')}`);
      }
      
      console.log('\n📈 Strengths:');
      data.confidence.strengths.forEach(strength => {
        console.log(`  ✅ ${strength}`);
      });
      
      console.log('\n⚠️ Limitations:');
      data.confidence.limitations.forEach(limitation => {
        console.log(`  ⚠️ ${limitation}`);
      });
      
      console.log('\n🔍 Data Sources:');
      data.confidence.sourceDetails.forEach(source => {
        const status = source.found ? '✅' : '❌';
        console.log(`  ${status} ${source.displayName}: ${source.dataPoints} data points`);
      });
      
    } else {
      console.log('❌ No confidence metrics found in response');
      console.log('Available fields:', Object.keys(data));
    }
    
    // Check if research quality is present
    if (data.researchQuality) {
      console.log('\n🔬 Research Quality Assessment:');
      console.log(`- Score: ${data.researchQuality.score}/100`);
      console.log(`- Grade: ${data.researchQuality.grade}`);
      console.log(`- Passes Threshold: ${data.researchQuality.passesThreshold}`);
      console.log(`- Proceed with Analysis: ${data.researchQuality.proceedWithAnalysis}`);
      
      if (data.researchQuality.qualityGates) {
        console.log('\n🚦 Quality Gates:');
        console.log(`- Passed: ${data.researchQuality.qualityGates.passed}`);
        console.log(`- Severity: ${data.researchQuality.qualityGates.severity}`);
        if (data.researchQuality.qualityGates.gatesFailed.length > 0) {
          console.log(`- Failed Gates: ${data.researchQuality.qualityGates.gatesFailed.join(', ')}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGradingSystem(); 