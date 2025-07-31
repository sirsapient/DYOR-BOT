const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('Testing API confidence data...');
    
    const response = await fetch('http://localhost:4001/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'Axie Infinity'
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    
    console.log('API Response received!');
    console.log('Response keys:', Object.keys(data));
    console.log('Has confidence field:', 'confidence' in data);
    
    if (data.confidence) {
      console.log('✅ Confidence data found!');
      console.log('Confidence structure:');
      console.log('- overall:', data.confidence.overall);
      console.log('- breakdown:', data.confidence.breakdown);
      console.log('- sourceDetails length:', data.confidence.sourceDetails?.length);
      console.log('- limitations:', data.confidence.limitations);
      console.log('- strengths:', data.confidence.strengths);
      console.log('- userGuidance:', data.confidence.userGuidance);
    } else {
      console.log('❌ No confidence data found in response');
      console.log('Available fields:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI(); 