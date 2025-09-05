// Debug Magic Eden API Response
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugMagicEdenAPI() {
  console.log('🔍 Debugging Magic Eden API Response...\n');
  
  const apiKey = process.env.MAGIC_EDEN_API_KEY;
  
  try {
    const searchUrl = `https://api-mainnet.magiceden.io/v2/collections?offset=0&limit=20`;
    
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
    
    // Show first 10 collections
    console.log('📋 First 10 collections:');
    collections.slice(0, 10).forEach((collection: any, index: number) => {
      console.log(`${index + 1}. ${collection.name} (${collection.symbol})`);
    });
    
    console.log('\n🔍 Testing search for "degods":');
    const filteredCollections = collections.filter((collection: any) => 
      collection.name && collection.name.toLowerCase().includes('degods')
    );
    console.log(`Found ${filteredCollections.length} matches for "degods"`);
    filteredCollections.forEach((collection: any) => {
      console.log(`  - ${collection.name} (${collection.symbol})`);
    });
    
    console.log('\n🔍 Testing search for "okay":');
    const okayCollections = collections.filter((collection: any) => 
      collection.name && collection.name.toLowerCase().includes('okay')
    );
    console.log(`Found ${okayCollections.length} matches for "okay"`);
    okayCollections.forEach((collection: any) => {
      console.log(`  - ${collection.name} (${collection.symbol})`);
    });
    
    console.log('\n🔍 Testing search for "ape":');
    const apeCollections = collections.filter((collection: any) => 
      collection.name && collection.name.toLowerCase().includes('ape')
    );
    console.log(`Found ${apeCollections.length} matches for "ape"`);
    apeCollections.forEach((collection: any) => {
      console.log(`  - ${collection.name} (${collection.symbol})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugMagicEdenAPI();
