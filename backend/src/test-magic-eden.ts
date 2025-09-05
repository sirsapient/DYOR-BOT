// Test Magic Eden API Integration
import { NFTService } from './nft-service';

async function testMagicEdenIntegration() {
  console.log('🧪 Testing Magic Eden API Integration...\n');
  
  const nftService = NFTService.getInstance();
  
  try {
    // Test with a popular Solana NFT project
    const testProjects = [
      'Degenerate Ape Academy',
      'Solana Monkey Business',
      'Aurory',
      'Star Atlas'
    ];
    
    for (const projectName of testProjects) {
      console.log(`🔍 Testing NFT search for: ${projectName}`);
      
      const results = await nftService.searchNFTs(projectName);
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} NFT collections for ${projectName}`);
        
        results.forEach((collection, index) => {
          console.log(`  ${index + 1}. ${collection.collectionName}`);
          console.log(`     Marketplace: ${collection.marketplace.toUpperCase()}`);
          console.log(`     Network: ${collection.network.toUpperCase()}`);
          console.log(`     Floor Price: ${collection.floorPrice} ${collection.floorPriceCurrency}`);
          console.log(`     Total Supply: ${collection.totalSupply?.toLocaleString() || 'N/A'}`);
          console.log(`     Volume 24h: ${collection.volume24h || 'N/A'}`);
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
        console.log(`❌ No NFT collections found for ${projectName}`);
      }
      
      console.log('---\n');
    }
    
    console.log('🎉 Magic Eden API integration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Magic Eden integration:', error);
  }
}

// Run the test
testMagicEdenIntegration();
