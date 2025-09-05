// Test Intelligent Alias Discovery for Elumia
import { intelligentAliasDiscovery } from './intelligent-alias-discovery';

async function testIntelligentAliasDiscovery() {
  console.log('🧠 Testing Intelligent Alias Discovery for Elumia...\n');
  
  try {
    const result = await intelligentAliasDiscovery.discoverAliases('Elumia');
    
    console.log('📊 Alias Discovery Results:');
    console.log(`✅ Success: ${result.confidence > 0.5 ? 'Yes' : 'No'}`);
    console.log(`🎯 Confidence: ${result.confidence}`);
    console.log(`📝 Reasoning: ${result.reasoning}`);
    
    console.log('\n🔍 Discovered Aliases:');
    console.log(`   Project Aliases: ${result.projectAliases.join(', ') || 'None'}`);
    console.log(`   Token Names: ${result.tokenNames.join(', ') || 'None'}`);
    console.log(`   NFT Collections: ${result.nftCollections.join(', ') || 'None'}`);
    
    console.log('\n📄 Website Content Sample:');
    console.log(result.websiteContent.substring(0, 500) + '...');
    
    // Check if we found "Heroes of Elumia"
    const foundHeroesOfElumia = result.nftCollections.some(collection => 
      collection.toLowerCase().includes('heroes') && collection.toLowerCase().includes('elumia')
    ) || result.projectAliases.some(alias => 
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
testIntelligentAliasDiscovery();
