// Test script for NFT Service
import { NFTService } from './nft-service';

async function testNFTService() {
  console.log('🧪 Testing NFT Service...');
  
  const nftService = NFTService.getInstance();
  
  // Test with a known Web3 game
  const testProjects = [
    'Axie Infinity',
    'The Sandbox',
    'Decentraland',
    'CryptoKitties'
  ];
  
  for (const project of testProjects) {
    console.log(`\n🔍 Testing NFT search for: ${project}`);
    
    try {
      const nftCollections = await nftService.searchNFTs(project);
      
      if (nftCollections.length > 0) {
        console.log(`✅ Found ${nftCollections.length} NFT collections for ${project}`);
        
        const topNFT = nftService.getTopNFT(nftCollections);
        if (topNFT) {
          console.log(`🏆 Top NFT Collection: ${topNFT.collectionName}`);
          console.log(`   Marketplace: ${topNFT.marketplace}`);
          console.log(`   Network: ${topNFT.network}`);
          console.log(`   Floor Price: ${topNFT.floorPrice} ${topNFT.floorPriceCurrency}`);
          console.log(`   Total Volume: ${topNFT.volumeTotal} ${topNFT.floorPriceCurrency}`);
          
          if (topNFT.lifetimeValue) {
            console.log(`   Lifetime Value:`);
            console.log(`     Total Volume: ${topNFT.lifetimeValue.totalVolume}`);
            console.log(`     Total Sales: ${topNFT.lifetimeValue.totalSales}`);
            console.log(`     Average Price: ${topNFT.lifetimeValue.averagePrice}`);
            console.log(`     Highest Sale: ${topNFT.lifetimeValue.highestSale}`);
            console.log(`     Lowest Sale: ${topNFT.lifetimeValue.lowestSale}`);
          }
        }
      } else {
        console.log(`⚠️ No NFT collections found for ${project}`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${project}:`, error);
    }
  }
  
  console.log('\n✅ NFT Service test completed!');
}

// Run the test
testNFTService().catch(console.error);

