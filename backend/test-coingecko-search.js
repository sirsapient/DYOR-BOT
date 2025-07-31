const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCoinGeckoSearch() {
  console.log('=== Testing CoinGecko Search Logic ===');
  
  try {
    // Get all coins from CoinGecko
    const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!listRes.ok) {
      console.error('Failed to fetch CoinGecko list');
      return;
    }
    
    const coins = await listRes.json();
    console.log('Total coins:', coins.length);
    
    // Test search terms
    const searchTerms = ['bitcoin', 'btc', 'ethereum', 'eth', 'axie infinity', 'axie'];
    
    for (const term of searchTerms) {
      console.log(`\n--- Testing search term: "${term}" ---`);
      
      const lowerTerm = term.toLowerCase();
      
      // Test exact matches
      const exactIdMatches = coins.filter(c => c.id.toLowerCase() === lowerTerm);
      const exactNameMatches = coins.filter(c => c.name.toLowerCase() === lowerTerm);
      const exactSymbolMatches = coins.filter(c => c.symbol.toLowerCase() === lowerTerm);
      
      console.log('Exact ID matches:', exactIdMatches.length);
      console.log('Exact name matches:', exactNameMatches.length);
      console.log('Exact symbol matches:', exactSymbolMatches.length);
      
      if (exactIdMatches.length > 0) {
        console.log('First exact ID match:', exactIdMatches[0]);
      }
      if (exactNameMatches.length > 0) {
        console.log('First exact name match:', exactNameMatches[0]);
      }
      if (exactSymbolMatches.length > 0) {
        console.log('First exact symbol match:', exactSymbolMatches[0]);
      }
      
      // Test partial matches
      const partialIdMatches = coins.filter(c => c.id.toLowerCase().includes(lowerTerm));
      const partialNameMatches = coins.filter(c => c.name.toLowerCase().includes(lowerTerm));
      const partialSymbolMatches = coins.filter(c => c.symbol.toLowerCase().includes(lowerTerm));
      
      console.log('Partial ID matches:', partialIdMatches.length);
      console.log('Partial name matches:', partialNameMatches.length);
      console.log('Partial symbol matches:', partialSymbolMatches.length);
      
      if (partialIdMatches.length > 0) {
        console.log('First 3 partial ID matches:', partialIdMatches.slice(0, 3));
      }
      if (partialNameMatches.length > 0) {
        console.log('First 3 partial name matches:', partialNameMatches.slice(0, 3));
      }
      if (partialSymbolMatches.length > 0) {
        console.log('First 3 partial symbol matches:', partialSymbolMatches.slice(0, 3));
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCoinGeckoSearch(); 