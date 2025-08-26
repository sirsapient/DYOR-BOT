// Test to examine OpenSea API v2 response structure
import fetch from 'node-fetch';

const OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaStructure() {
  console.log('🧪 Examining OpenSea API v2 Response Structure...');
  console.log(`🔑 Using API Key: ${OPENSEA_API_KEY.substring(0, 8)}...`);
  
  // Test 1: Get collections and examine structure
  console.log('\n📡 Test 1: Get collections and examine structure');
  try {
    const searchUrl = 'https://api.opensea.io/api/v2/collections?limit=3';
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data: any = await response.json();
      console.log(`✅ Success! Response structure:`);
      console.log(`Top level keys: ${Object.keys(data).join(', ')}`);
      console.log(`Collections array length: ${data.collections?.length || 0}`);
      
      if (data.collections && data.collections.length > 0) {
        console.log('\nFirst collection structure:');
        const firstCollection = data.collections[0];
        console.log(`All keys: ${Object.keys(firstCollection).join(', ')}`);
        console.log(`Full object:`, JSON.stringify(firstCollection, null, 2));
      }
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 2: Try to get a specific collection
  console.log('\n📡 Test 2: Try to get a specific collection');
  try {
    // Try with a known collection slug
    const slugs = ['boredapeyachtclub', 'cryptokitties', 'doodles-official'];
    
    for (const slug of slugs) {
      try {
        const url = `https://api.opensea.io/api/v2/collection/${slug}`;
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': OPENSEA_API_KEY,
            'User-Agent': 'DYOR-BOT/1.0'
          }
        });
        
        console.log(`\nTrying slug: ${slug}`);
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data: any = await response.json();
          console.log(`✅ SUCCESS! Found collection: ${data.collection?.name || 'Unknown'}`);
          console.log(`Response structure:`, Object.keys(data));
          console.log(`Collection keys:`, Object.keys(data.collection || {}));
          console.log(`Collection data:`, JSON.stringify(data.collection, null, 2));
          break;
        } else {
          const error = await response.text();
          console.log(`❌ Error: ${error.substring(0, 200)}...`);
        }
      } catch (error) {
        console.error(`❌ Exception for ${slug}:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 3: Check if we need different parameters
  console.log('\n📡 Test 3: Check different parameters');
  try {
    const searchUrl = 'https://api.opensea.io/api/v2/collections?chain=ethereum&limit=3';
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data: any = await response.json();
      console.log(`✅ Success with chain parameter!`);
      console.log(`Collections found: ${data.collections?.length || 0}`);
      
      if (data.collections && data.collections.length > 0) {
        console.log('\nFirst collection with chain parameter:');
        const firstCollection = data.collections[0];
        console.log(`All keys: ${Object.keys(firstCollection).join(', ')}`);
        console.log(`Name: ${firstCollection.name}`);
        console.log(`Slug: ${firstCollection.slug}`);
      }
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  console.log('\n✅ OpenSea API v2 structure test completed!');
}

// Run the test
testOpenSeaStructure().catch(console.error);




