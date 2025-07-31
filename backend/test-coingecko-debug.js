const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugCoinGeckoSearch() {
  try {
    console.log('=== Debugging CoinGecko Search Logic ===');
    
    const projectName = 'Axie Infinity';
    let aliases = [projectName];
    console.log('Initial aliases:', aliases);
    
    // Step 1: Fetch all coins
    console.log('\n1. Fetching CoinGecko coin list...');
    const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!listRes.ok) {
      console.log('❌ Failed to fetch coin list:', listRes.status, listRes.statusText);
      return;
    }
    
    const coins = await listRes.json();
    console.log(`✅ Fetched ${coins.length} coins from CoinGecko`);
    
    // Step 2: Try exact matches
    console.log('\n2. Trying exact matches...');
    let candidates = [];
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      console.log(`  Checking alias: "${alias}" (lowercase: "${lowerAlias}")`);
      
      candidates = coins.filter((c) => {
        const idMatch = c.id.toLowerCase() === lowerAlias;
        const nameMatch = c.name.toLowerCase() === lowerAlias;
        if (idMatch || nameMatch) {
          console.log(`    ✅ Found exact match: ${c.id} (${c.name})`);
        }
        return idMatch || nameMatch;
      });
      
      if (candidates.length) {
        console.log(`  ✅ Found ${candidates.length} exact matches for "${alias}"`);
        break;
      } else {
        console.log(`  ❌ No exact matches for "${alias}"`);
      }
    }
    
    // Step 3: Try partial matches if no exact matches
    if (!candidates.length) {
      console.log('\n3. Trying partial matches...');
      for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        console.log(`  Checking partial matches for: "${alias}"`);
        
        candidates = coins.filter((c) => {
          const idContains = c.id.toLowerCase().includes(lowerAlias);
          const nameContains = c.name.toLowerCase().includes(lowerAlias);
          if (idContains || nameContains) {
            console.log(`    ✅ Found partial match: ${c.id} (${c.name})`);
          }
          return idContains || nameContains;
        });
        
        if (candidates.length) {
          console.log(`  ✅ Found ${candidates.length} partial matches for "${alias}"`);
          break;
        } else {
          console.log(`  ❌ No partial matches for "${alias}"`);
        }
      }
    }
    
    // Step 4: Show top candidates
    if (candidates.length > 0) {
      console.log('\n4. Top candidates found:');
      candidates.slice(0, 5).forEach((coin, i) => {
        console.log(`  ${i + 1}. ${coin.id} (${coin.name})`);
      });
      
      // Step 5: Try to fetch detailed data for first candidate
      console.log('\n5. Fetching detailed data for first candidate...');
      const coinId = candidates[0].id;
      console.log(`  Fetching details for: ${coinId}`);
      
      const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        console.log('  ✅ Successfully fetched detailed data');
        console.log('  Name:', cgData.name);
        console.log('  Symbol:', cgData.symbol);
        console.log('  Has description:', !!cgData.description?.en);
        console.log('  Has market data:', !!cgData.market_data);
      } else {
        console.log('  ❌ Failed to fetch detailed data:', cgRes.status, cgRes.statusText);
      }
    } else {
      console.log('\n❌ No candidates found at all');
      
      // Step 6: Search for "axie" specifically
      console.log('\n6. Searching for "axie" specifically...');
      const axieCandidates = coins.filter((c) => 
        c.id.toLowerCase().includes('axie') || 
        c.name.toLowerCase().includes('axie')
      );
      console.log(`Found ${axieCandidates.length} coins containing "axie":`);
      axieCandidates.slice(0, 10).forEach((coin, i) => {
        console.log(`  ${i + 1}. ${coin.id} (${coin.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugCoinGeckoSearch(); 