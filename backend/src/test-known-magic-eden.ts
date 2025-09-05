// Test Magic Eden API with Known Solana NFT Projects
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testKnownMagicEdenProjects() {
  console.log('🔍 Testing Magic Eden API with Known Solana NFT Projects...\n');
  
  const apiKey = process.env.MAGIC_EDEN_API_KEY;
  
  // Known popular Solana NFT collections
  const knownCollections = [
    'degods',
    'okay_bears', 
    'solana_monkey_business',
    'degenerate_ape_academy',
    'aurory',
    'star_atlas',
    'famous_fox_federation',
    'pesky_penguins',
    'thugbirdz',
    'galactic_geckos'
  ];
  
  try {
    // First, let's get a broader list of collections to see what's available
    console.log('📋 Fetching collections from Magic Eden...\n');
    
    const searchUrl = `https://api-mainnet.magiceden.io/v2/collections?offset=0&limit=100`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'DYOR-BOT/1.0'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(searchUrl, { headers });
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }
    
    const collections = await response.json();
    console.log(`✅ Retrieved ${collections.length} collections\n`);
    
    // Show all collection names and symbols
    console.log('📋 All available collections:');
    collections.forEach((collection: any, index: number) => {
      console.log(`${index + 1}. ${collection.name} (${collection.symbol})`);
    });
    
    console.log('\n🔍 Testing known collections:');
    
    // Test each known collection
    for (const knownCollection of knownCollections) {
      console.log(`\n🔍 Testing: ${knownCollection}`);
      
      // Check if it exists in the list
      const found = collections.find((collection: any) => 
        collection.symbol === knownCollection || 
        collection.name.toLowerCase().includes(knownCollection.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ Found: ${found.name} (${found.symbol})`);
        
        // Try to get detailed data for this collection
        try {
          const [collectionResponse, statsResponse] = await Promise.all([
            fetch(`https://api-mainnet.magiceden.io/v2/collections/${found.symbol}`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'DYOR-BOT/1.0',
                ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
              }
            }),
            fetch(`https://api-mainnet.magiceden.io/v2/collections/${found.symbol}/stats`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'DYOR-BOT/1.0',
                ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
              }
            })
          ]);
          
          if (collectionResponse.ok && statsResponse.ok) {
            const collectionData = await collectionResponse.json();
            const statsData = await statsResponse.json();
            
            console.log(`   Floor Price: ${statsData.floorPrice} SOL`);
            console.log(`   Listed: ${statsData.listedCount}`);
            console.log(`   Volume 24h: ${statsData.volume24hr || 'N/A'}`);
            console.log(`   Total Volume: ${statsData.volumeAll || 'N/A'}`);
            console.log(`   Description: ${collectionData.description?.substring(0, 100)}...`);
          } else {
            console.log(`   ❌ Could not fetch detailed data`);
          }
        } catch (error) {
          console.log(`   ❌ Error fetching details: ${error}`);
        }
      } else {
        console.log(`❌ Not found in current results`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testKnownMagicEdenProjects();
