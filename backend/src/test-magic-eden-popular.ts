// Test Magic Eden API with Popular Collections
import { NFTService } from './nft-service';

async function testPopularCollections() {
  console.log('🧪 Testing Magic Eden API with Popular Collections...\n');
  
  const nftService = NFTService.getInstance();
  
  try {
    // Test with popular collections that should be in top results
    const testProjects = [
      'degods',
      'okay_bears',
      'solana_monkey_business',
      'degenerate_ape_academy'
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
          console.log('');
        });
      } else {
        console.log(`❌ No NFT collections found for ${projectName}`);
      }
      
      console.log('---\n');
    }
    
    console.log('🎉 Popular collections test completed!');
    
  } catch (error) {
    console.error('❌ Error testing popular collections:', error);
  }
}

testPopularCollections();
