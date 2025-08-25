// Test OpenSea API v2 endpoints
import fetch from 'node-fetch';

const OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaV2() {
  console.log('🧪 Testing OpenSea API v2...');
  console.log(`🔑 Using API Key: ${OPENSEA_API_KEY.substring(0, 8)}...`);
  
  // Test 1: Collections endpoint (v2)
  console.log('\n📡 Test 1: Collections endpoint (v2)');
  try {
    const response1 = await fetch('https://api.opensea.io/v2/collections?chain=ethereum&limit=1', {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response1.status}`);
    
    if (response1.ok) {
      const data1: any = await response1.json();
      console.log(`✅ Success! Found ${data1.collections?.length || 0} collections`);
      if (data1.collections && data1.collections.length > 0) {
        console.log('First collection:', {
          name: data1.collections[0].name,
          slug: data1.collections[0].slug,
          stats: data1.collections[0].stats
        });
      }
    } else {
      const error1 = await response1.text();
      console.log(`❌ Error: ${error1}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 2: Search collections (v2)
  console.log('\n📡 Test 2: Search collections (v2)');
  try {
    const searchUrl = 'https://api.opensea.io/v2/collections?chain=ethereum&search=axie&limit=5';
    const response2 = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response2.status}`);
    console.log(`URL: ${searchUrl}`);
    
    if (response2.ok) {
      const data2: any = await response2.json();
      console.log(`✅ Success! Found ${data2.collections?.length || 0} collections`);
      if (data2.collections && data2.collections.length > 0) {
        console.log('Found collections:');
        data2.collections.forEach((col: any, i: number) => {
          console.log(`  ${i + 1}. ${col.name} (${col.slug})`);
        });
      }
    } else {
      const error2 = await response2.text();
      console.log(`❌ Error: ${error2}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 3: Get specific collection (v2)
  console.log('\n📡 Test 3: Get specific collection (v2)');
  try {
    const collectionUrl = 'https://api.opensea.io/v2/collections/axie-infinity';
    const response3 = await fetch(collectionUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response3.status}`);
    console.log(`URL: ${collectionUrl}`);
    
    if (response3.ok) {
      const data3: any = await response3.json();
      console.log(`✅ Success! Collection: ${data3.collection?.name}`);
      console.log('Collection details:', {
        name: data3.collection?.name,
        description: data3.collection?.description?.substring(0, 100) + '...',
        stats: data3.collection?.stats
      });
    } else {
      const error3 = await response3.text();
      console.log(`❌ Error: ${error3}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 4: Try different collection slug
  console.log('\n📡 Test 4: Try different collection slug');
  try {
    const collectionUrl = 'https://api.opensea.io/v2/collections/cryptokitties';
    const response4 = await fetch(collectionUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response4.status}`);
    
    if (response4.ok) {
      const data4: any = await response4.json();
      console.log(`✅ Success! Collection: ${data4.collection?.name}`);
    } else {
      const error4 = await response4.text();
      console.log(`❌ Error: ${error4}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  console.log('\n✅ OpenSea API v2 test completed!');
}

// Run the test
testOpenSeaV2().catch(console.error);



