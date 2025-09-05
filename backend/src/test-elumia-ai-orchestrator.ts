// Test Elumia with AI Orchestrator to find Heroes of Elumia NFTs
import { conductAIOrchestratedResearch } from './ai-research-orchestrator';
import { NFTService } from './nft-service';

async function testElumiaWithAIOrchestrator() {
  console.log('🧪 Testing Elumia with AI Orchestrator...\n');
  
  try {
    // Mock data collection functions for testing
    const mockDataCollectionFunctions = {
      fetchWhitepaperUrl: async () => null,
      fetchPdfBuffer: async () => null,
      extractTokenomicsFromWhitepaper: async () => null,
      searchProjectSpecificTokenomics: async () => null,
      fetchTwitterProfileAndTweets: async () => null,
      fetchEnhancedTwitterData: async () => null,
      fetchDiscordServerData: async () => null,
      fetchRedditCommunityData: async () => null,
      fetchRedditRecentPosts: async () => null,
      discoverSocialMediaLinks: async () => null,
      fetchSteamDescription: async () => '',
      fetchWebsiteAboutSection: async () => '',
      fetchRoninTokenData: async () => null,
      fetchRoninTransactionHistory: async () => null,
      discoverOfficialUrlsWithAI: async () => null,
      findOfficialSourcesForEstablishedProject: async () => null,
      searchContractAddressWithLLM: async () => null,
      getFinancialDataFromAlternativeSources: async () => null,
      searchNFTs: async (projectName: string) => {
        console.log(`🎨 NFT Service called with: "${projectName}"`);
        const nftService = NFTService.getInstance();
        return await nftService.searchNFTs(projectName);
      }
    };
    
    // Test with Elumia
    console.log('🔍 Testing AI Orchestrator with Elumia...');
    
    const result = await conductAIOrchestratedResearch(
      'Elumia',
      process.env.ANTHROPIC_API_KEY || 'test-key',
      {
        name: 'Elumia',
        aliases: ['Elumia', 'Heroes of Elumia', 'Elumia Heroes']
      },
      mockDataCollectionFunctions
    );
    
    console.log('\n📊 AI Orchestrator Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📈 Total Data Points: ${result.totalDataPoints}`);
    console.log(`🎯 Confidence: ${result.confidence}`);
    console.log(`🔍 Sources Found: ${result.successfulSources}`);
    
    // Check if NFT data was found
    if (result.findings && result.findings.nft_data && result.findings.nft_data.found) {
      console.log('\n🎨 NFT Data Found:');
      const nftData = result.findings.nft_data.data;
      console.log(`   Collections: ${nftData.totalCollections}`);
      console.log(`   Search Terms Used: ${nftData.searchTerms.join(', ')}`);
      
      if (nftData.nftCollections) {
        nftData.nftCollections.forEach((collection: any, index: number) => {
          console.log(`   ${index + 1}. ${collection.collectionName} (${collection.marketplace})`);
        });
      }
    } else {
      console.log('\n❌ No NFT data found');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testElumiaWithAIOrchestrator();
