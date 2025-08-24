// Detailed OpenSea search test
import fetch from 'node-fetch';

const OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaSearch() {
  console.log('🧪 Detailed OpenSea Search Test...');
  console.log(`🔑 Using API Key: ${OPENSEA_API_KEY.substring(0, 8)}...`);
  
  // Test 1: Search for "axie"
  console.log('\n📡 Test 1: Search for "axie"');
  try {
    const searchUrl = 'https://api.opensea.io/api/v2/collections?search=axie&limit=10';
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
        'User-Agent': 'DYOR-BOT/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`URL: ${searchUrl}`);
    
    if (response.ok) {
      const data: any = await response.json();
      console.log(`✅ Success! Found ${data.collections?.length || 0} collections`);
      
      if (data.collections && data.collections.length > 0) {
        console.log('\nFound collections:');
        data.collections.forEach((col: any, i: number) => {
          console.log(`  ${i + 1}. ${col.name} (${col.slug})`);
          console.log(`     Description: ${col.description?.substring(0, 100)}...`);
          console.log(`     Stats:`, col.stats);
        });
      }
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 2: Search for "infinity"
  console.log('\n📡 Test 2: Search for "infinity"');
  try {
    const searchUrl = 'https://api.opensea.io/api/v2/collections?search=infinity&limit=10';
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
      console.log(`✅ Success! Found ${data.collections?.length || 0} collections`);
      
      if (data.collections && data.collections.length > 0) {
        console.log('\nFound collections:');
        data.collections.forEach((col: any, i: number) => {
          console.log(`  ${i + 1}. ${col.name} (${col.slug})`);
        });
      }
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 3: Get all collections and search manually
  console.log('\n📡 Test 3: Get all collections and search manually');
  try {
    const searchUrl = 'https://api.opensea.io/api/v2/collections?limit=50';
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
      console.log(`✅ Success! Found ${data.collections?.length || 0} collections`);
      
      // Search for axie-related collections
      const axieCollections = data.collections.filter((col: any) => 
        col.name.toLowerCase().includes('axie') || 
        col.slug.toLowerCase().includes('axie') ||
        col.description?.toLowerCase().includes('axie')
      );
      
      console.log(`\nFound ${axieCollections.length} axie-related collections:`);
      axieCollections.forEach((col: any, i: number) => {
        console.log(`  ${i + 1}. ${col.name} (${col.slug})`);
      });
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
  }
  
  // Test 4: Try to get a specific collection by slug
  console.log('\n📡 Test 4: Try to get specific collection by slug');
  const slugs = ['axie-infinity', 'axie', 'axieinfinity', 'axie-infinity-game'];
  
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
        console.log(`✅ SUCCESS! Found collection: ${data.collection?.name}`);
        console.log(`   Slug: ${data.collection?.slug}`);
        console.log(`   Stats:`, data.collection?.stats);
        break;
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ Exception for ${slug}:`, error);
    }
  }
  
  console.log('\n✅ Detailed OpenSea search test completed!');
}

// Run the test
testOpenSeaSearch().catch(console.error);

