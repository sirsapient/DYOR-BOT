const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMockConfidence() {
  try {
    console.log('=== Testing Mock Confidence Endpoint ===');
    console.log('Making request to: http://localhost:4000/api/research-mock');
    
    const response = await fetch('http://localhost:4000/api/research-mock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'Test Project' })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('✅ Mock endpoint returned successful response');
    console.log('Response keys:', Object.keys(data));
    console.log('Has confidence field:', 'confidence' in data);
    
    if (data.confidence) {
      console.log('✅ Confidence data found!');
      console.log('Confidence structure:');
      console.log('- overall score:', data.confidence.overall.score);
      console.log('- overall grade:', data.confidence.overall.grade);
      console.log('- overall level:', data.confidence.overall.level);
      console.log('- sourceDetails length:', data.confidence.sourceDetails?.length);
      console.log('- limitations:', data.confidence.limitations);
      console.log('- strengths:', data.confidence.strengths);
      console.log('- userGuidance:', data.confidence.userGuidance);
      
      console.log('\n📊 Confidence Breakdown:');
      console.log('- Data Completeness:', data.confidence.breakdown.dataCompleteness.score + '%');
      console.log('- Source Reliability:', data.confidence.breakdown.sourceReliability.score + '%');
      console.log('- Data Freshness:', data.confidence.breakdown.dataFreshness.score + '%');
      
      console.log('\n🔍 Source Details:');
      data.confidence.sourceDetails.forEach((source, index) => {
        console.log(`${index + 1}. ${source.displayName}: ${source.found ? '✅' : '❌'} (${source.confidence}% confidence)`);
      });
    } else {
      console.log('❌ No confidence data found in response');
      console.log('Available fields:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('❌ Error testing mock confidence:', error);
  }
}

testMockConfidence(); 