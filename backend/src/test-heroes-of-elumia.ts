// Test Heroes of Elumia NFT Collection on Magic Eden
import { NFTService } from './nft-service';

async function testHeroesOfElumia() {
  console.log('🧪 Testing Heroes of Elumia NFT Collection...\n');
  
  const nftService = NFTService.getInstance();
  
  try {
    // Test the correct collection name
    const collectionNames = [
      'Heroes of Elumia',
      'heroes_of_elumia',
      'heroes-of-elumia',
      'Elumia Heroes',
      'Elumia'
    ];
    
    for (const collectionName of collectionNames) {
      console.log(`🔍 Testing NFT search for: "${collectionName}"`);
      
      const results = await nftService.searchNFTs(collectionName);
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} NFT collections for "${collectionName}"`);
        
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
        console.log(`❌ No NFT collections found for "${collectionName}"`);
      }
      
      console.log('---\n');
    }
    
    console.log('🎉 Heroes of Elumia test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Heroes of Elumia:', error);
  }
}

testHeroesOfElumia();
