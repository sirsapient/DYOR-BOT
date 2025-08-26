// Test to find current OpenSea API endpoints
import fetch from 'node-fetch';

const OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaCurrent() {
  console.log('🧪 Testing current OpenSea API endpoints...');
  console.log(`🔑 Using API Key: ${OPENSEA_API_KEY.substring(0, 8)}...`);
  
  const endpoints = [
    'https://api.opensea.io/api/v1/collections',
    'https://api.opensea.io/v1/collections',
    'https://api.opensea.io/api/v2/collections',
    'https://api.opensea.io/v2/collections',
    'https://api.opensea.io/collections',
    'https://api.opensea.io/api/collections',
    'https://api.opensea.io/v1/assets',
    'https://api.opensea.io/api/v1/assets',
    'https://api.opensea.io/v2/assets',
    'https://api.opensea.io/api/v2/assets'
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`\n📡 Test ${i + 1}: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': OPENSEA_API_KEY,
          'User-Agent': 'DYOR-BOT/1.0'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data: any = await response.json();
        console.log(`✅ SUCCESS! Endpoint works: ${endpoint}`);
        console.log(`Response keys: ${Object.keys(data).join(', ')}`);
        if (data.collections) {
          console.log(`Collections found: ${data.collections.length}`);
        }
        if (data.assets) {
          console.log(`Assets found: ${data.assets.length}`);
        }
        break; // Found a working endpoint
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`❌ Exception:`, error);
    }
  }
  
  // Test with different parameters
  console.log('\n📡 Testing with parameters...');
  const workingEndpoints = [
    'https://api.opensea.io/api/v1/collections?limit=1',
    'https://api.opensea.io/v1/collections?limit=1',
    'https://api.opensea.io/api/v2/collections?limit=1',
    'https://api.opensea.io/v2/collections?limit=1'
  ];
  
  for (let i = 0; i < workingEndpoints.length; i++) {
    const endpoint = workingEndpoints[i];
    console.log(`\n📡 Parameter Test ${i + 1}: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': OPENSEA_API_KEY,
          'User-Agent': 'DYOR-BOT/1.0'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data: any = await response.json();
        console.log(`✅ SUCCESS! Endpoint with parameters works: ${endpoint}`);
        console.log(`Response structure:`, Object.keys(data));
        break;
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`❌ Exception:`, error);
    }
  }
  
  console.log('\n✅ Current OpenSea API endpoint test completed!');
}

// Run the test
testOpenSeaCurrent().catch(console.error);





