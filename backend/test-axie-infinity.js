const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAxieInfinity() {
  try {
    console.log('=== Testing Axie Infinity Search ===');
    console.log('Making request to: http://localhost:4000/api/research');
    
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'Axie Infinity' })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 404) {
      console.log('✅ Backend correctly returned 404 with error message');
      console.log('Error message:', data.error);
    } else if (response.ok) {
      console.log('✅ Backend returned successful response');
      console.log('Has confidence data:', 'confidence' in data);
      if ('confidence' in data) {
        console.log('Confidence data:', JSON.stringify(data.confidence, null, 2));
      }
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing Axie Infinity:', error);
  }
}

testAxieInfinity(); 