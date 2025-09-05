// Test Elumia for Magic Eden NFT Data
import { NFTService } from './nft-service';
import { ProjectDatabase } from './project-database';

async function testElumiaMagicEden() {
  console.log('🧪 Testing Elumia for Magic Eden NFT Data...\n');
  
  const nftService = NFTService.getInstance();
  const projectDatabase = new ProjectDatabase();
  
  try {
    // Check our project database for Elumia
    console.log('📋 Checking project database for Elumia...');
    const elumiaReference = projectDatabase.getProjectReference('Elumia');
    
    if (elumiaReference) {
      console.log('✅ Found Elumia in project database:');
      console.log(`   Data Quality: ${elumiaReference.dataQuality}`);
      console.log(`   Search Count: ${elumiaReference.searchCount}`);
      console.log(`   Last Updated: ${elumiaReference.lastUpdated}`);
      console.log(`   Known URLs: ${Object.keys(elumiaReference.knownUrls).length}`);
      console.log(`   Contract Addresses: ${Object.keys(elumiaReference.contractAddresses).length}`);
      
      if (Object.keys(elumiaReference.knownUrls).length > 0) {
        console.log('\n📋 Known URLs:');
        Object.entries(elumiaReference.knownUrls).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
    } else {
      console.log('❌ Elumia not found in project database');
    }
    
    console.log('\n🔍 Testing NFT search for Elumia...');
    
    // Test different variations of Elumia
    const elumiaVariations = [
      'Elumia',
      'elumia',
      'Elumia Crowns',
      'Elumia NFT',
      'Elumia Game'
    ];
    
    for (const variation of elumiaVariations) {
      console.log(`\n🔍 Testing: "${variation}"`);
      
      const results = await nftService.searchNFTs(variation);
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} NFT collections for "${variation}"`);
        
        results.forEach((collection, index) => {
          console.log(`  ${index + 1}. ${collection.collectionName}`);
          console.log(`     Marketplace: ${collection.marketplace.toUpperCase()}`);
          console.log(`     Network: ${collection.network.toUpperCase()}`);
          console.log(`     Floor Price: ${collection.floorPrice} ${collection.floorPriceCurrency}`);
          console.log(`     Total Supply: ${collection.totalSupply?.toLocaleString() || 'N/A'}`);
          console.log(`     Volume 24h: ${collection.volume24h || 'N/A'}`);
          console.log(`     Volume Total: ${collection.volumeTotal || 'N/A'}`);
          console.log(`     Listed: ${collection.listed || 'N/A'}`);
          console.log(`     Collection URL: ${collection.collectionUrl}`);
          
          if (collection.lifetimeValue) {
            console.log(`     Lifetime Value:`);
            console.log(`       Total Volume: ${collection.lifetimeValue.totalVolume}`);
            console.log(`       Total Sales: ${collection.lifetimeValue.totalSales}`);
            console.log(`       Average Price: ${collection.lifetimeValue.averagePrice}`);
            console.log(`       Highest Sale: ${collection.lifetimeValue.highestSale}`);
            console.log(`       Lowest Sale: ${collection.lifetimeValue.lowestSale}`);
          }
          console.log('');
        });
      } else {
        console.log(`❌ No NFT collections found for "${variation}"`);
      }
    }
    
    console.log('\n🎉 Elumia Magic Eden test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Elumia:', error);
  }
}

testElumiaMagicEden();
