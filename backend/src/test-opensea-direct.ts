// Direct OpenSea API test to debug the 404 error
import fetch from 'node-fetch';

const OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaDirect() {
  console.log('🧪 Direct OpenSea API Test...');
  console.log(`🔑 Using API Key: ${OPENSEA_API_KEY.substring(0, 8)}...`);
  
  // Test 1: Basic collections endpoint
  console.log('\n📡 Test 1: Basic collections endpoint');
  try {
    const response1 = await fetch('https://api.opensea.io/api/v1/collections?limit=1', {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response1.status}`);
    console.log(`Headers:`, Object.fromEntries(response1.headers.entries()));
    
    if (response1.ok) {
      const data1: any = await response1.json();
      console.log(`✅ Success! Found ${data1.collections?.length || 0} collections`);
    } else {
      const error1 = await response1.text();
      console.log(`❌ Error: ${error1}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 2: Search for Axie Infinity
  console.log('\n📡 Test 2: Search for Axie Infinity');
  try {
    const searchUrl = 'https://api.opensea.io/api/v1/collections?search=axie&limit=5';
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
        console.log('First collection:', {
          name: data2.collections[0].name,
          slug: data2.collections[0].slug,
          stats: data2.collections[0].stats
        });
      }
    } else {
      const error2 = await response2.text();
      console.log(`❌ Error: ${error2}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 3: Try different search terms
  console.log('\n📡 Test 3: Search for "cryptokitties"');
  try {
    const searchUrl = 'https://api.opensea.io/api/v1/collections?search=cryptokitties&limit=5';
    const response3 = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response3.status}`);
    
    if (response3.ok) {
      const data3: any = await response3.json();
      console.log(`✅ Success! Found ${data3.collections?.length || 0} collections`);
    } else {
      const error3 = await response3.text();
      console.log(`❌ Error: ${error3}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 4: Check API documentation endpoint
  console.log('\n📡 Test 4: Check API status');
  try {
    const response4 = await fetch('https://api.opensea.io/api/v1/collections', {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response4.status}`);
    console.log(`Headers:`, Object.fromEntries(response4.headers.entries()));
    
    if (response4.ok) {
      const data4: any = await response4.json();
      console.log(`✅ API is working!`);
    } else {
      const error4 = await response4.text();
      console.log(`❌ Error: ${error4}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  console.log('\n✅ Direct OpenSea API test completed!');
}

// Run the test
testOpenSeaDirect().catch(console.error);
