// Test Manual Elumia Website Analysis
import { intelligentAliasDiscovery } from './intelligent-alias-discovery';

async function testManualElumiaAnalysis() {
  console.log('🧠 Testing Manual Elumia Website Analysis...\n');
  
  try {
    // Test with a known Elumia website URL
    const testUrl = 'https://elumia.io'; // Known Elumia website
    
    console.log(`🌐 Testing with URL: ${testUrl}`);
    
    // Manually scrape the website
    const websiteContent = await intelligentAliasDiscovery['scrapeWebsiteContent'](testUrl);
    
    if (!websiteContent) {
      console.log('❌ Failed to scrape website content');
      return;
    }
    
    console.log(`📄 Scraped ${websiteContent.length} characters of content`);
    console.log(`📄 Content sample: ${websiteContent.substring(0, 500)}...`);
    
    // Test AI analysis
    const aiAnalysis = await intelligentAliasDiscovery['analyzeContentWithAI']('Elumia', websiteContent, testUrl);
    
    console.log('\n📊 AI Analysis Results:');
    console.log(`🎯 Confidence: ${aiAnalysis.confidence}`);
    console.log(`📝 Reasoning: ${aiAnalysis.reasoning}`);
    
    console.log('\n🔍 Discovered Aliases:');
    console.log(`   Project Aliases: ${aiAnalysis.projectAliases.join(', ') || 'None'}`);
    console.log(`   Token Names: ${aiAnalysis.tokenNames.join(', ') || 'None'}`);
    console.log(`   NFT Collections: ${aiAnalysis.nftCollections.join(', ') || 'None'}`);
    
    // Check if we found "Heroes of Elumia"
    const foundHeroesOfElumia = aiAnalysis.nftCollections.some(collection => 
      collection.toLowerCase().includes('heroes') && collection.toLowerCase().includes('elumia')
    ) || aiAnalysis.projectAliases.some(alias => 
      alias.toLowerCase().includes('heroes') && alias.toLowerCase().includes('elumia')
    );
    
    if (foundHeroesOfElumia) {
      console.log('\n🎉 SUCCESS: Found "Heroes of Elumia" in discovered aliases!');
    } else {
      console.log('\n❌ Did not find "Heroes of Elumia" in discovered aliases');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testManualElumiaAnalysis();
