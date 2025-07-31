const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSearchDebug() {
  try {
    console.log('🔍 Testing CoinGecko search logic step by step...');
    
    // Step 1: Get the coin list
    console.log('Step 1: Fetching CoinGecko coin list...');
    const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!listRes.ok) {
      console.log('❌ Failed to fetch coin list');
      return;
    }
    
    const coins = await listRes.json();
    console.log('✅ Coin list fetched, total coins:', coins.length);
    
    // Step 2: Test search for "bitcoin"
    const projectName = 'bitcoin';
    const aliases = [projectName];
    console.log('Step 2: Searching for aliases:', aliases);
    
    // Test exact matches
    let candidates = [];
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      candidates = coins.filter((c) => c.id.toLowerCase() === lowerAlias || c.name.toLowerCase() === lowerAlias);
      if (candidates.length) {
        console.log('✅ Found exact match for alias:', alias, 'candidates:', candidates.length);
        console.log('First candidate:', candidates[0]);
        break;
      }
    }
    
    if (!candidates.length) {
      console.log('❌ No exact matches found, trying partial matches...');
      for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        candidates = coins.filter((c) => c.id.toLowerCase().includes(lowerAlias) || c.name.toLowerCase().includes(lowerAlias));
        if (candidates.length) {
          console.log('✅ Found partial match for alias:', alias, 'candidates:', candidates.length);
          console.log('First candidate:', candidates[0]);
          break;
        }
      }
    }
    
    if (candidates.length) {
      const coinId = candidates[0].id;
      console.log('Step 3: Fetching detailed data for coin ID:', coinId);
      
      const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        console.log('✅ Detailed data fetched successfully');
        console.log('Coin name:', cgData.name);
        console.log('Coin symbol:', cgData.symbol);
        console.log('This should have been found by the backend!');
      } else {
        console.log('❌ Failed to fetch detailed data:', cgRes.status);
      }
    } else {
      console.log('❌ No candidates found at all - this is the problem!');
      
      // Let's check if "bitcoin" exists in the list at all
      const bitcoinInList = coins.find(c => c.id === 'bitcoin' || c.name === 'Bitcoin');
      console.log('Bitcoin in list:', bitcoinInList);
      
      // Let's also check for partial matches
      const partialMatches = coins.filter(c => 
        c.id.toLowerCase().includes('bitcoin') || 
        c.name.toLowerCase().includes('bitcoin')
      );
      console.log('Partial matches for "bitcoin":', partialMatches.length);
      if (partialMatches.length > 0) {
        console.log('First partial match:', partialMatches[0]);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSearchDebug(); 