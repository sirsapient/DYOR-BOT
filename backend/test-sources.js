const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDataSources() {
  console.log('=== Testing Data Sources ===');
  
  // Test 1: CoinGecko directly
  try {
    console.log('\n1. Testing CoinGecko API directly...');
    const cgResponse = await fetch('https://api.coingecko.com/api/v3/coins/list');
    console.log('CoinGecko status:', cgResponse.status);
    if (cgResponse.ok) {
      const cgData = await cgResponse.json();
      console.log('CoinGecko coins count:', cgData.length);
      
      // Look for Bitcoin
      const bitcoin = cgData.find(coin => 
        coin.id === 'bitcoin' || 
        coin.name.toLowerCase() === 'bitcoin' || 
        coin.symbol.toLowerCase() === 'btc'
      );
      console.log('Bitcoin found in CoinGecko:', !!bitcoin);
      if (bitcoin) {
        console.log('Bitcoin data:', bitcoin);
      }
    } else {
      console.log('CoinGecko error:', await cgResponse.text());
    }
  } catch (error) {
    console.error('CoinGecko test failed:', error);
  }
  
  // Test 2: Check if our backend is actually calling CoinGecko
  try {
    console.log('\n2. Testing backend with detailed logging...');
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'bitcoin' })
    });
    
    console.log('Backend status:', response.status);
    const data = await response.json();
    console.log('Backend response:', data);
    
    if (response.status === 404) {
      console.log('❌ Backend returned 404 even for bitcoin');
      console.log('This suggests the data sources are not working properly');
    }
  } catch (error) {
    console.error('Backend test failed:', error);
  }
  
  // Test 3: Check environment variables
  console.log('\n3. Environment variables check:');
  console.log('IGDB_CLIENT_ID:', process.env.IGDB_CLIENT_ID ? 'SET' : 'MISSING');
  console.log('IGDB_CLIENT_SECRET:', process.env.IGDB_CLIENT_SECRET ? 'SET' : 'MISSING');
  console.log('ETHERSCAN_API_KEY:', process.env.ETHERSCAN_API_KEY ? 'SET' : 'MISSING');
  console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? 'SET' : 'MISSING');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING');
  console.log('SERPAPI_KEY:', process.env.SERPAPI_KEY ? 'SET' : 'MISSING');
}

testDataSources(); 