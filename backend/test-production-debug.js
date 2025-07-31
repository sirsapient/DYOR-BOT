const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProductionDebug() {
  try {
    console.log('🔍 Testing production API with detailed debugging...');
    
    const response = await fetch('https://dyor-bot.onrender.com/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'bitcoin' })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response keys:', Object.keys(data));
      console.log('Has confidence:', 'confidence' in data);
      if (data.confidence) {
        console.log('Confidence score:', data.confidence.overall?.score);
        console.log('Confidence grade:', data.confidence.overall?.grade);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      
      // Test individual endpoints to see what's failing
      console.log('\n🔍 Testing individual data sources...');
      
      // Test CoinGecko
      try {
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
        console.log('CoinGecko status:', cgResponse.status);
        if (cgResponse.ok) {
          const cgData = await cgResponse.json();
          console.log('✅ CoinGecko working, found:', cgData.name);
        } else {
          console.log('❌ CoinGecko failed');
        }
      } catch (e) {
        console.log('❌ CoinGecko exception:', e.message);
      }
      
      // Test IGDB (this requires API keys)
      console.log('\n🔍 Testing IGDB (requires API keys)...');
      console.log('Note: IGDB requires IGDB_CLIENT_ID and IGDB_CLIENT_SECRET');
      
      // Test Steam
      try {
        const steamResponse = await fetch('https://store.steampowered.com/api/storesearch/?term=bitcoin&cc=us&l=en');
        console.log('Steam status:', steamResponse.status);
        if (steamResponse.ok) {
          const steamData = await steamResponse.json();
          console.log('✅ Steam working, items found:', steamData.items?.length || 0);
        } else {
          console.log('❌ Steam failed');
        }
      } catch (e) {
        console.log('❌ Steam exception:', e.message);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testProductionDebug(); 