// Test OpenSea API integration with provided API key
import { NFTService } from './nft-service';

// Set the API key directly for testing
process.env.OPENSEA_API_KEY = 'd21662735ea248bcbba1c617397cbf36';

async function testOpenSeaIntegration() {
  console.log('🧪 Testing OpenSea API Integration...');
  console.log(`🔑 Using API Key: ${process.env.OPENSEA_API_KEY?.substring(0, 8)}...`);
  
  const nftService = NFTService.getInstance();
  
  // Test with Axie Infinity specifically
  const testProject = 'Axie Infinity';
  
  console.log(`\n🔍 Testing NFT search for: ${testProject}`);
  
  try {
    const nftCollections = await nftService.searchNFTs(testProject);
    
    if (nftCollections.length > 0) {
      console.log(`✅ Found ${nftCollections.length} NFT collections for ${testProject}`);
      
      const topNFT = nftService.getTopNFT(nftCollections);
      if (topNFT) {
        console.log(`\n🏆 Top NFT Collection Details:`);
        console.log(`   Name: ${topNFT.collectionName}`);
        console.log(`   Marketplace: ${topNFT.marketplace}`);
        console.log(`   Network: ${topNFT.network}`);
        console.log(`   Floor Price: ${topNFT.floorPrice} ${topNFT.floorPriceCurrency}`);
        console.log(`   Total Volume: ${topNFT.volumeTotal} ${topNFT.floorPriceCurrency}`);
        console.log(`   24h Volume: ${topNFT.volume24h} ${topNFT.floorPriceCurrency}`);
        console.log(`   Total Supply: ${topNFT.totalSupply?.toLocaleString()}`);
        console.log(`   Owners: ${topNFT.owners?.toLocaleString()}`);
        console.log(`   Listed: ${topNFT.listed?.toLocaleString()}`);
        console.log(`   Collection URL: ${topNFT.collectionUrl}`);
        
        if (topNFT.lifetimeValue) {
          console.log(`\n   📊 Lifetime Value Metrics:`);
          console.log(`     Total Volume: ${topNFT.lifetimeValue.totalVolume.toFixed(2)} ${topNFT.floorPriceCurrency}`);
          console.log(`     Total Sales: ${topNFT.lifetimeValue.totalSales.toLocaleString()}`);
          console.log(`     Average Price: ${topNFT.lifetimeValue.averagePrice.toFixed(4)} ${topNFT.floorPriceCurrency}`);
          console.log(`     Highest Sale: ${topNFT.lifetimeValue.highestSale.toFixed(4)} ${topNFT.floorPriceCurrency}`);
          console.log(`     Lowest Sale: ${topNFT.lifetimeValue.lowestSale.toFixed(4)} ${topNFT.floorPriceCurrency}`);
          console.log(`     Price History Points: ${topNFT.lifetimeValue.priceHistory.length}`);
          console.log(`     Volume History Points: ${topNFT.lifetimeValue.volumeHistory.length}`);
        }
      }
    } else {
      console.log(`⚠️ No NFT collections found for ${testProject}`);
    }
  } catch (error) {
    console.error(`❌ Error testing ${testProject}:`, error);
  }
  
  console.log('\n✅ OpenSea API integration test completed!');
}

// Run the test
testOpenSeaIntegration().catch(console.error);





