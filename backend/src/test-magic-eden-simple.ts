// Simple Magic Eden API Test
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMagicEdenAPI() {
  console.log('🧪 Testing Magic Eden API Key and Endpoint...\n');
  
  const apiKey = process.env.MAGIC_EDEN_API_KEY;
  console.log(`API Key loaded: ${apiKey ? 'Yes' : 'No'}`);
  console.log(`API Key (first 10 chars): ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'}`);
  
  // Test different Magic Eden API endpoints
  const endpoints = [
    'https://api-mainnet.magiceden.io/v2/collections',
    'https://api-mainnet.magiceden.io/v2/collections?limit=5',
    'https://api-mainnet.magiceden.io/v2/collections/degods/stats',
    'https://api-mainnet.magiceden.io/v2/collections/degods'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing endpoint: ${endpoint}`);
    
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'DYOR-BOT/1.0'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-Key'] = apiKey;
      }
      
      const response = await fetch(endpoint, { headers });
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Data keys: ${Object.keys(data).join(', ')}`);
        if (Array.isArray(data)) {
          console.log(`Array length: ${data.length}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error}`);
    }
  }
}

testMagicEdenAPI();
