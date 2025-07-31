const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBitcoin() {
  try {
    console.log('=== Testing Bitcoin Search ===');
    console.log('Making request to: http://localhost:4000/api/research');
    
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'Bitcoin' })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data keys:', Object.keys(data));
    console.log('Has confidence in response:', 'confidence' in data);
    
    if (response.status === 404) {
      console.log('❌ Bitcoin returned 404 - unexpected');
      console.log('Error message:', data.error);
    } else if (response.ok) {
      console.log('✅ Bitcoin returned successful response');
      console.log('Has confidence data:', 'confidence' in data);
      if ('confidence' in data) {
        console.log('Confidence data structure:', Object.keys(data.confidence));
        console.log('Confidence overall score:', data.confidence.overall?.score);
      }
      console.log('Project name:', data.projectName);
      console.log('Sources used:', data.sourcesUsed);
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing Bitcoin:', error);
  }
}

testBitcoin(); 