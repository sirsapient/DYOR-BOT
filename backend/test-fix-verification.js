const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFixVerification() {
  try {
    console.log('=== Testing Fix Verification ===');
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

    if (response.status === 200) {
      console.log('✅ Backend returned successful response');
      console.log('Has confidence data:', 'confidence' in data);
      console.log('Sources used:', data.sourcesUsed);
      
      if ('confidence' in data) {
        console.log('Confidence data:', JSON.stringify(data.confidence, null, 2));
      }
      
      if (data.sourcesUsed && data.sourcesUsed.includes('CoinGecko')) {
        console.log('✅ CoinGecko is in sourcesUsed - fix worked!');
      } else {
        console.log('❌ CoinGecko not in sourcesUsed:', data.sourcesUsed);
      }
    } else if (response.status === 404) {
      console.log('❌ Backend still returning 404');
      console.log('Error message:', data.error);
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing fix:', error);
  }
}

testFixVerification(); 