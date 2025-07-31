const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSimpleBitcoin() {
  try {
    console.log('🔍 Testing production API with Bitcoin (should definitely work)...');
    
    const response = await fetch('https://dyor-bot.onrender.com/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'bitcoin' })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('Project name:', data.projectName);
      console.log('Sources used:', data.sourcesUsed);
      console.log('Has confidence:', 'confidence' in data);
      if (data.confidence) {
        console.log('Confidence score:', data.confidence.overall?.score);
        console.log('Confidence grade:', data.confidence.overall?.grade);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      
      // This is very strange - Bitcoin should definitely be found
      console.log('\n🔍 This is unexpected - Bitcoin should definitely be found in CoinGecko.');
      console.log('Let me test CoinGecko directly...');
      
      try {
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
        console.log('CoinGecko direct test status:', cgResponse.status);
        if (cgResponse.ok) {
          const cgData = await cgResponse.json();
          console.log('✅ CoinGecko has Bitcoin data:', cgData.name);
          console.log('This suggests the issue is in the backend logic, not the external APIs.');
        }
      } catch (e) {
        console.log('❌ CoinGecko direct test failed:', e.message);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSimpleBitcoin(); 