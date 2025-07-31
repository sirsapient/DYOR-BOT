const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBackendSearchLogic() {
  console.log('=== Testing Backend Search Logic ===');
  
  const projectName = 'Axie Infinity';
  console.log('Searching for:', projectName);
  
  // Simulate the backend's alias collection logic
  let aliases = [projectName];
  console.log('Initial aliases:', aliases);
  
  try {
    // Get all coins from CoinGecko (like the backend does)
    const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!listRes.ok) {
      console.error('Failed to fetch CoinGecko list');
      return;
    }
    
    const coins = await listRes.json();
    console.log('Total coins available:', coins.length);
    
    // Simulate the backend's search logic
    let candidates = [];
    
    // Step 1: Try all aliases for exact id, name matches
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      console.log(`\nTrying alias: "${alias}" (lowercase: "${lowerAlias}")`);
      
      candidates = coins.filter((c) => 
        c.id.toLowerCase() === lowerAlias || 
        c.name.toLowerCase() === lowerAlias
      );
      
      console.log(`Exact matches for "${alias}":`, candidates.length);
      if (candidates.length > 0) {
        console.log('First match:', candidates[0]);
        break;
      }
    }
    
    // Step 2: If no exact matches, try partial matches
    if (candidates.length === 0) {
      console.log('\nNo exact matches found, trying partial matches...');
      
      for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        console.log(`\nTrying partial match for: "${alias}"`);
        
        candidates = coins.filter((c) => 
          c.id.toLowerCase().includes(lowerAlias) || 
          c.name.toLowerCase().includes(lowerAlias)
        );
        
        console.log(`Partial matches for "${alias}":`, candidates.length);
        if (candidates.length > 0) {
          console.log('First 3 partial matches:', candidates.slice(0, 3));
          break;
        }
      }
    }
    
    // Step 3: Check if we found any candidates
    if (candidates.length > 0) {
      console.log('\n✅ Found candidates!');
      console.log('First candidate:', candidates[0]);
      
      // Simulate fetching detailed data
      const coinId = candidates[0].id;
      console.log('Would fetch detailed data for coin ID:', coinId);
      
      const detailRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      if (detailRes.ok) {
        const coinData = await detailRes.json();
        console.log('✅ Successfully fetched detailed data');
        console.log('Coin name:', coinData.name);
        console.log('Coin symbol:', coinData.symbol);
        console.log('Market cap:', coinData.market_data?.market_cap?.usd);
      } else {
        console.log('❌ Failed to fetch detailed data');
      }
    } else {
      console.log('\n❌ No candidates found');
      console.log('This explains why the backend returns 404');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBackendSearchLogic(); 